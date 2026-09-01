import Button from "@/components/ui/button";
import { fetchBlogs, fetchBlogsCount, serializeBlogs } from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { BlogManagementList } from "@/components/ui/blogsManagementList";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ search?: string; page?: number }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const rawPage = searchParams?.page;
  const page =
    typeof rawPage === "string" ? parseInt(rawPage, 10) : rawPage ?? 1;
  const maxItem = 10;
  // Admin: show all languages together so every translation is reachable
  const count = await fetchBlogsCount(search, false);
  const totalPages = Math.ceil(count / maxItem);

  const blogs: Blog[] = await fetchBlogs({
    searchQuery: search,
    maxItem,
    page,
    publicOnly: false,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("manageTitle")}
            </h1>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-medium text-text-muted">
              {count}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {search
              ? t("manageSearchResults", { count, search })
              : t("manageSubtitle")}
          </p>
        </div>
        <Button href={`/${locale}/blog/manage/new-blog`}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            {t("newPost")}
          </span>
        </Button>
      </div>

      <div className="mt-6">
        <Search />
      </div>

      <BlogManagementList blogs={serializeBlogs(blogs)} search={search} />

      <div className="mt-8 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
