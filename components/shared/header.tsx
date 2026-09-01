"use client";

import { Nunito } from "next/font/google";
import Link, { LinkProps } from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import LanguageSwitcher from "@/components/shared/languageSwitcher";

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
        className={`transition-colors ${
          isActive
            ? "font-extrabold text-accent"
            : "text-text hover:text-accent hover:font-semibold"
        }`}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (seg && (routing.locales as readonly string[]).includes(seg)) {
    const stripped = "/" + pathname.split("/").slice(2).join("/");
    return stripped === "/" ? "/" : stripped.replace(/\/+$/, "") || "/";
  }
  return pathname;
}

function getLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (seg && (routing.locales as readonly string[]).includes(seg)) return seg;
  return routing.defaultLocale;
}

export default function Header() {
  const t = useTranslations("Header");
  const rawPathname = usePathname();
  const pathname = stripLocale(rawPathname);
  const locale = getLocale(rawPathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll");

    const getScrolled = () => {
      if (scrollContainer) {
        return scrollContainer.scrollTop > 8;
      }
      return (
        window.scrollY > 8 ||
        document.documentElement.scrollTop > 8 ||
        document.body.scrollTop > 8
      );
    };

    const onScroll = () => setScrolled(getScrolled());

    const target = scrollContainer ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("home"), href: `/${locale}` },
    { label: t("projects"), href: `/${locale}#projects` },
    { label: t("blog"), href: `/${locale}/blog` },
    { label: t("contact"), href: `/${locale}#contact` },
  ];
  // For isActive we compare stripped pathname
  const isActiveFor = (href: string) => {
    const strippedHref = stripLocale(href);
    return pathname === strippedHref;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 lg:px-24 py-4 md:py-5 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-text/5"
          : "bg-transparent"
      }`}
    >
      <motion.nav
        className={`${nunito.className} flex mx-auto items-center justify-between gap-3 sm:gap-6 max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] text-base sm:text-lg`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          {links.map((link, key) => (
            <NavLink
              key={`navlink-${key}`}
              href={link.href}
              isActive={isActiveFor(link.href)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </motion.nav>
    </header>
  );
}
