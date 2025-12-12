import Button from "@/components/ui/button";
import { fetchBlogs, fetchBlogsCount } from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { BlogList } from "@/components/ui/blogsList";

export default async function Page(props: {
  searchParams?: Promise<{ search?: string; page?: number }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const page = searchParams?.page || 1;
  const maxItem = 10;
  const totalPages = Math.ceil((await fetchBlogsCount(search)) / maxItem);

  const blogs: Blog[] = await fetchBlogs({
    searchQuery: search,
    maxItem,
    page,
  });

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex">
          <Button href="/blog/manage/new-blog">
            <div className="flex items-center gap-2">
              <Plus />
              New post
            </div>
          </Button>
        </div>
        <Search />

        <BlogList blogs={blogs} />

        <div className="mt-5">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
