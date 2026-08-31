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

const blogValidation = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1, { message: "Slug must not be empty" }),
  imagePath: z.string().nullable().optional(),
  tags: z.array(
    z
      .string()
      .regex(/^[a-z]+$/)
      .max(20, { message: "Tag must be less than 20 characters" }),
  ),
  createdDate: z.date().default(() => new Date()), // Default to current date
  editedDate: z.date().nullable(),
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

  // The row is located by the slug it was last saved with: the client may
  // hold a newer, not-yet-saved slug (title mirroring or manual edit).
  const oldSlug = previousSlug ?? blog.slug;
  // Respect a slug set in the editor; fall back to deriving it from the title.
  blog.slug = slugify(blog.slug?.trim() ? blog.slug : blog.title);
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

  try {
    const db = await getDB();
    const blogs = db.collection("blogs");

    if (isNew) {
      await blogs.insertOne(result.data);
    } else {
      const updateResult = await blogs.updateOne(
        { slug: oldSlug },
        { $set: result.data },
      );
      if (updateResult.matchedCount === 0) {
        return {
          error:
            "Could not find the post to update. It may have been deleted in another tab.",
        };
      }
    }

    revalidatePath("/blog", "layout");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");

    return result.data;
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
): Promise<{ error?: string; success: boolean }> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  let oldImagePath: string | null | undefined;

  try {
    const db = await getDB();
    const blogs = db.collection("blogs");
    const existing = await blogs.findOne<
      { imagePath?: string | null }
    >({ slug }, { projection: { imagePath: 1 } });
    oldImagePath = existing?.imagePath ?? null;

    const result = await blogs.deleteOne({ slug });

    if (result.deletedCount !== 1) {
      return { success: false, error: "Error while deleting the blog" };
    }

    if (oldImagePath) {
      // best-effort: deletion already committed; log but don't fail the action
      await deleteImage(oldImagePath);
    }

    revalidatePath("/blog", "layout");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return { success: true };
  } catch (error) {
    console.error("deleteBlog error:", error);
    return { success: false, error: "Unexpected error" };
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
