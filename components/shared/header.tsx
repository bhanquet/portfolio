"use client";

import { Nunito } from "next/font/google";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const links = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/#projects" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="px-4 py-4 md:px-20 md:py-5">
      <nav
        className={`${nunito.className} flex mx-auto md:mr-0 justify-between max-w-sm text-lg`}
      >
        {links.map((link, key) => (
          <NavLink
            key={`navlink-${key}`}
            href={link.href}
            isActive={pathname === link.href}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
