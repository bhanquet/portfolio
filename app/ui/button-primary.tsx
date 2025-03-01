import { ReactNode } from "react";

export default function ButtonPrimary({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-md py-2 px-4 bg-[#061e36] hover:bg-[#041729] text-white shadow-md">
      {children}
    </button>
  );
}
