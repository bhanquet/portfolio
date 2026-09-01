import {
  fetchAllTags,
  fetchBlogs,
  fetchBlogsCount,
  serializeBlogs,
} from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { BlogList } from "@/components/ui/blogsList";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/shared/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/blog`]),
      ),
    },
    openGraph: {
      type: "website",
      title: `Brian Hanquet - ${title}`,
      description,
      url: `/${locale}/blog`,
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `Brian Hanquet - ${title}`,
      description,
    },
    keywords: ["blog", "tutorials", "tech blog", "sim racing", "electronics"],
  };
}

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ search?: string; page?: number }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const rawPage = searchParams?.page;
  const page =
    typeof rawPage === "string" ? parseInt(rawPage, 10) : rawPage ?? 1;
  const maxItem = 10;

  const [totalCount, tags, blogs] = await Promise.all([
    fetchBlogsCount(search, true, locale),
    fetchAllTags(true, locale),
    fetchBlogs({
      searchQuery: search,
      maxItem,
      page,
      locale,
    }),
  ]);
  const totalPages = Math.ceil(totalCount / maxItem);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Brian Hanquet - ${t("title")}`,
    description: t("description"),
    inLanguage: locale,
    url: `${SITE_URL}/${locale}/blog`,
    blogPost: blogs.slice(0, 10).map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      url: `${SITE_URL}/${locale}/blog/${blog.slug}`,
      datePublished: new Date(blog.createdDate).toISOString(),
      inLanguage: locale,
      author: {
        "@type": "Person",
        name: "Brian Hanquet",
      },
    })),
  };

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <div className="mx-auto flex mt-12">
        <aside className="hidden lg:block w-1/4 px-6">
          <p className="mb-3 text-gray-700 text-lg font-semibold">
            {t("tagsTitle")}
          </p>
          <ul>
            {tags.map((tag, key) => (
              <li
                key={key}
                className="mb-2 text-strongcolor hover:underline hover:cursor-pointer"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </aside>
        <div className="w-full max-w-5xl">
          <Search />

          <BlogList blogs={serializeBlogs(blogs)} locale={locale} />

          <div className="mt-5">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  );
}
