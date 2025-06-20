import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { fetchAllTags, fetchBlogs, fetchBlogsCount } from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { Plus, Tag } from "lucide-react";
import { BlogDate } from "@/components/ui/blogDate";

export default async function Page(props: {
  searchParams?: Promise<{ search?: string; page?: number }>;
}) {
  const session = await getSession();

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
          {session && (
            <>
              <div className="mb-4 flex">
                <Button
                  href="/blog/new-page"
                  className="flex items-center gap-2"
                >
                  <Plus />
                  New post
                </Button>
              </div>
            </>
          )}
          <Search />

          {blogs.map((blog) => (
            <Card key={blog.title} className="mt-5">
              <h2 className="text-2xl">
                <a
                  className="hover:underline hover:text-gray-700"
                  href={`blog/${blog.slug}`}
                >
                  {blog.title}
                </a>
              </h2>
              <p className="text-gray-500 mb-3">
                <BlogDate date={blog.createdDate} />
              </p>

              <p className="text-gray-700">{blog.summary}</p>

              {blog.tags?.length > 0 && (
                <div className="mt-3">
                  <p className="text-strongcolor flex items-center gap-2">
                    <Tag size={16} />
                    {blog.tags.join(", ")}
                  </p>
                </div>
              )}
            </Card>
          ))}

          <div className="mt-5">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  );
}
