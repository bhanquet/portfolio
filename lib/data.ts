import { getDB } from "@/lib/mongodb";
import { Blog } from "./definitions";

function toBlog(doc: any): Blog {
  return {
    title: doc.title,
    slug: doc.slug,
    date: new Date(doc.date),
    tags: doc.tags,
    summary: doc.summary,
    content: doc.content,
  };
}

export async function fetchBlogs(): Promise<Blog[]> {
  const db = await getDB();
  const blogsDoc = await db.collection("blogs").find().toArray();

  return blogsDoc.map(toBlog);
}

export async function fetchBlog(slug: string): Promise<Blog | null> {
  const db = await getDB();
  const blogDoc = await db.collection("blogs").findOne({ slug });

  if (!blogDoc) return null;

  return toBlog(blogDoc);
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
