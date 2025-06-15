"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";
import { Blog } from "@/lib/definitions";
import { getSession } from "@/lib/session";

const blogValidation = z.object({
  title: z.string(),
  slug: z.string().refine((val) => !val.includes("new-page"), {
    message: "Value cannot contain 'new-page'",
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

export async function save(blog: Blog): Promise<Blog | undefined> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return;
  }

  const oldSlug = blog.slug;
  blog.slug = slugify(blog.title);
  blog.date = new Date();
  blog.tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];

  const result = blogValidation.safeParse(blog);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  const db = await getDB();
  let blogs = db.collection("blogs");
  await blogs.updateOne(
    { slug: oldSlug },
    { $set: result.data },
    { upsert: true },
  );

  return result.data;
}
