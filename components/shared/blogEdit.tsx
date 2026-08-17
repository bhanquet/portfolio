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
import { slugify } from "@/lib/utils";
import clsx from "clsx";

const SUMMARY_RECOMMENDED_MAX = 200;

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
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  // Once the user edits the slug by hand it no longer mirrors the title.
  const [slugTouched, setSlugTouched] = useState(false);

  // The slug currently persisted in the database. The editor may hold a newer
  // (unsaved) slug, so save/delete must reference this one to target the row.
  const [savedSlug, setSavedSlug] = useState(blog.slug);

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

    const result = await saveBlog(editingBlog, isNew, savedSlug);

    setIsSaving(false);
    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }

    const slugChanged = result.slug !== savedSlug;
    setSavedSlug(result.slug);
    setEditingBlog(result);
    setContentUpdated(false);
    setShowSavedBanner(true);
    if (slugChanged) {
      // Avoid an unnecessary RSC roundtrip when the slug didn't change.
      router.replace("/blog/manage/edit/" + result.slug);
    }
  };

  const handleDelete = async () => {
    await deleteBlog(savedSlug);
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
        liveHref={
          !isNew && editingBlog.public ? `/blog/${savedSlug}` : undefined
        }
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
          onChange={(e) => {
            const title = e.target.value;
            // The slug follows the title until it is edited manually.
            update(slugTouched ? { title } : { title, slug: slugify(title) });
          }}
          className="w-full border-b border-transparent bg-transparent pb-2 text-4xl font-bold tracking-tight transition-colors placeholder:text-text/25 focus:border-muted focus:outline-none md:text-5xl"
        />

        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
          <span aria-hidden="true">/blog/</span>
          {isEditingSlug ? (
            <input
              autoFocus
              value={editingBlog.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update({ slug: slugify(e.target.value) });
              }}
              onBlur={() => setIsEditingSlug(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault();
                  setIsEditingSlug(false);
                }
              }}
              aria-label="URL slug"
              className="w-56 rounded-md border bg-surface px-1.5 py-0.5 font-mono text-xs text-text transition-colors focus:border-accent/40 focus:outline-none"
            />
          ) : (
            <>
              <span className="font-mono break-all">
                {editingBlog.slug || "…"}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingSlug(true)}
                className="shrink-0 rounded px-1 py-0.5 font-medium text-accent transition-colors hover:bg-accent/10"
              >
                Edit
              </button>
            </>
          )}
        </div>

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
          <h2 className="mb-2 text-sm font-medium text-text-muted">Summary</h2>
          <textarea
            name="summary"
            aria-label="Post summary"
            rows={3}
            value={editingBlog.summary ?? ""}
            onChange={(e) => update({ summary: e.target.value })}
            placeholder="Brief description for previews and SEO…"
            className="w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-text/30 focus:border-accent/40 focus:outline-none"
          />
          <div className="mt-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-text-muted">
              Leave empty to auto-generate from the content.
            </span>
            <span
              className={clsx(
                "shrink-0 tabular-nums",
                (editingBlog.summary?.length ?? 0) > SUMMARY_RECOMMENDED_MAX
                  ? "font-medium text-rose-600"
                  : "text-text-muted",
              )}
            >
              {editingBlog.summary?.length ?? 0}/{SUMMARY_RECOMMENDED_MAX}
            </span>
          </div>
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
              onError={(message) => setToastError(message)}
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
