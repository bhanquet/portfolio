import { sanitizeHtml } from "@/lib/sanitize";

import { fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import { Blog as BlogType } from "@/lib/definitions";
import BlogEdit from "@/components/shared/blogEdit";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let blog: BlogType;
  const fetchedBlog = await fetchBlog(slug, false);
  if (!fetchedBlog) return notFound();
  blog = fetchedBlog;

  blog.content = sanitizeHtml(blog.content);

  return <BlogEdit blog={blog} />;
  // return "hi";
}
