"use client";

import { Blog } from "@/lib/definitions";
import { AnimatePresence, motion } from "motion/react";
import { PenLine, SearchX } from "lucide-react";
import Link from "next/link";
import BlogCard from "@/components/ui/blogCard";
import Button from "@/components/ui/button";

export function BlogManagementList({
  blogs,
  search = "",
}: {
  blogs: Blog[];
  search?: string;
}) {
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
              No results for &ldquo;{search}&rdquo;
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Try a different search term.
            </p>
            <Link
              href="/blog/manage"
              className="mt-5 text-sm font-medium text-accent hover:underline"
            >
              Clear search
            </Link>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-text-muted">
              <PenLine size={20} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">No posts yet</h2>
            <p className="mt-1 text-sm text-text-muted">
              Your drafts and published posts will show up here.
            </p>
            <Button href="/blog/manage/new-blog" className="mt-6">
              New post
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
          <BlogCard key={blog.slug} blog={blog} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}
