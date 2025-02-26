import { Nunito } from "next/font/google";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

const nunito = Nunito({
  subsets: ["latin"],
});

interface NavLinkProps extends LinkProps {
  isActive?: Boolean;
  children: ReactNode;
}

function NavLink({ children, isActive = false, ...props }: NavLinkProps) {
  return (
    <div>
      <Link
        className={`${isActive ? "font-extrabold" : "hover:font-semibold"}`}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

export default function () {
  return (
    <div className="px-20 py-5">
      <div
        className={`${nunito.className} flex ml-auto justify-between max-w-sm text-lg`}
      >
        <NavLink isActive={true} href="">
          Home
        </NavLink>
        <NavLink href="#about">About</NavLink>
        <NavLink href="#projets">Projets</NavLink>
        <NavLink href="#blog">Blog</NavLink>
        <NavLink href="#contact">Contact</NavLink>
      </div>
    </div>
  );
}
