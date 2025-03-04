import { Nunito } from "next/font/google";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

const nunito = Nunito({
  subsets: ["latin"],
});

interface NavLinkProps extends LinkProps {
  isActive?: boolean;
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

export default function Header() {
  return (
    <header className="px-4 py-4 md:px-20 md:py-5">
      <nav
        className={`${nunito.className} flex mx-auto md:mr-0 justify-between max-w-sm text-lg`}
      >
        <NavLink isActive href="">
          Home
        </NavLink>
        <NavLink href="#about">About</NavLink>
        <NavLink href="#projects">Projets</NavLink>
        <NavLink href="#blog">Blog</NavLink>
        <NavLink href="#contact">Contact</NavLink>
      </nav>
    </header>
  );
}
