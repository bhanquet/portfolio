import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function ImageUploader({
  imagePath,
  setImagePath,
  onUpload,
  onDelete,
  isPending,
}: {
  imagePath: string | null;
  setImagePath: (path: string | null) => void;
  onUpload: (file: File) => void;
  onDelete: (path: string) => void;
  isPending: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = useTranslations("Admin");

  return (
    <div>
      {/* Upload Area */}
      {!imagePath && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-text/15 bg-surface px-6 py-10 text-text-muted transition-colors hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
        >
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          ) : (
            <>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-2">
                <ImagePlus className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium">{t("imageUploadPrompt")}</p>
              <p className="mt-1 text-xs opacity-70">{t("imageUploadHint")}</p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUpload(file);
              }
            }}
          />
        </div>
      )}

      {/* Image Preview */}
      {imagePath && (
        <div className="group relative h-64 overflow-hidden rounded-xl border bg-surface shadow-sm">
          <Image
            src={imagePath}
            alt={t("imageCoverAlt")}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
          <button
            type="button"
            aria-label={t("imageRemove")}
            disabled={isPending}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-rose-600 shadow-md backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white disabled:opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={() => {
              onDelete(imagePath);
              setImagePath(null);
            }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
