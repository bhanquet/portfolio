"use server";

import { FormState } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/app/lib/session";

export async function signin(_: FormState, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email === "string" &&
    typeof password === "string" &&
    process.env.AUTH_PASSWORD !== undefined &&
    process.env.AUTH_EMAIL !== undefined
  ) {
    const passwordMatched = await bcrypt.compare(
      password,
      process.env.AUTH_PASSWORD,
    );

    if (email === process.env.AUTH_EMAIL && passwordMatched) {
      await createSession({
        userId: 1,
        userName: "Brian",
        userRole: "admin",
      });
      redirect("/blog");
    }
  }
  return { error: "Wrong login/password" };
}

export async function signout() {
  await deleteSession();
}
