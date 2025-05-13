import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import Button from "@/ui/button";
import Input from "@/ui/form/input";
import Textarea from "@/ui/form/textarea";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Create a New Blog Post</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Title
          </label>
          <Input
            type="text"
            id="title"
            name="title"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block font-medium mb-1">
            Content
          </label>
          <Textarea
            id="content"
            name="content"
            rows={6}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <Button>Publish</Button>
      </form>
    </div>
  );
}
