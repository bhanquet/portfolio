import { sanitizeHtml } from "@/lib/sanitize";

import { fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import { Blog as BlogType } from "@/lib/definitions";
import BlogEdit from "@/components/shared/blogEdit";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

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

  return <BlogEdit blog={blog} isNew={false} />;
  // return "hi";
}
