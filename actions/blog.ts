"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";
import { Blog } from "@/lib/definitions";
import { getSession } from "@/lib/session";

const blogValidation = z.object({
  title: z.string(),
  slug: z.string().refine((val) => val !== "new-page", {
    message: "Url cannot be 'new-page'",
  }),
  tags: z.array(
    z
      .string()
      .regex(/^[a-z]+$/)
      .max(10),
  ),
  date: z.date().default(() => new Date()), // Default to current date
  summary: z
    .string()
    .max(500, { message: "summary must be less then 500 characters" }),
  content: z.string(),
});

export async function save(blog: Blog): Promise<Blog | { error: string }> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return { error: "Not autorized" };
  }

  const oldSlug = blog.slug;
  blog.slug = slugify(blog.title);
  blog.date = new Date();
  blog.tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];

  const result = blogValidation.safeParse(blog);
  if (!result.success) {
    console.error(result.error.flatten());
    return { error: result.error.message };
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
