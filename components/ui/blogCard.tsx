"use client";

import { Blog } from "@/lib/definitions";
import { motion } from "motion/react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BlogDate } from "./blogDate";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

const MAX_TAGS = 4;

export default function BlogCard({
  blog,
  index,
}: {
  blog: Blog;
  index: number;
}) {
  const fallbackLocale = useLocale();
  const t = useTranslations("Blog");
  const isPublic = blog.public === true;
  const tags = blog.tags ?? [];
  const targetLocale = blog.locale || fallbackLocale;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
    >
      <Link
        href={`/${targetLocale}/blog/manage/edit/${blog.slug}`}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <div className="rounded-xl border bg-surface p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-accent/30 group-hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusPill isPublic={isPublic} />
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold tracking-wide text-text-muted">
                {targetLocale.toUpperCase()}
              </span>
            </div>
            <span className="shrink-0 text-xs text-text-muted">
              <BlogDate date={blog.createdDate} />
            </span>
          </div>

          <h3 className="mt-3 line-clamp-1 text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
            {blog.title}
          </h3>

          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-text-muted">
            {blog.summary || t("noContent")}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              {tags.slice(0, MAX_TAGS).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-dark"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > MAX_TAGS && (
                <span className="text-xs text-text-muted">
                  +{tags.length - MAX_TAGS}
                </span>
              )}
            </div>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-text-muted transition-all duration-200 group-hover:bg-accent group-hover:text-white">
              <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function StatusPill({ isPublic }: { isPublic: boolean }) {
  const t = useTranslations("Admin");
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        isPublic
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          isPublic ? "bg-emerald-500" : "bg-amber-500",
        )}
      />
      {isPublic ? t("public") : t("draft")}
    </span>
  );
}
