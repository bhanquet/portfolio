import Blog from "@/components/shared/blog";
import { LogOut } from "lucide-react";

import { getSession } from "@/lib/session";
import { signout } from "@/actions/auth";
import { notFound } from "next/navigation";

export default async function Page({}) {
  const session = await getSession();
  if (session?.userRole !== "admin") {
    return notFound();
  }

  const blog = {
    title: "New Page",
    slug: "new-page",
    createdDate: new Date(),
    tags: [],
    summary: "",
    content: "",
  };

  return (
    <>
      <Blog blog={blog} canEdit={session?.userRole === "admin"} edit={true} />

      {session && (
        <div className="group fixed bottom-4 right-4">
          <button
            className="bg-strongcolor text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300"
            onClick={signout}
          >
            <LogOut />
          </button>

          <div
            className="absolute right-1/2 bottom-full mb-2 transform translate-x-1/2 
                  bg-gray-800 text-white text-xs rounded px-2 py-1 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                  pointer-events-none whitespace-nowrap z-10"
          >
            Sign out
          </div>
        </div>
      )}
    </>
  );
}
