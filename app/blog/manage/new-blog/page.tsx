import BlogEdit from "@/components/shared/blogEdit";

export default async function Page({}) {
  const blog = {
    title: "New Page",
    slug: "new-page",
    createdDate: new Date(),
    tags: [],
    summary: "",
    content: "",
  };
  return <BlogEdit blog={blog} />;
}
