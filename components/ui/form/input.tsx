export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`px-3 py-2 w-full rounded-lg
                  border-2 outline-hidden
                  shadow-xs
                  focus:border-b-2 focus:border-b-blue-200
                  transition-colors
                  ${className}
                `}
    />
  );
}
