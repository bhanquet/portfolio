"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "motion/react";

const cardVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.1, zIndex: 10, transition: { type: "spring", stiffness: 200, damping: 20 }},
}

const overlayVariants: Variants = {
  rest: { y: "100%", opacity: 0 },
  hover: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
}

export default function ProjectCard({
  title,
  summary,
  imagePath,
  link,
}: {
  title: string;
  summary: string;
  imagePath?: string | null;
  link: string;
}) {
  return (
    <Link href={link} className="block">
      <motion.div
        initial="rest"
        whileHover="hover"
        variants={cardVariants}
        className="relative w-full overflow-hidden rounded-2xl shadow-lg cursor-pointer "
      >

        {/* Project Image  */}
        {imagePath ? (
          <Image
            src={imagePath}
            alt={title}
            width={384}
            height={256}
            className="object-cover w-full h-64"
          />
        ) : (
          <div className="w-full h-64 relative bg-linear-to-tr from-violet-400 via-indigo-200 to-red-50 overflow-hidden rounded-2xl" />


        )}

        {/* Title */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black/70 via-black/40 to-transparent">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Summary */}
        <motion.div
          variants={overlayVariants}
          className="absolute bottom-0 left-0 w-full h-full p-4 text-white flex items-end bg-linear-to-t from-black/90 to-black/40"
        >
          <p className="text-sm">{summary}</p>
        </motion.div>


      </motion.div>
    </Link>
  );
}
