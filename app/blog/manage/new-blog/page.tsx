import BlogEdit from "@/components/shared/blogEdit";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function Page({}) {
  const blog = {
    title: "New Page",
    slug: "new-page",
    createdDate: new Date(),
    tags: [],
    summary: "",
    content: "",
  };
  return <BlogEdit blog={blog} isNew />;
}
