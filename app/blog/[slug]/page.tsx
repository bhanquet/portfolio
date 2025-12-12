import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { fetchAllBlogs, fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import Blog from "@/components/shared/blog";
import { Blog as BlogType } from "@/lib/definitions";

export const revalidate = 300; // Revalidate this page every 5 minutes

export async function generateStaticParams() {
  const blogs = await fetchAllBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

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

  return (
    <div className="bg-white p-5 pb-32 rounded-md">
      <Blog blog={blog} canEdit={false} edit={false} />
    </div>
  );
}
