import Blog from "@/components/shared/blog";

export default async function Page({}) {
  const blog = {
    title: "New Page",
    slug: "new-page",
    createdDate: new Date(),
    tags: [],
    summary: "",
    content: "",
  };

  return (
    <>
      <Blog blog={blog} canEdit={true} edit={true} />
    </>
  );
}
