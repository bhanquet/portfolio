import BlogEditTabbed from "@/components/shared/blogEditTabbed";
import type { Blog } from "@/lib/definitions";
import type { Metadata } from "next";
import { serializeBlog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const blog: Blog = {
    title: "New Page",
    slug: "new-page",
    locale,
    translationGroupId:
      globalThis.crypto?.randomUUID?.() ?? "new-translation-group",
    createdDate: new Date(),
    editedDate: null,
    tags: [],
    summary: "",
    content: "",
    public: false,
    imagePath: null,
  };
  return <BlogEditTabbed blog={serializeBlog(blog)} isNew />;
}
