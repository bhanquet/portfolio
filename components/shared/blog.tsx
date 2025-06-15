"use client";

import Tags from "@/components/ui/tags";
import { Blog } from "@/lib/definitions";
import TipTapEditor from "@/components/ui/editor";
import Button from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { save } from "@/actions/blog";

export default function BlogPage({
  blog,
  canEdit,
  edit = false,
}: {
  blog: Blog;
  canEdit: boolean;
  edit?: boolean;
}) {
  const [editing, setEditing] = useState(edit);
  const [editingBlog, setEditingBlog] = useState<Blog>(blog);
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {canEdit && (
        <div className="mb-4">
          {editing ? (
            <Button
              key="saveButton"
              onClick={async () => {
                const result = await save(editingBlog);

                if ("error" in result) {
                  // TODO: Show the error
                  console.log("Save failed: ", result.error);
                  return;
                }

                setEditingBlog(result);
                setEditing(false);
                router.replace("/blog/" + result.slug);
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              key="editButton"
              onClick={() => {
                setEditing(true);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      )}

      {editing ? (
        <input
          key="titleInput"
          name="title"
          className="text-5xl font-bold"
          defaultValue={blog.title}
          onChange={(e) => {
            setEditingBlog({ ...editingBlog, title: e.target.value });
          }}
        />
      ) : (
        <h1 key="titleDisplay" className="text-5xl font-bold">
          {blog.title}
        </h1>
      )}

      {/* Tags */}
      {Array.isArray(blog.tags) && blog.tags.length > 0 && (
        <div className="mt-4">
          <div>
            <Tags tags={blog.tags} />
          </div>
        </div>
      )}

      {/* Date */}
      {blog.date instanceof Date && !isNaN(blog.date.getTime()) && (
        <p className="mt-4 italic text-gray-600">
          Published on{" "}
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(blog.date)}
        </p>
      )}

      {/* Blog content */}
      {editing ? (
        <div key="editor" className="border border-orange-300 rounded-md p-3">
          <TipTapEditor
            editorContent={blog.content}
            onEditorChange={(content) =>
              setEditingBlog({ ...editingBlog, content })
            }
          />
        </div>
      ) : (
        <div
          key="preview"
          className="prose mt-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      )}
    </div>
  );
}
