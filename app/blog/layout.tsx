import { signout } from "@/actions/auth";
import Header from "@/components/shared/header";
import Button from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tags = ["IT", "Finances", "Cars"];
  const session = await getSession();

  return (
    <>
      <Header />
      <div className="w-full">{children}</div>
    </>
  );
}
