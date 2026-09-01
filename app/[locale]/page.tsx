import type { Metadata } from "next";
import Hero from "@/components/shared/hero";
import AboutMe from "@/components/shared/aboutme";
import Projects from "@/components/shared/projects";
import Contact from "@/components/shared/contact";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/shared/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const title = t("title");
  const description = t("description");
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("title"),
    url: `${SITE_URL}/${locale}`,
    description: t("description"),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      "@id": SITE_URL,
    },
  };
  return (
    <div
      id="main-scroll"
      className="scroll-smooth h-[calc(100vh-68px)] overflow-y-scroll snap-y snap-mandatory"
    >
      <JsonLd data={webpageJsonLd} />
      <section className="snap-start min-h-[calc(100vh-68px)] flex flex-col bg-linear-to-br from-background via-background to-surface-2">
        <Hero />
      </section>
      {/* About */}
      <section className="snap-start min-h-[calc(100vh-68px)] flex flex-col justify-center">
        <AboutMe />
      </section>
      {/* Projects */}
      <section className="snap-start min-h-[calc(100vh-68px)] flex flex-col justify-center">
        <Projects />
      </section>
      {/* Contact */}
      <section className="snap-start min-h-[calc(100vh-68px)] flex flex-col justify-center">
        <Contact email={process.env.MAIL_CONTACT} />
      </section>
    </div>
  );
}
