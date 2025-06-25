"use client";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.3,
      duration: 0.8,
    },
  },
};

export default function AboutMeInfos() {
  return (
    <motion.div
      className="lg:flex items-center justify-center lg:p-10 mx-auto"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div variants={container} className="lg:mr-7">
        <h3 className="text-4xl mb-4">About</h3>
      </motion.div>

      <motion.div
        variants={container}
        className="lg:max-w-md lg:border-l-4 border-maintext lg:pl-7 space-y-4"
      >
        <motion.p variants={container}>
          I love working on new technologies and learning new things.
        </motion.p>
        <motion.p variants={container}>
          I build web applications that are fast, user-friendly, and efficient.
          I focus on performance, automation, and security to ensure reliability
          in every project.
        </motion.p>
        <motion.p variants={container}>
          I also have a systems and infrastructure background that allow me to
          seamlessly integrate applications with cloud services, databases, and
          networking solutions.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
