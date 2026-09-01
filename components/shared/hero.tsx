"use client";

import { Nunito } from "next/font/google";
import { motion, Variants } from "motion/react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import Image from "next/image";
import brianHeroImage from "@/images/brian_hero.png";

const nunito = Nunito({
  subsets: ["latin"],
});

export default function Hero() {
  const t = useTranslations("Hero");
  const container: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
      },
    },
    hidden: { opacity: 0, x: -25 },
  };

  const item: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hidden: {
      opacity: 0,
      x: -25,
    },
  };

  return (
    <section
      id="hero"
      className={`grow flex flex-col md:flex-row items-stretch gap-12 lg:gap-20 px-6 sm:px-12 lg:px-24 max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto ${nunito.className}`}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col justify-center max-w-2xl lg:max-w-xl lg:min-w-[360px] text-center md:text-left py-12 md:py-0"
      >
        <motion.h1
          variants={item}
          className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-text"
        >
          {t("titlePrefix")}{" "}
          <span className="text-accent block sm:inline">{t("titleName")}</span>
        </motion.h1>
        <motion.h2
          variants={item}
          className="mt-4 md:mt-6 text-lg md:text-2xl text-text-muted max-w-xl mx-auto md:mx-0"
        >
          {t("subtitle")}
        </motion.h2>
        <motion.div
          variants={item}
          className="mt-10 md:mt-12 flex flex-wrap justify-center md:justify-start gap-4"
        >
          <Button href="#contact">{t("ctaContact")}</Button>
          <Button href="#projects" variant="secondary">
            {t("ctaProjects")}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="hidden md:flex flex-1 lg:flex-[2] items-end justify-center lg:justify-end min-w-0 self-end"
        initial={{ opacity: 0, x: 60, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        <Image
          src={brianHeroImage}
          alt={t("imageAlt")}
          width={1200}
          height={1200}
          className="max-h-[80vh] w-auto max-w-full object-contain object-right-bottom"
          sizes="(max-width: 1024px) 60vw, 50vw"
          priority
        />
      </motion.div>
    </section>
  );
}
