import { Lexend } from "next/font/google";
import "../globals.css";

import type { Metadata, Viewport } from "next";

import Script from "next/script";
import Header from "@/components/shared/header";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

import { buildMetadata, getPersonSchema, getWebsiteSchema } from "@/lib/seo";
import { JsonLd } from "@/components/shared/jsonld";

const lexend = Lexend({
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata(locale);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e7ebd",
  colorScheme: "light",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const personJsonLd = getPersonSchema();
  const websiteJsonLd = getWebsiteSchema(locale);

  return (
    <html lang={locale}>
      <body
        className={`${lexend.className} text-text antialiased bg-background pt-(--header-offset)`}
        style={{ ["--header-offset" as string]: "68px" }}
      >
        <NextIntlClientProvider>
          <JsonLd data={personJsonLd} />
          <JsonLd data={websiteJsonLd} />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
          <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
