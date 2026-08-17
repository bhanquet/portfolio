import { fetchAllTags, fetchBlogs, fetchBlogsCount } from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { BlogList } from "@/components/ui/blogsList";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Dive into a world of tech, cars, electronics, and sim racing. Explore tutorials, tips, and insights from a passionate hobbyist.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    title: "Brian Hanquet - Blog",
    description:
      "Dive into a world of tech, cars, electronics, and sim racing. Explore tutorials, tips, and insights from a passionate hobbyist.",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brian Hanquet - Blog",
    description:
      "Dive into a world of tech, cars, electronics, and sim racing. Explore tutorials, tips, and insights from a passionate hobbyist.",
  },
  keywords: ["blog", "tutorials", "tech blog", "sim racing", "electronics"],
};

export default async function Page(props: {
  searchParams?: Promise<{ search?: string; page?: number }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const page = searchParams?.page || 1;
  const maxItem = 10;

  const [totalCount, tags, blogs] = await Promise.all([
    fetchBlogsCount(search),
    fetchAllTags(),
    fetchBlogs({
      searchQuery: search,
      maxItem,
      page,
    }),
  ]);
  const totalPages = Math.ceil(totalCount / maxItem);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Brian Hanquet - Blog",
    description:
      "Dive into a world of tech, cars, electronics, and sim racing. Explore tutorials, tips, and insights from a passionate hobbyist.",
    url: `${SITE_URL}/blog`,
    blogPost: blogs.slice(0, 10).map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      url: `${SITE_URL}/blog/${blog.slug}`,
      datePublished: blog.createdDate.toISOString(),
      author: {
        "@type": "Person",
        name: "Brian Hanquet",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto flex mt-12">
        <aside className="hidden lg:block w-1/4 px-6">
          <p className="mb-3 text-gray-700 text-lg font-semibold">Tags</p>
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

          <BlogList blogs={blogs} />

          <div className="mt-5">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  );
}
