"use client";

import { Blog } from "@/lib/definitions";
import { AnimatePresence, motion } from "motion/react";
import { PenLine, SearchX } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import BlogCard from "@/components/ui/blogCard";
import Button from "@/components/ui/button";

export function BlogManagementList({
  blogs,
  search = "",
}: {
  blogs: Blog[];
  search?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("Admin");
  if (blogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-text/20 bg-surface px-6 py-16 text-center"
      >
        {search ? (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-text-muted">
              <SearchX size={20} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              {t("noResultsTitle", { search })}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{t("noResultsHint")}</p>
            <Link
              href={`/${locale}/blog/manage`}
              className="mt-5 text-sm font-medium text-accent hover:underline"
            >
              {t("clearSearch")}
            </Link>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-text-muted">
              <PenLine size={20} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{t("noPostsTitle")}</h2>
            <p className="mt-1 text-sm text-text-muted">{t("noPostsHint")}</p>
            <Button href={`/${locale}/blog/manage/new-blog`} className="mt-6">
              {t("newPost")}
            </Button>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <AnimatePresence>
        {blogs.map((blog, index) => (
          <BlogCard key={`${blog.translationGroupId}-${blog.locale}-${blog.slug}`} blog={blog} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}
