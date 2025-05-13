import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SignInForm from "@/app/auth/signin/form";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    redirect("/blog");
  }

  return <SignInForm />;
}
