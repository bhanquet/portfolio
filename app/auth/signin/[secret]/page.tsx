import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import SignInForm from "@/app/auth/signin/form";

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
    redirect("/blog");
  }

  return <SignInForm />;
}
