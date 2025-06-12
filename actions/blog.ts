"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";
import { Blog } from "@/lib/definitions";
import { getSession } from "@/lib/session";

const blogValidation = z.object({
  title: z.string(),
  slug: z.string(),
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

export async function create(formData: FormData) {
  const title = formData.get("title");
  let slug = "";

  if (typeof title === "string") {
    slug = slugify(title);
  }

  const data = {
    title: title,
    slug: slug,
    summary: "TODO: summary",
    tags: ["test"],
    content: formData.get("content"),
  };

  const result = blogValidation.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    // TODO: handle errors
    return;
  }

  let db = await getDB();
  let blogs = db.collection("blogs");
  await blogs.insertOne(result.data);
}

export async function save(blog: Blog): Promise<Blog | undefined> {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return;
  }

  const oldSlug = blog.slug;
  blog.slug = slugify(blog.title);
  blog.date = new Date();
  blog.tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];

  console.log("Saving blog:", blog);
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
