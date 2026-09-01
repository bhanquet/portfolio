"use client";
import { Variants, motion } from "motion/react";
import { useTranslations } from "next-intl";

const container: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      duration: 0.6,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function AboutMeInfos() {
  const t = useTranslations("About");
  return (
    <motion.div
      className="lg:flex items-center justify-center lg:p-10 mx-auto"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div variants={item} className="lg:mr-7">
        <h3 className="text-4xl md:text-5xl font-bold text-text mb-4">
          {t("title")}
          <span className="block mt-3 h-1 w-16 bg-accent rounded-full" />
        </h3>
      </motion.div>

      <div className="lg:max-w-md lg:border-l-4 border-text lg:pl-7 space-y-4">
        <motion.p variants={item}>{t("p1")}</motion.p>
        <motion.p variants={item}>{t("p2")}</motion.p>
        <motion.p variants={item}>{t("p3")}</motion.p>
      </div>
    </motion.div>
  );
}
