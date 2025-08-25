"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";
import { Blog } from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { JSDOM } from "jsdom";

const blogValidation = z.object({
  title: z.string(),
  slug: z.string().refine((val) => val !== "new-page", {
    message: "Url cannot be 'new-page'",
  }),
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
  content: z.string(),
});

export async function saveBlog(blog: Blog): Promise<Blog | { error: string }> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return { error: "Not autorized" };
  }

  const oldSlug = blog.slug;
  blog.slug = slugify(blog.title);
  blog.editedDate = oldSlug === "new-page" ? null : new Date();
  blog.tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];
  blog.summary = extractSummaryFromHTML(blog.content, 200);

  const result = blogValidation.safeParse(blog);
  if (!result.success) {
    const issues = result.error.issues;
    const formattedErrors = issues.map((issue) => issue.message);

    return { error: `Validation failed: ${formattedErrors.join(", ")}` };
  }

  try {
    const db = await getDB();
    let blogs = db.collection("blogs");
    await blogs.updateOne(
      { slug: oldSlug },
      { $set: result.data },
      { upsert: true },
    );

    return result.data;
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: `A blog with the slug "${blog.slug}" already exists.` };
    }

    console.error("Unexpected error during save:", error);
    return { error: "Unexpected server error" };
  }
}

export async function deleteBlog(
  slug: string,
): Promise<{ error?: string; sucess: boolean }> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return { sucess: false, error: "Not autorized" };
  }

  try {
    const db = await getDB();
    const blogs = db.collection("blogs");
    const result = await blogs.deleteOne({ slug: slug });

    if (result.deletedCount === 1) {
      return { sucess: true };
    }
  } catch {
    return { sucess: false, error: "Unexpected error" };
  }

  return { sucess: false, error: "Error while deleting the blog" };
}

function extractSummaryFromHTML(html: string, maxLength: number = 500): string {
  const dom = new JSDOM(html);
  const paragraphs = dom.window.document.querySelectorAll("p");

  let summaryParts: string[] = [];
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
