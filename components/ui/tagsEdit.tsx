"use client";

import { X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

const MAX_TAG_LENGTH = 20;

export default function TagsEdit({
  tags,
  onTagAdd,
  onTagRemove,
}: {
  tags: string[];
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tagIndex: number) => void;
}) {
  const t = useTranslations("Admin");
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const tag = draft;
    setDraft("");
    if (tag) onTagAdd?.(tag);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-surface px-3 py-2 shadow-sm transition-colors focus-within:border-accent/40">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className="flex items-center gap-0.5 rounded-full bg-accent/10 py-1 pl-2.5 pr-1 text-sm font-medium text-accent-dark"
        >
          #{tag}
          <button
            type="button"
            aria-label={t("tagRemoveLabel", { tag })}
            onClick={(e) => {
              e.preventDefault();
              onTagRemove?.(index);
            }}
            className="grid h-[18px] w-[18px] place-items-center rounded-full text-accent-dark/50 transition-colors hover:bg-accent/20 hover:text-accent-dark"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <span className="flex min-w-24 flex-1 items-center">
        <span
          aria-hidden="true"
          className={clsx(
            "select-none text-sm text-accent/50 transition-opacity",
            draft ? "opacity-100" : "opacity-0",
          )}
        >
          #
        </span>
        <input
          value={draft}
          type="text"
          aria-label={t("tagAddPlaceholder")}
          placeholder={t("tagAddPlaceholder")}
          onChange={(e) => {
            setDraft(
              e.target.value
                .toLowerCase()
                .replace(/[^a-z]/g, "")
                .slice(0, MAX_TAG_LENGTH),
            );
          }}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
            if (e.key === "Backspace" && !draft && tags.length > 0) {
              onTagRemove?.(tags.length - 1);
            }
          }}
          className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-text/35"
        />
      </span>
    </div>
  );
}
