"use client";

import { useRouter } from "next/navigation";
import { Blog } from "@/lib/definitions";
import TagsEdit from "@/components/ui/tagsEdit";
import { BlogDate } from "@/components/ui/blogDate";
import { useEffect, useState, useTransition } from "react";
import { deleteBlog, saveBlog } from "@/actions/blog";
import { AlertCircle, X } from "lucide-react";
import ImageUploader from "@/components/ui/imageUploader";
import { uploadImage } from "@/actions/imageUploader";
import TipTapEditor from "@/components/ui/editor";
import NotificationBanner from "@/components/ui/notificationBanner";
import EditToolbar from "@/components/ui/editToolbar";
import DeleteBlogDialog from "@/components/ui/deleteBlogDialog";
import { slugify } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import clsx from "clsx";
import { useTranslations } from "next-intl";

const SUMMARY_RECOMMENDED_MAX = 200;

type Props = {
  blog: Blog;
  isNew: boolean;
  group?: Blog[];
};

export default function BlogEditTabbed({ blog, isNew, group }: Props) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const initialGroup = group && group.length ? group : [blog];
  const groupMapInitial: Record<string, Blog> = {};
  for (const b of initialGroup) {
    groupMapInitial[b.locale] = b;
  }

  const [activeLocale, setActiveLocale] = useState<string>(blog.locale || routing.defaultLocale);
  const [blogsMap, setBlogsMap] = useState<Record<string, Blog>>(groupMapInitial);
  const current = blogsMap[activeLocale] ?? {
    ...blog,
    locale: activeLocale,
    slug: slugify(blog.title),
    title: "",
    summary: "",
    content: "",
    tags: [],
  } as Blog;

  const [contentUpdated, setContentUpdated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImagePending, startImageTransition] = useTransition();
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugTouched, setSlugTouched] = useState<Record<string, boolean>>({});
  const [savedSlug, setSavedSlug] = useState<Record<string, string>>(() => {
    // For new posts nothing is persisted yet; keep empty so handleSave knows
    // to insert and toolbar shows "New post". For edits, map persisted slugs.
    if (isNew) return {};
    const m: Record<string, string> = {};
    for (const b of initialGroup) m[b.locale] = b.slug;
    return m;
  });

  useEffect(() => {
    if (!contentUpdated) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [contentUpdated]);

  const updateCurrent = (patch: Partial<Blog>) => {
    setContentUpdated(true);
    setBlogsMap((prev) => {
      const cur = prev[activeLocale] ?? { ...blog, locale: activeLocale, translationGroupId: blog.translationGroupId } as Blog;
      const next = { ...cur, ...patch };
      return { ...prev, [activeLocale]: next };
    });
  };

  const switchLocale = (loc: string) => {
    // create empty doc for locale if not exists
    if (!blogsMap[loc]) {
      setBlogsMap((prev) => ({
        ...prev,
        [loc]: {
          title: "",
          slug: "",
          locale: loc,
          translationGroupId: blog.translationGroupId,
          createdDate: blog.createdDate,
          editedDate: null,
          tags: [],
          summary: "",
          content: "",
          public: false,
          imagePath: blog.imagePath,
        },
      }));
    }
    setActiveLocale(loc);
    setIsEditingSlug(false);
    setErrorMessage(null);
  };

  const isPersisted = !!savedSlug[activeLocale];

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    const editing = blogsMap[activeLocale] ?? current;
    const isNewForLocale = !savedSlug[activeLocale];
    const prevSlug = savedSlug[activeLocale] ?? editing.slug;
    const result = await saveBlog(editing, isNewForLocale, prevSlug);
    setIsSaving(false);
    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }
    setSavedSlug((prev) => ({ ...prev, [activeLocale]: result.slug }));
    setBlogsMap((prev) => ({ ...prev, [activeLocale]: result }));
    setContentUpdated(false);
    setShowSavedBanner(true);
    if (isNewForLocale || result.slug !== prevSlug) {
      router.replace(`/${activeLocale}/blog/manage/edit/${result.slug}`);
    }
  };

  const handleDelete = async () => {
    await deleteBlog(savedSlug[activeLocale] ?? current.slug, activeLocale);
    setShowDeleteDialog(false);
    router.back();
  };

  const tags = current.tags ?? [];

  return (
    <div className="pb-24">
      <NotificationBanner show={showSavedBanner} message={t("postSaved")} onCloseAction={() => setShowSavedBanner(false)} />
      <NotificationBanner show={toastError !== null} variant="error" duration={4000} message={toastError ?? ""} onCloseAction={() => setToastError(null)} />

      {/* Locale tabs */}
      <div className="mx-auto max-w-3xl px-4 mt-6 mb-4 flex flex-wrap items-center gap-3">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-medium border transition-colors",
              activeLocale === loc
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface border-text/10 text-text hover:bg-surface-2",
            )}
          >
            {loc.toUpperCase()} {blogsMap[loc] ? "✓" : "○"}
          </button>
        ))}
        <span className="ml-1 text-xs text-text-muted self-center">{t("editSharedHint")}</span>
      </div>

      <EditToolbar
        isNew={!isPersisted}
        dirty={contentUpdated}
        saving={isSaving}
        isPublic={current.public === true}
        liveHref={isPersisted && current.public ? `/${activeLocale}/blog/${savedSlug[activeLocale] ?? current.slug}` : undefined}
        onPublicChange={(value) => updateCurrent({ public: value })}
        onSave={handleSave}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <div className="mx-auto mt-10 max-w-3xl px-4">
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
            <button type="button" onClick={() => setErrorMessage(null)} aria-label="Dismiss error" className="shrink-0 rounded-full p-0.5 text-rose-400 hover:bg-rose-100 hover:text-rose-700">
              <X size={16} />
            </button>
          </div>
        )}

        <input
          name="title"
          aria-label={t("postTitlePlaceholder")}
          placeholder={t("postTitlePlaceholder")}
          value={current.title ?? ""}
          onChange={(e) => {
            const title = e.target.value;
            const touched = !!slugTouched[activeLocale];
            updateCurrent(touched ? { title } : { title, slug: slugify(title) });
          }}
          className="w-full border-b border-transparent bg-transparent pb-2 text-4xl font-bold tracking-tight placeholder:text-text/25 focus:border-muted focus:outline-none md:text-5xl"
        />

        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
          <span aria-hidden="true">/blog/</span>
          {isEditingSlug ? (
            <input
              autoFocus
              value={current.slug}
              onChange={(e) => {
                setSlugTouched((prev) => ({ ...prev, [activeLocale]: true }));
                updateCurrent({ slug: slugify(e.target.value) });
              }}
              onBlur={() => setIsEditingSlug(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault();
                  setIsEditingSlug(false);
                }
              }}
              aria-label="URL slug"
              className="w-56 rounded-md border bg-surface px-1.5 py-0.5 font-mono text-xs text-text focus:border-accent/40 focus:outline-none"
            />
          ) : (
            <>
              <span className="font-mono break-all">{current.slug || "…"}</span>
              <button type="button" onClick={() => setIsEditingSlug(true)} className="shrink-0 rounded px-1 py-0.5 font-medium text-accent hover:bg-accent/10">{t("editSlug")}</button>
            </>
          )}
        </div>

        <p className="mt-3 text-sm text-text-muted">
          {!isPersisted ? (
            t("notSavedYet")
          ) : (
            <>
              {t("created")} <BlogDate date={current.createdDate} />
              {current.editedDate && <> {" · "}{t("edited")} <BlogDate date={current.editedDate} /></>}
            </>
          )}
        </p>

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-text-muted">{t("coverImageShared")}</h2>
          <ImageUploader
            imagePath={current.imagePath || null}
            setImagePath={() => {}}
            onUpload={(file: File) => {
              startImageTransition(async () => {
                const result = await uploadImage(file);
                if (result.error || !result.path) {
                  setToastError(result.error ?? t("uploadFailed"));
                  return;
                }
                const newPath = result.path;
                // Do NOT delete old image here: cover is shared across locales
                // and DB still references oldPath for other translations until
                // they are saved. Server will clean up orphans on save.
                setContentUpdated(true);
                // propagate image to all locales in-memory
                setBlogsMap((prev) => {
                  const next: Record<string, Blog> = {};
                  for (const [k, v] of Object.entries(prev)) next[k] = { ...v, imagePath: newPath };
                  if (!prev[activeLocale]) next[activeLocale] = { ...current, imagePath: newPath };
                  else next[activeLocale] = { ...prev[activeLocale], imagePath: newPath };
                  return next;
                });
              });
            }}
            onDelete={() => {
              // Cover is shared: clear in-memory for all locales, defer
              // file deletion to server (save/delete) so other translations
              // don't lose their image before being persisted.
              setContentUpdated(true);
              setBlogsMap((prev) => {
                const next: Record<string, Blog> = {};
                for (const [k, v] of Object.entries(prev)) next[k] = { ...v, imagePath: null };
                // ensure active locale entry exists
                if (!prev[activeLocale]) next[activeLocale] = { ...current, imagePath: null };
                return next;
              });
            }}
            isPending={isImagePending}
          />
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-text-muted">{t("summary")}</h2>
          <textarea
            name="summary"
            aria-label={t("summary")}
            rows={3}
            value={current.summary ?? ""}
            onChange={(e) => updateCurrent({ summary: e.target.value })}
            placeholder={t("summaryPlaceholder")}
            className="w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm shadow-sm placeholder:text-text/30 focus:border-accent/40 focus:outline-none"
          />
          <div className="mt-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-text-muted">{t("summaryHint")}</span>
            <span className={clsx("shrink-0 tabular-nums", (current.summary?.length ?? 0) > SUMMARY_RECOMMENDED_MAX ? "font-medium text-rose-600" : "text-text-muted")}>
              {current.summary?.length ?? 0}/{SUMMARY_RECOMMENDED_MAX}
            </span>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-text-muted">{t("tags")}</h2>
          <TagsEdit
            tags={tags}
            onTagAdd={(tag) => {
              if (tags.includes(tag)) return;
              updateCurrent({ tags: [...tags, tag] });
            }}
            onTagRemove={(tagIndex) => {
              updateCurrent({ tags: tags.filter((_, index) => index !== tagIndex) });
            }}
          />
        </section>

        <section className="mt-6">
          <div className="rounded-xl border bg-surface p-4 shadow-sm md:p-6">
            <TipTapEditor
              key={activeLocale}
              editorContent={current.content}
              onChangeAction={(content) => updateCurrent({ content })}
              onError={(m) => setToastError(m)}
            />
          </div>
        </section>
      </div>

      {isPersisted && <DeleteBlogDialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDelete} title={current.title} />}
    </div>
  );
}
