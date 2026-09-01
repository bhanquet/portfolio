"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getAlternateSlug } from "@/actions/blog";
import { Languages } from "lucide-react";
import { motion } from "motion/react";

const FLAGS: Record<string, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

const LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
};

export default function LanguageSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pending after locale change (navigation)
    setPending(null);
  }, [locale]);

  const switchLocale = async (nextLocale: string) => {
    if (nextLocale === locale || pending) return;
    setPending(nextLocale);
    const rawSlug = (params as Record<string, unknown>)?.slug;
    const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : undefined;
    if (slug) {
      try {
        const altSlug = await getAlternateSlug(slug, locale, nextLocale);
        if (altSlug) {
          // Use a concrete href — `usePathname()` returns the resolved path
          // (e.g. "/blog/mon-article") not the template "/blog/[slug]".
          // Passing { pathname, params: { slug: altSlug } } would keep the old
          // slug in the URL and produce a 404 in the target locale.
          router.replace(`/blog/${altSlug}` as unknown as typeof pathname, { locale: nextLocale });
          return;
        }
        // No public translation — avoid 404 by redirecting to the blog list
        // in the target locale instead of keeping the untranslated slug.
        router.replace("/blog" as unknown as typeof pathname, { locale: nextLocale });
        return;
      } catch {
        // fallback to generic switch below
      }
    }
    // Generic locale switch (preserves pathname for non-blog pages)
    // `pathname` is locale-independent (e.g. "/blog", "/", "/blog/manage")
    // so it is safe to pass through as-is.
    router.replace({ pathname, params } as unknown as never, { locale: nextLocale });
  };

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="inline-flex items-center gap-0.5 rounded-full border border-text/[0.06] bg-surface/60 p-0.5 backdrop-blur-sm sm:gap-1"
    >
      <span className="hidden sm:inline-flex items-center justify-center pl-2 pr-0.5 opacity-60" aria-hidden>
        <Languages size={12} className="text-text-muted" strokeWidth={1.75} />
      </span>
      <span className="hidden sm:block h-3.5 w-px bg-text/10 mx-1" aria-hidden />

      {routing.locales.map((loc) => {
        const isActive = locale === loc;
        const isPending = pending === loc;
        return (
          <button
            key={loc}
            type="button"
            aria-label={`${LABELS[loc] ?? loc.toUpperCase()} — ${isActive ? "active" : "switch to"}`}
            aria-pressed={isActive}
            disabled={isActive || !!pending}
            onClick={() => switchLocale(loc)}
            className={`relative inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-widest transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/30 ${
              isActive
                ? "bg-text/[0.07] text-text cursor-default"
                : "text-text/45 hover:text-text/80 hover:bg-text/[0.04] cursor-pointer"
            } ${isPending ? "opacity-60" : ""} disabled:cursor-default`}
          >
            {isPending && !isActive && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-full border border-text/10"
                aria-hidden
              />
            )}
            <span aria-hidden className="text-[11px] leading-none opacity-80">
              {FLAGS[loc] ?? "🏳️"}
            </span>
            <span className="leading-none">{loc.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
