import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { fetchBlog } from "@/lib/data";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import Blog from "@/components/shared/blog";
import { Blog as BlogType } from "@/lib/definitions";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let blog: BlogType;
  let edit = false;

  const session = await getSession();
  if (session?.userRole === "admin" && slug === "new-page") {
    blog = {
      title: "New Page",
      slug: "new-page",
      createdDate: new Date(),
      tags: [],
      summary: "",
      content: "",
    };

    edit = true;
  } else {
    const fetchedBlog = await fetchBlog(slug);
    if (!fetchedBlog) return notFound();
    blog = fetchedBlog;
  }

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  blog.content = purify.sanitize(blog.content);

  return (
    <div className="bg-white p-5 pb-32 rounded-md">
      <Blog blog={blog} canEdit={session?.userRole === "admin"} edit={edit} />
    </div>
  );
}
