export default function ExternalLinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      fill="currentColor"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.5 23.5h-15v-15h4.791V6H6v20h20v-7.969h-2.5z" />
      <path d="M17.979 6l3.016 3.018-6.829 6.829 1.988 1.987 6.83-6.828L26 14.02V6z" />
    </svg>
  );
}
