import { sanitizeHtml } from "@/lib/sanitize";

import {
  fetchBlog,
  fetchBlogGroup,
  serializeBlog,
  serializeBlogs,
} from "@/lib/data";
import { notFound } from "next/navigation";
import { Blog as BlogType } from "@/lib/definitions";
import BlogEditTabbed from "@/components/shared/blogEditTabbed";
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let blog: BlogType;
  const fetchedBlog = await fetchBlog(slug, false, locale);
  if (!fetchedBlog) return notFound();
  blog = fetchedBlog;

  blog.content = sanitizeHtml(blog.content);

  let group: BlogType[] = [blog];
  if (blog.translationGroupId) {
    try {
      const g = await fetchBlogGroup(blog.translationGroupId, false);
      if (g.length) {
        group = g.map((b) => ({ ...b, content: sanitizeHtml(b.content) }));
        // ensure current blog is sanitized already
        blog = group.find((b) => b.locale === locale) ?? blog;
      }
    } catch {
      // fallback to single
    }
  }

  return (
    <BlogEditTabbed
      blog={serializeBlog(blog)}
      group={serializeBlogs(group)}
      isNew={false}
    />
  );
}
