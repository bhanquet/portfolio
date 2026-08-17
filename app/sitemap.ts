// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchAllBlogs } from "@/lib/data"; // adjust to where your functions live
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes on your site (add/remove as needed)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // add other static pages like /about, /contact, etc.
  ];

  // Fetch only public blogs. No silent catch: if this fails, the sitemap
  // build should surface the error rather than silently emit an empty list.
  const blogs = await fetchAllBlogs(true);

  // Dynamic blog routes — only include complete, public posts.
  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((blog) => blog.public === true && !!blog.slug && !!blog.title)
    .map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.editedDate ?? blog.createdDate,
      changeFrequency: "monthly",
      priority: 0.8,
      images: blog.imagePath
        ? [
            blog.imagePath.startsWith("http")
              ? blog.imagePath
              : `${SITE_URL}${blog.imagePath}`,
          ]
        : undefined,
    }));

  return [...staticRoutes, ...blogRoutes];
}
