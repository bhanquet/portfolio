"use client";

import Tags from "@/components/ui/tags";
import { Blog } from "@/lib/definitions";
import TipTapEditor from "@/components/ui/editor";
import Button from "@/components/ui/button";
import { useState } from "react";

export default function BlogPage({
  blog,
  canEdit,
}: {
  blog: Blog;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {canEdit && (
        <div className="mb-4">
          <Button
            onClick={() => {
              setEditing(!editing);
            }}
          >
            {editing ? "Save" : "Edit"}
          </Button>
        </div>
      )}

      {editing ? (
        <input
          key="titleInput"
          name="title"
          className="text-5xl font-bold"
          defaultValue={blog.title}
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
          <TipTapEditor editorContent={blog.content} inputName="content" />
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
