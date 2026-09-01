import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  // With `localePrefix: "always"`, every admin route is prefixed with a locale.
  // Build a disallowed list per supported locale so crawlers stay out of
  // private pages regardless of which locale they try.
  const privatePathPrefixes = ["/blog/manage", "/auth/signin"];
  const disallow = routing.locales.flatMap((locale) =>
    privatePathPrefixes.map((prefix) => `/${locale}${prefix}`),
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
