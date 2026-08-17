import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import SignInForm from "@/app/auth/signin/form";
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
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;

  if (secret !== process.env.AUTH_SECRET) {
    return notFound();
  }

  const session = await getSession();
  if (session) {
    redirect("/blog/manage");
  }

  return <SignInForm />;
}
