import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

export default function ProjectCard({
  className,
  imageSrc,
  imageAlt = "Project image",
  // description,
}: {
  className?: string;
  imageSrc?: string | StaticImport;
  imageAlt: string;
  description?: string;
}) {
  return (
    <div
      className={`rounded-lg border shadow-lg overflow-hidden ${className || ""}`}
    >
      {imageSrc && (
        <div className="relative aspect-[4/3]">
          <Image fill src={imageSrc} alt={imageAlt} className="object-cover" />
        </div>
      )}
    </div>
  );
}
