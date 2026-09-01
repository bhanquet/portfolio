"use client";

import { Blog } from "@/lib/definitions";
import { BlogDate } from "./blogDate";
import Card from "./card";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

export function BlogList({ blogs, locale: localeProp }: { blogs: Blog[]; locale?: string }) {
  const hookLocale = useLocale();
  const locale = localeProp ?? hookLocale;
  const t = useTranslations("Blog");
  return (
    <>
      <AnimatePresence>
        {blogs.map((blog, index) => (
          <motion.div
            layout
            key={`${blog.translationGroupId}-${blog.locale}-${blog.slug}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.4,
              ease: "easeOut",
            }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href={`/${locale}/blog/${blog.slug}`} className="block">
              <Card className="mt-5 p-8 flex flex-col md:flex-row gap-7 cursor-pointer hover:shadow-xl transition-shadow">
                {/* Text */}
                <div className="flex-1">
                  <h2 className="text-2xl">{blog.title}</h2>
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
                </div>

                {/* Image */}
                {blog.imagePath && (
                  <div className="hidden md:block w-1/4 aspect-4/3 relative mr-6">
                    <Image
                      src={blog.imagePath}
                      alt={blog.title}
                      className="object-cover rounded-xl shadow-sm border"
                      fill={true}
                    />
                  </div>
                )}
              </Card>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
