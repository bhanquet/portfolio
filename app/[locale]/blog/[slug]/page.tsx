import { sanitizeHtml } from "@/lib/sanitize";
import { fetchAllBlogs, fetchBlog, fetchBlogGroup } from "@/lib/data";
import { notFound } from "next/navigation";
import { Blog as BlogType } from "@/lib/definitions";
import Image from "next/image";
import Tags from "@/components/ui/tags";
import { BlogDate } from "@/components/ui/blogDate";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/jsonld";
import { getTranslations } from "next-intl/server";

export const revalidate = 300; // Revalidate this page every 5 minutes

export async function generateStaticParams() {
  try {
    const blogs = await fetchAllBlogs();
    return blogs.map((blog) => ({
      locale: blog.locale,
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
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = await fetchBlog(slug, true, locale);

  if (!blog) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = blog.title;
  const description = blog.summary;

  // Build hreflang with per-locale slugs when translations exist
  let languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}/blog/${blog.slug}`]),
  );
  if (blog.translationGroupId) {
    try {
      const group = await fetchBlogGroup(blog.translationGroupId, true);
      if (group.length) {
        languages = Object.fromEntries(
          routing.locales.map((l) => {
            const alt = group.find((b) => b.locale === l);
            const slugForLocale = alt?.slug ?? blog.slug;
            return [l, `/${l}/blog/${slugForLocale}`];
          }),
        );
      }
    } catch {
      // fallback to same slug for all locales
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog/${blog.slug}`,
      languages,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/${locale}/blog/${blog.slug}`,
      publishedTime: new Date(blog.createdDate).toISOString(),
      modifiedTime: blog.editedDate
        ? new Date(blog.editedDate).toISOString()
        : undefined,
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
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPost" });

  let blog: BlogType;
  const fetchedBlog = await fetchBlog(slug, true, locale);
  if (!fetchedBlog) return notFound();
  blog = fetchedBlog;

  blog.content = sanitizeHtml(blog.content);

  const localeToBcp47: Record<string, string> = { en: "en-US", fr: "fr-FR" };
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/${locale}/blog/${blog.slug}`,
    headline: blog.title,
    description: blog.summary,
    image: blog.imagePath ?? null,
    datePublished: new Date(blog.createdDate).toISOString(),
    dateModified: blog.editedDate
      ? new Date(blog.editedDate).toISOString()
      : new Date(blog.createdDate).toISOString(),
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
      "@id": `${SITE_URL}/${locale}/blog/${blog.slug}`,
    },
    keywords: blog.tags.join(", "),
    articleSection: "Technology",
    inLanguage: localeToBcp47[locale] ?? "en-US",
  };

  return (
    <div className="bg-white p-5 pb-32 rounded-md">
      <JsonLd data={blogPostingJsonLd} />
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
          {t("createdOn")}{" "}
          <BlogDate
            date={
              blog.createdDate instanceof Date
                ? blog.createdDate.toISOString()
                : (blog.createdDate as string)
            }
          />
          {"editedDate" in blog && blog.editedDate && (
            <span>
              , {t("editedOn")}{" "}
              <BlogDate
                date={
                  blog.editedDate instanceof Date
                    ? (blog.editedDate as Date).toISOString()
                    : (blog.editedDate as string)
                }
              />
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
