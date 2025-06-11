"use server";

import { z } from "zod";
import { getDB } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";

const tagsSchema = z
  .string()
  .refine(
    (val) => {
      // Match "tag1,tag2,tag3" where each tag is alphanumeric (letters + numbers only)
      return val.split(",").every((tag) => /^[a-zA-Z0-9]+$/.test(tag));
    },
    {
      message:
        "Tags must be a comma-separated list of alphanumeric values (no spaces or special characters)",
    },
  )
  .optional();

const blogValidation = z.object({
  title: z.string(),
  slug: z.string(),
  tags: tagsSchema,
  summary: z
    .string()
    .max(500, { message: "summary must be less then 500 characters" }),
  content: z.string(),
});

export async function create(formData: FormData) {
  // TODO: data add tags
  // const data = {
  //   title: formData.get("title"),
  //   tags: formData.get("tags"),
  //   summary: formData.get("summary"),
  //   content: formData.get("content"),
  // };

  const title = formData.get("title");
  let slug = "";

  if (typeof title === "string") {
    slug = slugify(title);
  }

  const data = {
    title: title,
    slug: slug,
    summary: "TODO: summary",
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
