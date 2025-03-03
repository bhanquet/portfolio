import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div className={`bg-white rounded-lg border shadow p-5 ${className}`}>
      {children}
    </div>
  );
}
