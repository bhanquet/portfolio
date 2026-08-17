import { signout } from "@/actions/auth";
import { getSession } from "@/lib/session";
import { LogOut } from "lucide-react";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return notFound();
  }

  return (
    <>
      {children}

      <div className="group fixed bottom-5 right-5 z-40">
        <button
          onClick={signout}
          aria-label="Sign out"
          className="flex items-center rounded-full bg-text p-3.5 text-white shadow-lg shadow-black/15 transition-colors duration-300 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-20 group-hover:opacity-100">
            Sign out
          </span>
        </button>
      </div>
    </>
  );
}
