import Input from "@/components/ui/form/input";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { signout } from "@/actions/auth";
import { fetchAllTags, fetchBlogs } from "@/lib/data";
import { Blog } from "@/lib/definitions";
import Tags from "@/components/ui/tags";

export default async function Page() {
  const session = await getSession();
  const tags = await fetchAllTags();
  const blogs: Blog[] = (await fetchBlogs()) || [];

  return (
    <>
      <div className="mx-auto flex">
        <aside className="w-1/4 px-6 ">
          {session && (
            <>
              <div className="mb-3">
                <Button onClick={signout} className="w-1/2">
                  Log out
                </Button>
              </div>
              <div className="mb-3">
                <Button
                  href="/blog/new-page"
                  variant="secondary"
                  className="block w-1/2"
                >
                  Create new post
                </Button>
              </div>
            </>
          )}
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
          <h1 className="mb-4 text-center text-strongcolor text-2xl">
            Sharing thought and ideas
          </h1>
          <Input placeholder="Search..." />
          {/* TODO: Add suspense */}
          {blogs.map((blog) => (
            <Card key={blog.title} className="mt-5">
              <h2 className="text-2xl mb-3">
                <a
                  className="hover:underline hover:text-gray-700"
                  href={`blog/${blog.slug}`}
                >
                  {blog.title}
                </a>
              </h2>
              {blog.tags?.length > 0 && (
                <div className="mb-3">
                  <Tags tags={blog.tags} />
                </div>
              )}

              <p className="text-gray-700">{blog.summary}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
