import Header from "@/app/ui/header";
import Input from "@/app/ui/form/input";
import Card from "../ui/card";

export default function Page() {
  const tags = ["IT", "Finances", "Cars"];
  return (
    <>
      <Header />

      <div className="mx-auto flex">
        <aside className="w-1/4 px-6 ">
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
