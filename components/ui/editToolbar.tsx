"use client";

import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Eye, Loader2, Save, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import clsx from "clsx";
import { useTranslations } from "next-intl";

type EditToolbarProps = {
  isNew: boolean;
  dirty: boolean;
  saving: boolean;
  isPublic: boolean;
  /** When set, shows a "View live" link opening the public post in a new tab. */
  liveHref?: string;
  onPublicChange: (value: boolean) => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void;
};

export default function EditToolbar({
  isNew,
  dirty,
  saving,
  isPublic,
  liveHref,
  onPublicChange,
  onSave,
  onDelete,
}: EditToolbarProps) {
  const router = useRouter();
  const t = useTranslations("Admin");

  const status = saving
    ? { dot: "bg-accent", pulse: true, label: t("toolbarSaving") }
    : dirty
      ? { dot: "bg-amber-500", pulse: true, label: t("toolbarUnsaved") }
      : isNew
        ? { dot: "bg-text/25", pulse: false, label: t("toolbarNewPost") }
        : { dot: "bg-emerald-500", pulse: false, label: t("toolbarSaved") };

  const handleBack = () => {
    // Guards against in-app (SPA) navigation when there are unsaved edits.
    // Full-page unload is handled by the `beforeunload` listener in blogEditTabbed.tsx —
    // these two mechanisms are complementary, not redundant.
    if (dirty && !window.confirm(t("toolbarUnsavedConfirm"))) {
      return;
    }
    router.push("/blog/manage");
  };

  return (
    <div className="sticky top-[var(--header-offset)] z-20 mx-auto max-w-3xl px-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border bg-surface/95 px-2.5 py-2 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t("toolbarBack")}
          className="grid h-9 w-9 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="mr-auto flex items-center gap-2 pl-1 text-sm font-medium text-text-muted">
          <span className="relative flex h-2 w-2">
            {status.pulse && (
              <span
                className={clsx(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                  status.dot,
                )}
              />
            )}
            <span
              className={clsx(
                "relative inline-flex h-2 w-2 rounded-full",
                status.dot,
              )}
            />
          </span>
          {status.label}
        </div>

        <Switch
          checked={isPublic}
          onChange={onPublicChange}
          className="px-1"
          onLabel={t("public")}
          offLabel={t("draft")}
        />

        {liveHref && (
          <a
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
            title={t("toolbarViewLive")}
            aria-label={t("toolbarViewLive")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-surface px-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Eye size={15} />
            <span className="hidden sm:inline">{t("toolbarViewLive")}</span>
          </a>
        )}

        <Button onClick={onSave} disabled={saving} className="px-3.5">
          <span className="flex items-center gap-2">
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? t("toolbarSaving") : t("toolbarSave")}
          </span>
        </Button>

        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={t("toolbarDeletePost")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">{t("toolbarDelete")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
