"use client";

import { motion } from "motion/react";
import Button from "../ui/button";
import Card from "../ui/card";

export default function CV() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      viewport={{ once: true }}
    >
      <Card className="w-96 h-44 flex flex-col justify-between">
        <p className="mb-auto text-lg">My Curriculum Vitae</p>
        <div>
          <Button>Download my CV</Button>
        </div>
      </Card>
    </motion.div>
  );
}
