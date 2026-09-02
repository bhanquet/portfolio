"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";
import { Blog } from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { JSDOM } from "jsdom";
import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import { sanitizeHtml } from "@/lib/sanitize";
import { deleteImage } from "@/actions/imageUploader";
import { fetchBlog, fetchBlogGroup, serializeBlog } from "@/lib/data";

const blogValidation = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1, { message: "Slug must not be empty" }),
  locale: z.string().min(2).max(5).default("en"),
  translationGroupId: z.string().min(1),
  imagePath: z.string().nullable().optional(),
  tags: z.array(
    z
      .string()
      .regex(/^[a-z]+$/)
      .max(20, { message: "Tag must be less than 20 characters" }),
  ),
  createdDate: z.coerce.date().default(() => new Date()), // coerce allows ISO string from serialized client props
  editedDate: z.coerce.date().nullable(),
  summary: z
    .string()
    .max(500, { message: "summary must be less then 500 characters" }),
  content: z.string().max(1_000_000, { message: "Content is too large" }),
  public: z.boolean().default(false),
});

export async function saveBlog(
  blog: Blog,
  isNew: boolean,
  previousSlug?: string,
): Promise<Blog | { error: string }> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return { error: "Not authorized" };
  }

  // previousSlug is kept to revalidate the old path when the slug changes.
  // The row is located by translationGroupId+locale, which is stable across slug edits.
  // Respect a slug set in the editor; fall back to deriving it from the title.
  blog.slug = slugify(blog.slug?.trim() ? blog.slug : blog.title);
  blog.locale = (blog.locale || "en").toLowerCase();
  if (!blog.translationGroupId) {
    // Node 22+ has crypto.randomUUID globally; fallback to slug-based
    blog.translationGroupId = globalThis.crypto?.randomUUID?.() ?? `${blog.slug}-${Date.now()}`;
  }
  blog.editedDate = isNew ? null : new Date();
  blog.tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];
  blog.content = sanitizeHtml(blog.content);
  // Respect a manually written summary; fall back to auto-extracting it.
  blog.summary = blog.summary?.trim()
    ? blog.summary.trim()
    : extractSummaryFromHTML(blog.content, 200);

  const result = blogValidation.safeParse(blog);
  if (!result.success) {
    const issues = result.error.issues;
    const formattedErrors = issues.map((issue) => issue.message);

    return { error: `Validation failed: ${formattedErrors.join(", ")}` };
  }

  // For image orphan cleanup: remember old image before update
  let oldImagePathForCleanup: string | null | undefined;

  try {
    const db = await getDB();
    const blogs = db.collection("blogs");

    if (isNew) {
      await blogs.insertOne({ ...result.data } as never);
    } else {
      const filter = {
        translationGroupId: (result.data as Blog).translationGroupId,
        locale: (result.data as Blog).locale,
      };
      // Fetch old image to decide orphan cleanup later
      try {
        const existing = await blogs.findOne<{ imagePath?: string | null }>(filter as never, {
          projection: { imagePath: 1 },
        });
        oldImagePathForCleanup = existing?.imagePath ?? null;
      } catch {
        // ignore fetch error for cleanup
      }
      const updateResult = await blogs.updateOne(filter, { $set: result.data });
      if (updateResult.matchedCount === 0) {
        return {
          error:
            "Could not find the post to update. It may have been deleted in another tab.",
        };
      }
    }

    // Cleanup old cover image only if no other doc still references it
    const newImagePath = (result.data as Blog).imagePath ?? null;
    if (oldImagePathForCleanup && oldImagePathForCleanup !== newImagePath) {
      try {
        const stillUsed = await db
          .collection("blogs")
          .countDocuments({ imagePath: oldImagePathForCleanup } as never);
        if (stillUsed === 0) {
          await deleteImage(oldImagePathForCleanup);
        }
      } catch {
        // best-effort, ignore cleanup errors
      }
    }

    const localePrefix = `/${(result.data as Blog).locale}`;
    const newSlug = (result.data as Blog).slug;
    revalidatePath(`${localePrefix}/blog/${newSlug}`);
    if (previousSlug && previousSlug !== newSlug) {
      revalidatePath(`${localePrefix}/blog/${previousSlug}`);
    }
    revalidatePath(`${localePrefix}/blog`, "layout");
    revalidatePath(localePrefix);
    revalidatePath("/sitemap.xml");

    return serializeBlog(result.data as Blog);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return { error: `A blog with the slug "${blog.slug}" already exists.` };
    }

    console.error("Unexpected error during save:", error);
    return { error: "Unexpected server error" };
  }
}

