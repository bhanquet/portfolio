"use server";

import { z } from "zod";
import { Resend } from "resend";
import { getLocale, getTranslations } from "next-intl/server";

const contactSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(254),
  message: z.string().min(10).max(5000),
});

export async function sendContactEmail(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const locale = await getLocale().catch(() => "en");
  const t = await getTranslations({ locale, namespace: "Contact" });
  const data = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(data);

  if (!parsed.success) {
    return { error: t("validationError") };
  }

  const { firstName, lastName, email, message } = parsed.data;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.MAIL_CONTACT;

  if (!resendApiKey || !fromEmail || !toEmail) {
    console.error("Missing email configuration");
    return { error: t("serviceNotConfigured") };
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: t("subject", { firstName, lastName }),
      text: `From: ${firstName} ${lastName} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: t("sendError") };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return { error: t("sendError") };
  }
}
