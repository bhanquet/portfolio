import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { Metadata } from "next";

export const keywords = [
  "Brian Hanquet",
  "web developer",
  "portfolio",
  "Next.js",
  "React",
  "TypeScript",
  "full-stack developer",
  "sim racing",
  "electronics",
  "tutorials",
];

const localeConfig = {
  fr: {
    ogLocale: "fr_FR",
    description:
      "Portfolio et blog de Brian Hanquet. Découvrez mes projets, expériences techniques et articles sur le développement web, l'électronique, l'impression 3D et la technologie.",
  },
  en: {
    ogLocale: "en_US",
    description:
      "Portfolio and blog of Brian Hanquet. Discover my projects, technical experiments, and articles about web development, electronics, 3D printing, and technology.",
  },
} as const;

function getLocaleConfig(locale: string) {
  return localeConfig[locale as keyof typeof localeConfig] ?? localeConfig.en;
}

export function getPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Brian Hanquet",
    url: SITE_URL,
    jobTitle: "Full-stack Web Developer",
    knowsAbout: keywords,
    sameAs: [
      "https://github.com/bhanquet/",
      "https://www.linkedin.com/in/bhanquet/",
    ],
  };
}

export function getWebsiteSchema(locale: string) {
  const { description, ogLocale } = getLocaleConfig(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Brian Hanquet",
    url: SITE_URL,
    description,
    inLanguage: ogLocale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildMetadata(locale: string): Metadata {
  const { description, ogLocale } = getLocaleConfig(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Brian Hanquet",
      template: "%s | Brian Hanquet",
    },
    description,
    applicationName: "Brian Hanquet — Portfolio",
    authors: [{ name: "Brian Hanquet", url: SITE_URL }],
    generator: "Next.js",
    keywords,
    referrer: "origin-when-cross-origin",
    creator: "Brian Hanquet",
    publisher: "Brian Hanquet",
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: `/${locale}`,
      siteName: "Brian Hanquet",
      title: "Brian Hanquet — Web Developer Portfolio",
      description,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => getLocaleConfig(l).ogLocale),
    },
    twitter: {
      title: "Brian Hanquet — Web Developer Portfolio",
      description,
      creator: "@brianhanquet",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    icons: {
      icon: [
        { url: "/icon0.svg", type: "image/svg+xml" },
        { url: "/icon1.png", type: "image/png" },
      ],
      shortcut: "/icon1.png",
      apple: "/apple-icon.png",
    },
    manifest: "/manifest.json",
    category: "technology",
  };
}
