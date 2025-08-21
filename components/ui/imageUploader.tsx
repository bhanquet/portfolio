import { ImagePlus, Loader2, Trash } from "lucide-react";
import { useRef } from "react";

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

  return (
    <div className="mt-6">
      {/* Upload Area */}
      {!imagePath && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-strongcolor hover:text-strongcolor cursor-pointer transition"
        >
          {isPending ? (
            <Loader2 className="animate-spin w-6 h-6 text-strongcolor" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8 mb-2" />
              <p className="text-sm">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">PNG or JPG (max 2MB)</p>
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
        <div className="relative mt-2 group rounded-lg overflow-hidden shadow-md border border-gray-200">
          <img
            src={imagePath}
            alt="Uploaded"
            className="w-full h-64 object-cover"
          />
          <button
            className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white transition"
            onClick={() => {
              onDelete(imagePath);
              setImagePath(null);
            }}
            type="button"
          >
            <Trash className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
