"use client";

import { useRouter } from "next/navigation";
import { Blog } from "@/lib/definitions";
import TagsEdit from "@/components/ui/tagsEdit";
import { BlogDate } from "@/components/ui/blogDate";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteBlog, saveBlog } from "@/actions/blog";
import { AlertCircle, X } from "lucide-react";
import ImageUploader from "@/components/ui/imageUploader";
import { deleteImage, uploadImage } from "@/actions/imageUploader";
import TipTapEditor from "@/components/ui/editor";
import NotificationBanner from "@/components/ui/notificationBanner";
import EditToolbar from "@/components/ui/editToolbar";
import DeleteBlogDialog from "@/components/ui/deleteBlogDialog";

export default function BlogEdit({ blog, isNew }: { blog: Blog; isNew: boolean }) {
  const router = useRouter();

  const [editingBlog, setEditingBlog] = useState<Blog>(blog);
  const [contentUpdated, setContentUpdated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImagePending, startImageTransition] = useTransition();
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Tracks the most recently committed imagePath so concurrent uploads
  // (rapid double-select) can read the latest committed value instead of
  // a stale closure capture.
  const latestImagePathRef = useRef<string | null>(editingBlog.imagePath || null);
  useEffect(() => {
    latestImagePathRef.current = editingBlog.imagePath || null;
  }, [editingBlog.imagePath]);

  useEffect(() => {
    if (!contentUpdated) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Setting returnValue is the trigger for the prompt
      return ""; // A non-null value triggers the dialog
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [contentUpdated]);

  const update = (patch: Partial<Blog>) => {
    setContentUpdated(true);
    setEditingBlog((current) => ({ ...current, ...patch }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const result = await saveBlog(editingBlog, isNew);

    setIsSaving(false);
    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }

    setEditingBlog(result);
    setContentUpdated(false);
    setShowSavedBanner(true);
    if (result.slug !== editingBlog.slug) {
      // Avoid an unnecessary RSC roundtrip when the slug didn't change.
      router.replace("/blog/manage/edit/" + result.slug);
    }
  };

  const handleDelete = async () => {
    await deleteBlog(editingBlog.slug);
    setShowDeleteDialog(false);
    router.back();
  };

  const tags = editingBlog.tags ?? [];

  return (
    <div className="pb-24">
      <NotificationBanner
        show={showSavedBanner}
        message="Post saved"
        onCloseAction={() => setShowSavedBanner(false)}
      />
      <NotificationBanner
        show={toastError !== null}
        variant="error"
        duration={4000}
        message={toastError ?? ""}
        onCloseAction={() => setToastError(null)}
      />

      <EditToolbar
        isNew={isNew}
        dirty={contentUpdated}
        saving={isSaving}
        isPublic={editingBlog.public === true}
        onPublicChange={(value) => update({ public: value })}
        onSave={handleSave}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <div className="mx-auto mt-10 max-w-3xl px-4">
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="shrink-0 rounded-full p-0.5 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <input
          name="title"
          aria-label="Post title"
          placeholder="Post title"
          value={editingBlog.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          className="w-full border-b border-transparent bg-transparent pb-2 text-4xl font-bold tracking-tight transition-colors placeholder:text-text/25 focus:border-muted focus:outline-none md:text-5xl"
        />

        <p className="mt-3 text-sm text-text-muted">
          {isNew ? (
            "Not saved yet"
          ) : (
            <>
              Created <BlogDate date={blog.createdDate} />
              {blog.editedDate && (
                <>
                  {" · "}Edited <BlogDate date={blog.editedDate} />
                </>
              )}
            </>
          )}
        </p>

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-text-muted">
            Cover image
          </h2>
          <ImageUploader
            imagePath={editingBlog.imagePath || null}
            setImagePath={() => {}}
            onUpload={(file: File) => {
              startImageTransition(async () => {
                // Read the most recently committed imagePath via a ref so concurrent
                // uploads don't capture a stale closure value.
                const oldPath = latestImagePathRef.current;
                const result = await uploadImage(file);
                if (result.error || !result.path) {
                  setToastError(result.error ?? "Upload failed");
                  return;
                }
                const newPath = result.path;
                if (oldPath && oldPath !== newPath) {
                  // best-effort: the new file is already uploaded; if cleanup
                  // fails the orphan will be reaped on a later edit/delete.
                  const cleanup = await deleteImage(oldPath);
                  if (!cleanup.success && cleanup.error) {
                    setToastError(
                      `New image saved, but old image could not be removed: ${cleanup.error}`,
                    );
                  }
                }
                setContentUpdated(true);
                setEditingBlog((current) => ({
                  ...current,
                  imagePath: newPath,
                }));
              });
            }}
            onDelete={(file) => {
              startImageTransition(async () => {
                const result = await deleteImage(file);

                if (result.error) {
                  setToastError(result.error);
                } else if (result.success) {
                  setContentUpdated(true);
                  setEditingBlog((current) => ({
                    ...current,
                    imagePath: null,
                  }));
                }
              });
            }}
            isPending={isImagePending}
          />
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-text-muted">Tags</h2>
          <TagsEdit
            tags={tags}
            onTagAdd={(tag) => {
              if (tags.includes(tag)) return;
              update({ tags: [...tags, tag] });
            }}
            onTagRemove={(tagIndex) => {
              update({ tags: tags.filter((_, index) => index !== tagIndex) });
            }}
          />
        </section>

        <section className="mt-6">
          <div className="rounded-xl border bg-surface p-4 shadow-sm md:p-6">
            <TipTapEditor
              editorContent={blog.content}
              onChangeAction={(content) => update({ content })}
            />
          </div>
        </section>
      </div>

      {!isNew && (
        <DeleteBlogDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title={editingBlog.title}
        />
      )}
    </div>
  );
}
