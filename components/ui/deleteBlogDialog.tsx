"use client";

import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DeleteBlogDialog({
  open,
  title,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const t = useTranslations("Admin");
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
        <DialogPanel
          transition
          className="w-full max-w-md overflow-hidden rounded-t-2xl border bg-surface shadow-2xl transition duration-200 ease-out data-[closed]:translate-y-8 data-[closed]:opacity-0 sm:rounded-2xl sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
        >
          <div className="flex items-center justify-between bg-rose-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white">
                <Trash2 size={17} />
              </span>
              <DialogTitle className="text-base font-semibold text-white">
                {t("deleteTitle")}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("cancel")}
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <Description className="px-5 py-4 text-sm leading-relaxed text-text-muted">
            <span className="font-medium text-text">&ldquo;{title}&rdquo;</span>{" "}
            {t("deleteDescription")}
          </Description>

          <div className="flex justify-end gap-2 border-t bg-surface-2/60 px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              <Trash2 size={15} />
              {t("delete")}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
