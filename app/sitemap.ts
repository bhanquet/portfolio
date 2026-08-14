// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchAllBlogs } from "@/lib/data"; // adjust to where your functions live

const BASE_URL = process.env.DOMAIN
  ? `https://${process.env.DOMAIN}`
  : "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes on your site (add/remove as needed)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // add other static pages like /about, /contact, etc.
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch only public blogs
    const blogs = await fetchAllBlogs(true);

    // Dynamic blog routes
    blogRoutes = blogs.map((blog) => ({
      url: `${BASE_URL}/blog/${blog.slug}`,
      lastModified: blog.editedDate ?? blog.createdDate,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch (error) {
    console.warn("Failed to fetch blogs for sitemap:", error);
  }

  return [...staticRoutes, ...blogRoutes];
}
