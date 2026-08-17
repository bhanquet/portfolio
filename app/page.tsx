import type { Metadata } from "next";
import Hero from "@/components/shared/hero";
import AboutMe from "@/components/shared/aboutme";
import Projects from "@/components/shared/projects";
import Contact from "@/components/shared/contact";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Brian Hanquet" },
  description:
    "Portfolio of Brian Hanquet — simple, fast, beautiful websites. Explore projects, blog, and get in touch.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Brian Hanquet — Web Developer Portfolio",
    description:
      "Portfolio of Brian Hanquet — simple, fast, beautiful websites. Explore projects, blog, and get in touch.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brian Hanquet — Web Developer Portfolio",
    description:
      "Portfolio of Brian Hanquet — simple, fast, beautiful websites. Explore projects, blog, and get in touch.",
  },
};

const webpageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Brian Hanquet — Web Developer Portfolio",
  url: SITE_URL,
  description:
    "Portfolio of Brian Hanquet — simple, fast, beautiful websites. Explore projects, blog, and get in touch.",
  isPartOf: {
    "@type": "WebSite",
    "@id": SITE_URL,
  },
};

export default function Home() {
  return (
    <div id="main-scroll" className="scroll-smooth h-[calc(100vh-68px)] overflow-y-scroll snap-y snap-mandatory">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webpageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
