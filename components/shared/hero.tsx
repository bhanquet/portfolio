"use client";

import { motion, Variants } from "motion/react";
import Button from "@/components/ui/button";
import Image from "next/image";
import brianHeroImage from "@/images/brian_hero.png";

export default function Hero() {
  const container: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
    hidden: { opacity: 0, x: -15 },
  };

  const item: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
    hidden: {
      opacity: 0,
      x: -15,
    },
  };

  return (
    <main id="hero" className="px-10 grow flex items-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto lg:mr-0"
      >
        <motion.h1 variants={item} className="text-4xl">
          I&apos;m{" "}
          <span className="text-strongcolor font-bold">Brian Hanquet</span>
        </motion.h1>
        <motion.h2 variants={item} className="text-secondarytext">
          I create simple, fast, and beautiful websites that are easy to use.
        </motion.h2>
        <motion.div variants={item} className="mt-20 flex justify-around">
          <Button href="#contact">Contact me</Button>
          <Button href="#projects" variant="secondary">
            See my work
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        className="hidden lg:block self-end flex-shrink-0"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Image src={brianHeroImage} alt="Image of Brian Hanquet" width={700} />
      </motion.div>
    </main>
  );
}
