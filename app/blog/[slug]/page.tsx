import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";

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
  const blogContent = purify.sanitize(blog.content);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-5xl font-bold mx-auto">{blog.title}</h1>

      {Array.isArray(blog.tags) && blog.tags.length > 0 && (
        <div className="mt-4">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm mr-2 mb-2"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {blog.date instanceof Date && !isNaN(blog.date.getTime()) && (
        <p className="mt-4 italic text-gray-600">
          Plublished on{" "}
          {new Intl.DateTimeFormat(navigator.language, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(blog.date)}
        </p>
      )}
      <div
        className="prose mt-6"
        dangerouslySetInnerHTML={{ __html: blogContent }}
      />
    </div>
  );
}
