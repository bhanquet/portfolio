// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchAllBlogs } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Phase 1: generate locale-prefixed static routes for each locale.
  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) => [
      {
        url: `${SITE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/${locale}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
    ],
  );

  // Fetch only public blogs — tolerate DB unavailable at build time.
  let blogs: Awaited<ReturnType<typeof fetchAllBlogs>> = [];
  try {
    blogs = await fetchAllBlogs(true);
  } catch (error) {
    console.warn(
      "Sitemap: Failed to fetch blogs, returning static routes only:",
      error,
    );
    return staticRoutes;
  }

  // Dynamic blog routes — per-locale
  const blogRoutes: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    blogs
      .filter(
        (blog) =>
          blog.public === true &&
          !!blog.slug &&
          !!blog.title &&
          blog.locale === locale,
      )
      .map((blog) => ({
        url: `${SITE_URL}/${locale}/blog/${blog.slug}`,
        lastModified: new Date((blog.editedDate as string | Date | null | undefined) ?? blog.createdDate),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        images: blog.imagePath
          ? [
              blog.imagePath.startsWith("http")
                ? blog.imagePath
                : `${SITE_URL}${blog.imagePath}`,
            ]
          : undefined,
      })),
  );

  return [...staticRoutes, ...blogRoutes];
}
