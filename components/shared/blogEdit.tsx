"use client";

import { useRouter } from "next/navigation";
import { Blog, Blog as BlogType } from "@/lib/definitions";
import TagsEdit from "@/components/ui/tagsEdit";
import { BlogDate } from "@/components/ui/blogDate";
import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/button";
import { deleteBlog, saveBlog } from "@/actions/blog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import ImageUploader from "@/components/ui/imageUploader";
import { deleteImage, uploadImage } from "@/actions/imageUploader";
import TipTapEditor from "@/components/ui/editor";

export default function Page({ blog }: { blog: BlogType }) {
  const [contentUpdated, setContentUpdated] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog>(blog);
  const [isPending, startTransition] = useTransition();
  const [newTag, setNewTag] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!contentUpdated) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Setting returnValue is the trigger for the prompt
      event.returnValue = ""; // A non-null value triggers the dialog
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [contentUpdated]);

  return (
    <div>
      <div className="max-w-3xl mx-auto mt-8">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-sm">
            {errorMessage}
          </div>
        )}
        <div className="mb-4 flex place-content-between gap-2">
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
              setContentUpdated(false);
              /* TODO: Only redirect if slug has changed */
              router.replace("/blog/manage/edit/" + result.slug);
            }}
          >
            Save
          </Button>

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
            <DialogBackdrop className="fixed inset-0 bg-black/15 backdrop-blur-xs" />
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
                    className="px-4 py-2 rounded-sm border text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await deleteBlog(editingBlog.slug);
                      setShowDeleteDialog(false);
                      router.back();
                    }}
                    className="px-4 py-2 flex items-center gap-2 rounded-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    <AlertTriangle size={16} />
                    Delete
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </div>
        <input
          key="titleInput"
          name="title"
          className="text-5xl font-bold"
          defaultValue={blog.title}
          onChange={(e) => {
            setContentUpdated(true);
            setEditingBlog({ ...editingBlog, title: e.target.value });
          }}
        />

        <ImageUploader
          imagePath={editingBlog.imagePath || null}
          setImagePath={() => {}}
          onUpload={(file: File) => {
            startTransition(async () => {
              const result = await uploadImage(file);
              if (result.error) {
                setErrorMessage(result.error);
              } else if (result.path) {
                setContentUpdated(true);
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
                setContentUpdated(true);
                setEditingBlog({ ...editingBlog, imagePath: null });
              }
            });
          }}
          isPending={isPending}
        />
        {/* Tags */}
        {Array.isArray(editingBlog.tags) && editingBlog.tags.length > 0 && (
          <div className="mt-4">
            <TagsEdit
              tags={editingBlog.tags}
              onTagRemove={(tagIndex) => {
                const updatedTags = editingBlog.tags.filter(
                  (_, index) => index !== tagIndex,
                );
                setContentUpdated(true);
                setEditingBlog({ ...editingBlog, tags: updatedTags });
              }}
            />
          </div>
        )}
        <input
          value={newTag}
          className="mt-2 focus:ring-0 focus:border-none focus:outline-hidden"
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
            setContentUpdated(true);
            setEditingBlog({ ...editingBlog, tags: updatedTags });
            setNewTag("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!newTag) return;
              const updatedTags = [...(editingBlog.tags || []), newTag];
              setContentUpdated(true);
              setEditingBlog({ ...editingBlog, tags: updatedTags });
              setNewTag("");
            }
          }}
        />
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
        <div key="editor" className="border border-orange-300 rounded-md p-3">
          <TipTapEditor
            editorContent={blog.content}
            onChangeAction={(content) => {
              setContentUpdated(true);
              setEditingBlog({ ...editingBlog, content });
            }}
          />
        </div>
      </div>
    </div>
  );
}
