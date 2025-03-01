import { ReactNode } from "react";

export default function ButtonSecondary({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-md py-2 px-4 bg-[#dedede] hover:bg-[#C9C9C9] shadow-md">
      {children}
    </button>
  );
}
