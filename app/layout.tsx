import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/shared/header";
import { SITE_URL } from "@/lib/site";

const lexend = Lexend({
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});
const description =
  "Portfolio and blog of Brian Hanquet. Discover my projects, technical experiments, and articles about web development, electronics, 3D printing, and technology.";

const keywords = [
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

export const metadata: Metadata = {
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
    locale: "en_US",
    url: "/",
    siteName: "Brian Hanquet",
    title: "Brian Hanquet — Web Developer Portfolio",
    description,
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
    canonical: "/",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e7ebd",
  colorScheme: "light",
};

const personJsonLd = {
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Brian Hanquet",
  url: SITE_URL,
  description,
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.className} text-text antialiased bg-background pt-[var(--header-offset)]`}
        style={{ ["--header-offset" as string]: "68px" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {children}
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
