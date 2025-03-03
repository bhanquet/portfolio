export default function Input({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`px-2 py-3 w-full bg-gray-100 rounded
                  border-2 outline-none
                  focus:border-b-2 focus:border-b-blue-200
                  ${className}
                `}
    />
  );
}
