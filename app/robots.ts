import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `https://${process.env.DOMAIN || "example.com"}/sitemap.xml`,
  };
}
