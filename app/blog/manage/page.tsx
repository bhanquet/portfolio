import Button from "@/components/ui/button";
import { fetchBlogs, fetchBlogsCount } from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { BlogManagementList } from "@/components/ui/blogsManagementList";

export default async function Page(props: {
  searchParams?: Promise<{ search?: string; page?: number }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const page = searchParams?.page || 1;
  const maxItem = 10;
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
            <h1 className="text-3xl font-bold tracking-tight">Blog posts</h1>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-medium text-text-muted">
              {count}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {search
              ? `${count} ${count === 1 ? "result" : "results"} for “${search}”`
              : "Draft, edit and publish your writing."}
          </p>
        </div>
        <Button href="/blog/manage/new-blog">
          <span className="flex items-center gap-2">
            <Plus size={18} />
            New post
          </span>
        </Button>
      </div>

      <div className="mt-6">
        <Search />
      </div>

      <BlogManagementList blogs={blogs} search={search} />

      <div className="mt-8 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
