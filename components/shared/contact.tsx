"use client";

import { useActionState, useEffect } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Button from "../ui/button";
import Input from "../ui/form/input";
import Textarea from "../ui/form/textarea";
import { sendContactEmail } from "@/actions/contact";

interface ContactProps {
  email?: string;
}

export default function Contact({ email }: ContactProps) {
  const t = useTranslations("Contact");
  const [state, formAction, isPending] = useActionState(sendContactEmail, null);

  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById("contact-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state]);

  return (
    <motion.div
      id="contact"
      className="bg-linear-to-b from-background via-surface-2 to-surface-2 p-4 lg:p-14"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="bg-surface max-w-3xl mx-auto rounded-md shadow-lg p-4 lg:p-10">
        <h3 className="text-4xl md:text-5xl font-bold text-text mb-6">
          {t("title")}
          <span className="block mt-3 h-1 w-16 bg-accent rounded-full" />
        </h3>
        <p>
          {t("intro")}{" "}
          <a
            className="text-accent hover:text-accent-dark transition-colors"
            href={`mailto:${email}`}
          >
            {email}
          </a>
        </p>

        {state?.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            {t("success")}
          </div>
        )}
        {state?.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {state.error}
          </div>
        )}

        <form id="contact-form" action={formAction}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="firstName"
              type="text"
              placeholder={t("firstName")}
              required
              maxLength={50}
            />
            <Input
              name="lastName"
              type="text"
              placeholder={t("lastName")}
              required
              maxLength={50}
            />
            <Input
              name="email"
              className="col-span-2"
              type="email"
              placeholder={t("email")}
              required
              maxLength={254}
            />
            <Textarea
              name="message"
              className="col-span-2"
              placeholder={t("message")}
              required
              minLength={10}
              maxLength={5000}
              rows={6}
            />
          </div>
          <div className="mt-4">
            <Button type="submit">{isPending ? t("sending") : t("send")}</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
