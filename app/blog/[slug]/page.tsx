import { sanitizeHtml } from "@/lib/sanitize";
import { fetchAllBlogs, fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import { Blog as BlogType } from "@/lib/definitions";
import Image from "next/image";
import Tags from "@/components/ui/tags";
import { BlogDate } from "@/components/ui/blogDate";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300; // Revalidate this page every 5 minutes

export async function generateStaticParams() {
  try {
    const blogs = await fetchAllBlogs();
    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    console.warn(
      "Failed to fetch blogs for static generation, falling back to dynamic rendering:",
      error,
    );
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = blog.title;
  const description = blog.summary;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${blog.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${blog.slug}`,
      publishedTime: blog.createdDate.toISOString(),
      modifiedTime: blog.editedDate?.toISOString(),
      authors: ["Brian Hanquet"],
      tags: blog.tags,
      images: blog.imagePath
        ? [{ url: blog.imagePath, alt: blog.title }]
        : [
            {
              url: "/opengraph-image",
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: blog.imagePath ? [blog.imagePath] : ["/opengraph-image"],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  let blog: BlogType;
  const fetchedBlog = await fetchBlog(slug);
  if (!fetchedBlog) return notFound();
  blog = fetchedBlog;

  blog.content = sanitizeHtml(blog.content);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${blog.slug}`,
    headline: blog.title,
    description: blog.summary,
    image: blog.imagePath ?? null,
    datePublished: blog.createdDate.toISOString(),
    dateModified:
      blog.editedDate?.toISOString() ?? blog.createdDate.toISOString(),
    author: {
      "@type": "Person",
      name: "Brian Hanquet",
      url: "/",
    },
    publisher: {
      "@type": "Person",
      name: "Brian Hanquet",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${blog.slug}`,
    },
    keywords: blog.tags.join(", "),
    articleSection: "Technology",
    inLanguage: "en-US",
  };

  return (
    <div className="bg-white p-5 pb-32 rounded-md">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
