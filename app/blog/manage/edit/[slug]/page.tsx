import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

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
  const fetchedBlog = await fetchBlog(slug);
  if (!fetchedBlog) return notFound();
  blog = fetchedBlog;

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  blog.content = purify.sanitize(blog.content);

  return <BlogEdit blog={blog} />;
  // return "hi";
}