export async function deleteBlog(
  slug: string,
  locale: string,
): Promise<{ error?: string; success: boolean }> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return { success: false, error: "Not authorized" };
  }
  if (!locale || !slug) {
    return { success: false, error: "Missing slug or locale" };
  }

  let oldImagePath: string | null | undefined;

  try {
    const db = await getDB();
    const blogs = db.collection("blogs");
    const filter: Record<string, unknown> = { slug, locale };
    const existing = await blogs.findOne<
      { imagePath?: string | null; translationGroupId?: string }
    >(filter as never, { projection: { imagePath: 1, translationGroupId: 1 } });
    oldImagePath = existing?.imagePath ?? null;

    const result = await blogs.deleteOne(filter as never);

    if (result.deletedCount !== 1) {
      return { success: false, error: "Error while deleting the blog" };
    }

    if (oldImagePath) {
      // Only delete the file if no remaining blog (any translation group) still references it
      try {
        const stillUsed = await blogs.countDocuments({ imagePath: oldImagePath } as never);
        if (stillUsed === 0) {
          await deleteImage(oldImagePath);
        }
      } catch {
        // best-effort, ignore cleanup errors
      }
    }

    // Revalidate locale-specific paths and the global sitemap
    revalidatePath(`/${locale}/blog/${slug}`);
    revalidatePath(`/${locale}/blog`, "layout");
    revalidatePath(`/${locale}`);
    revalidatePath("/sitemap.xml");
    return { success: true };
  } catch (error) {
    console.error("deleteBlog error:", error);
    return { success: false, error: "Unexpected error" };
  }
}

/**
 * Resolve the slug for a blog post in a target locale via translationGroupId.
 * Used by the language switcher so `/en/blog/my-post` becomes `/fr/blog/mon-article`
 * instead of a 404. Returns null if no public translation exists.
 * Only public targets are returned — navigating to a draft would otherwise 404
 * on the public blog page (which uses publicOnly=true).
 */
export async function getAlternateSlug(
  currentSlug: string,
  currentLocale: string,
  targetLocale: string,
): Promise<string | null> {
  if (!currentSlug || !currentLocale || !targetLocale || currentLocale === targetLocale) return null;
  try {
    const blog = await fetchBlog(currentSlug, false, currentLocale);
    if (!blog?.translationGroupId) return null;
    // Only consider public translations; a draft in the target locale would 404 anyway.
    const group = await fetchBlogGroup(blog.translationGroupId, true);
    const target = group.find((b) => b.locale === targetLocale && b.public === true);
    return target?.slug ?? null;
  } catch {
    return null;
  }
}

function extractSummaryFromHTML(html: string, maxLength: number = 500): string {
  const dom = new JSDOM(html);
  const paragraphs = dom.window.document.querySelectorAll("p");

  const summaryParts: string[] = [];
  let currentLength = 0;

  for (const p of paragraphs) {
    const text = p.textContent?.trim() ?? "";
    if (!text) continue;

    if (currentLength + text.length > maxLength) {
      const remaining = maxLength - currentLength;
      summaryParts.push(text.slice(0, remaining));
      currentLength = maxLength;
      break;
    }

    summaryParts.push(text);
    currentLength += text.length;
  }

  const summary = summaryParts.join(" ").trim();
  return summary.length > maxLength ? summary + "…" : summary;
}
