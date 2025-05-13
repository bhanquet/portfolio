import Header from "@/app/ui/header";
import Input from "@/app/ui/form/input";
import Card from "../ui/card";
import Button from "@/app/ui/button";
import { getSession } from "@/app/lib/session";
import { signout } from "../actions/auth";

export default async function Page() {
  const tags = ["IT", "Finances", "Cars"];
  const session = await getSession();
  return (
    <>
      <Header />

      <div className="mx-auto flex">
        <aside className="w-1/4 px-6 ">
          {session && (
            <div className="mb-3">
              <Button onClick={signout} className="w-1/2">
                Log out
              </Button>
            </div>
          )}
          <p className="mb-3 text-gray-700 text-lg font-semibold">Tags</p>
          <ul>
            {tags.map((tag, key) => (
              <li
                key={key}
                className="mb-2 text-strongcolor hover:underline hover:cursor-pointer"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </aside>
        <div className="w-full max-w-5xl">
          <h2 className="mb-4 text-center text-strongcolor text-2xl">
            Sharing thought and ideas
          </h2>
          <Input placeholder="Search" />
          <Card className="mt-5">Test</Card>
        </div>
      </div>
    </>
  );
}
