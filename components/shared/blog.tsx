"use client";

import Tags from "@/components/ui/tags";
import { Blog } from "@/lib/definitions";
import TipTapEditor from "@/components/ui/editor";
import Button from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBlog, saveBlog } from "@/actions/blog";
import { BlogDate } from "@/components/ui/blogDate";
import { Trash2 } from "lucide-react";
import { AlertTriangle, X } from "lucide-react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import ImageUploader from "../ui/imageUploader";
import { deleteImage, uploadImage } from "@/actions/imageUploader";

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
  const [isPending, startTransition] = useTransition();
  const [newTag, setNewTag] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show confirmation dialog on page unload if editing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [editing]);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded">
          {errorMessage}
        </div>
      )}
      {canEdit && (
        <div className="mb-4 flex place-content-between gap-2">
          {editing ? (
            <Button
              key="saveButton"
              onClick={async () => {
                const result = await saveBlog(editingBlog);

                setErrorMessage(null);
                if ("error" in result) {
                  setErrorMessage(result.error);
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

          {/* Delete */}
          <button
            className="text-red-600 p-2 rounded-md hover:bg-red-100"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 />
          </button>
          <Dialog
            open={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
          >
            <DialogBackdrop className="fixed inset-0 bg-black/15 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg border border-gray-300">
                {/* Header */}
                <div className="flex items-center justify-between bg-red-600 px-6 py-4">
                  <DialogTitle className="text-white font-semibold text-lg">
                    Confirm Deletion
                  </DialogTitle>
                  <button onClick={() => setShowDeleteDialog(false)}>
                    <X className="text-white hover:text-gray-300" />
                  </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-4 text-center">
                  <AlertTriangle className="mx-auto text-red-500" size={48} />
                  <Description>
                    Are you sure you want to delete this blog post?
                    <br />
                    <span className="text-sm text-gray-500">
                      This action cannot be undone.
                    </span>
                  </Description>
                </div>

                {/* footer */}
                <div className="px-6 py-4 flex justify-end gap-4 bg-gray-50">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await deleteBlog(editingBlog.slug);
                      setShowDeleteDialog(false);
                      router.back();
                    }}
                    className="px-4 py-2 flex items-center gap-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    <AlertTriangle size={16} />
                    Delete
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
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

      {editing ? (
        <ImageUploader
          imagePath={editingBlog.imagePath || null}
          setImagePath={() => {}}
          onUpload={(file: File) => {
            startTransition(async () => {
              const result = await uploadImage(file);
              if (result.error) {
                setErrorMessage(result.error);
              } else if (result.path) {
                setEditingBlog({ ...editingBlog, imagePath: result.path });
              }
            });
          }}
          onDelete={(file) => {
            startTransition(async () => {
              const result = await deleteImage(file);

              if (result.error) {
                setErrorMessage(result.error);
              } else if (result.success) {
                setEditingBlog({ ...editingBlog, imagePath: null });
              }
            });
          }}
          isPending={isPending}
        />
      ) : blog.imagePath ? (
        <div className="mt-2 rounded-lg overflow-hidden shadow-md border border-gray-200">
          <img
            src={blog.imagePath}
            alt="Blog cover"
            className="w-full h-64 object-cover"
          />
        </div>
      ) : null}

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
          onBlur={() => {
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
      <p className="mt-4 italic text-gray-600">
        Created on <BlogDate date={blog.createdDate} />
        {"editedDate" in blog && blog.editedDate && (
          <span>
            , edited on <BlogDate date={blog.editedDate} />
          </span>
        )}
      </p>

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
