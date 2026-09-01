"use server";

import { FormState } from "@/lib/definitions";
import bcrypt from "bcrypt";
import { getLocale } from "next-intl/server";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "@/i18n/navigation";

export async function signin(_: FormState, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email === "string" &&
    typeof password === "string" &&
    process.env.ADMIN_PASSWORD !== undefined &&
    process.env.ADMIN_EMAIL !== undefined
  ) {
    const passwordMatched = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD,
    );

    if (email === process.env.ADMIN_EMAIL && passwordMatched) {
      await createSession({
        userId: 1,
        userName: "Brian",
        userRole: "admin",
      });
      const locale = await getLocale().catch(() => "en");
      redirect({ href: "/blog/manage", locale });
    }
  }
  return { error: "Wrong login/password" };
}

export async function signout() {
  await deleteSession();
}
