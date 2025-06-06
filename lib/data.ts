import { getDB } from "@/lib/mongodb";
import { Blog } from "./definitions";

export async function fetchBlogs(): Promise<Blog[]> {
  const db = await getDB();
  const db_blogs = await db.collection("blogs").find().toArray();

  const blogs: Blog[] = db_blogs.map((blog) => ({
    title: blog.title,
    url: "blog/" + blog.title.toLowerCase().replace(/\s+/g, "-"),
    tags: blog.tags,
    summary: blog.summary,
    content: blog.content,
  }));

  return blogs;
}

export async function fetchAllTags(): Promise<string[]> {
  const db = await getDB();
  const db_blogs = await db.collection("blogs").find().toArray();

  const tagsSet = new Set<string>();
  db_blogs.forEach((blog) => {
    blog.tags.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });

  return Array.from(tagsSet);
}
