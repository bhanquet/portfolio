import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/form/input";
import TipTapEditor from "@/components/ui/editor";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">Create a New Blog Post</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Title
          </label>
          <Input type="text" id="title" name="title" className="" required />
        </div>
        <div>
          <label htmlFor="content" className="block font-medium mb-1">
            Content
          </label>
          <div className="border rounded-lg p-2">
            <TipTapEditor />
          </div>
        </div>
        <Button>Publish</Button>
      </form>
    </div>
  );
}
