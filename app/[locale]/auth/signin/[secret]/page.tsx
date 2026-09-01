import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import SignInForm from "../form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string; secret: string }>;
}) {
  const { secret, locale } = await params;

  if (secret !== process.env.SIGNIN_SECRET) {
    return notFound();
  }

  const session = await getSession();
  if (session) {
    redirect(`/${locale}/blog/manage`);
  }

  return <SignInForm />;
}
