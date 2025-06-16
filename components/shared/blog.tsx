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
  const [newTag, setNewTag] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {saveError && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded">
          {saveError}
        </div>
      )}
      {canEdit && (
        <div className="mb-4">
          {editing ? (
            <Button
              key="saveButton"
              onClick={async () => {
                const result = await save(editingBlog);

                setSaveError(null);
                if ("error" in result) {
                  setSaveError(result.error);
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
      {Array.isArray(editingBlog.tags) && editingBlog.tags.length > 0 && (
        <div className="mt-4">
          <Tags
            editable={editing}
            tags={editingBlog.tags}
            onTagRemove={(tagIndex) => {
              const updatedTags = editingBlog.tags.filter(
                (_, index) => index !== tagIndex,
              );
              setEditingBlog({ ...editingBlog, tags: updatedTags });
            }}
          />
        </div>
      )}
      {editing && (
        <input
          value={newTag}
          className="mt-2 focus:ring-0 focus:border-none focus:outline-none"
          type="text"
          placeholder="Add tag"
          onChange={(e) => {
            setNewTag(
              e.target.value
                .replace(/[^a-zA-Z0-9]/g, "")
                .toLowerCase()
                .trim(),
            );
          }}
          onBlur={(e) => {
            if (!newTag) return;
            const updatedTags = [...(editingBlog.tags || []), newTag];
            setEditingBlog({ ...editingBlog, tags: updatedTags });
            setNewTag("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!newTag) return;
              const updatedTags = [...(editingBlog.tags || []), newTag];
              setEditingBlog({ ...editingBlog, tags: updatedTags });
              setNewTag("");
            }
          }}
        />
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
