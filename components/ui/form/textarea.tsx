export default function Input({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`px-2 py-3 w-full rounded-lg
                  shadow-xs
                  border-2 outline-hidden
                  focus:border-b-2 focus:border-b-blue-200
                  ${className}
                `}
    />
  );
}
