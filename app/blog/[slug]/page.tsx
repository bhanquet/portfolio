import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import Blog from "@/components/shared/blog";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  if (!blog) return notFound();

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  blog.content = purify.sanitize(blog.content);

  const session = await getSession();

  return <Blog blog={blog} canEdit={session?.userRole === "admin"} />;
}
