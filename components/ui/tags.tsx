import { X } from "lucide-react";

export default function Tags({
  tags,
  editable = false,
  onTagRemove,
}: {
  tags: string[];
  editable?: boolean;
  onTagRemove?: (tagIndex: number) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <li
          key={index}
          className="flex items-center px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm"
        >
          #{tag}
          {editable && (
            <button
              className="ml-1 text-red-900 hover:text-red-600 "
              onClick={(e) => {
                e.preventDefault();
                onTagRemove?.(index);
              }}
            >
              <X size={18} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
