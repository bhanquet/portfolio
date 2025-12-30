import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { fetchAllBlogs, fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import { Blog as BlogType } from "@/lib/definitions";
import Image from "next/image";
import Tags from "@/components/ui/tags";
import { BlogDate } from "@/components/ui/blogDate";
import type { Metadata } from "next";

export const revalidate = 300; // Revalidate this page every 5 minutes

export async function generateStaticParams() {
  const blogs = await fetchAllBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  return {
    title: `Brian Hanquet - ${blog ? blog.title : "Not Found"}`,
    description: `Read the blog post titled "${blog?.title}" on my personal website.`,
  };
}

export default async function Page({ params }: Props) {
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
      <div className="max-w-3xl mx-auto mt-8">
        {/* Title */}
        <h1 key="titleDisplay" className="text-5xl font-bold">
          {blog.title}
        </h1>

        {/* Image */}
        {blog.imagePath ? (
          <div className="mt-2 rounded-lg overflow-hidden shadow-md border border-gray-200 relative h-64">
            <Image
              src={blog.imagePath}
              alt="Blog cover"
              className="object-cover"
              fill={true}
            />
          </div>
        ) : null}

        {/* Tags */}
        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
          <div className="mt-4">
            <Tags tags={blog.tags} />
          </div>
        )}

        {/* Date */}
        <p className="mt-4 italic text-gray-600">
          Created on <BlogDate date={blog.createdDate} />
          {"editedDate" in blog && blog.editedDate && (
            <span>
              , edited on <BlogDate date={blog.editedDate} />
            </span>
          )}
        </p>

        {/* Blog content */}
        <div
          key="preview"
          className="prose mt-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
}
