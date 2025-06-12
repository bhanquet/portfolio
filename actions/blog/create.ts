"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";

const blogValidation = z.object({
  title: z.string(),
  slug: z.string(),
  tags: z
    .array(
      z
        .string()
        .regex(/^[a-z]+$/)
        .max(10),
    )
    .optional(),
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
