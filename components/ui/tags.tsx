export default function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <li
          key={index}
          className="flex items-center px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm"
        >
          #{tag}
        </li>
      ))}
    </ul>
  );
}
