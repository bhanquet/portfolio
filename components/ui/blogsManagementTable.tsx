"use client";

import { Blog } from "@/lib/definitions";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

export function BlogManagementTable({ blogs }: { blogs: Blog[] }) {
  const router = useRouter();
  return (
    <>
      <AnimatePresence>
        <table className="w-full table-auto border-collapse mb-5">
          <thead>
            <tr>
              <th className="border-b-2 py-4 px-6 text-left">Title</th>
              <th className="border-b-2 py-4 px-6 text-left">Summary</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog, index) => (
              <motion.tr
                className="cursor-pointer border-b hover:bg-gray-50"
                key={blog.slug}
                layout
                transition={{
                  delay: index * 0.1,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                onClick={() => router.push(`/blog/manage/edit/${blog.slug}`)}
              >
                <td className="py-4 px-6">{blog.title}</td>
                <td className="py-4 px-6">{blog.summary}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </AnimatePresence>
    </>
  );
}
