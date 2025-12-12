import Button from "@/components/ui/button";
import { fetchAllTags, fetchBlogs, fetchBlogsCount } from "@/lib/data";
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

  const tags = await fetchAllTags();
  const blogs: Blog[] = await fetchBlogs({
    searchQuery: search,
    maxItem,
    page,
  });

  return (
    <>
      <div className="mx-auto flex">
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
