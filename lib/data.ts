import { getDB } from "@/lib/mongodb";
import { Blog } from "./definitions";

export async function fetchBlogs(): Promise<Blog[]> {
  const db = await getDB();
  const blogsDoc = await db.collection("blogs").find().toArray();

  const blogs: Blog[] = blogsDoc.map((blog) => ({
    title: blog.title,
    slug: blog.slug,
    tags: blog.tags,
    summary: blog.summary,
    content: blog.content,
  }));

  return blogs;
}

export async function fetchBlog(slug: string): Promise<Blog | null> {
  const db = await getDB();
  const blogDoc = await db.collection("blogs").findOne({ slug });

  if (!blogDoc) return null;

  const {
    title = "",
    slug: safeSlug = "",
    tags = [],
    summary = "",
    content = "",
  } = blogDoc;

  return {
    title,
    slug: safeSlug,
    tags,
    summary,
    content,
  };
}

export async function fetchAllTags(): Promise<string[]> {
  const db = await getDB();
  const blogsDoc = await db.collection("blogs").find().toArray();

  const tagsSet = new Set<string>();
  blogsDoc.forEach((blog) => {
    blog.tags?.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });

  return Array.from(tagsSet);
}
