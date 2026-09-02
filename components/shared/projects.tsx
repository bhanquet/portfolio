import ProjectCard from "../ui/project-card";
import { fetchBlogsByTag } from "@/lib/data";
import { getTranslations, getLocale } from "next-intl/server";
import * as motion from "motion/react-client";

export default async function Projects() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Projects" });
  let projects: Awaited<ReturnType<typeof fetchBlogsByTag>> = [];
  try {
    projects = await fetchBlogsByTag(["project", "projet"], true, locale);
  } catch (error) {
    console.warn("Failed to fetch projects, rendering empty list:", error);
  }

  return (
    <div
      id="projects"
      className="bg-linear-to-b from-surface-2 via-background to-background px-6 sm:px-12 py-24 flex flex-col items-center"
    >
      <h3 className="mb-10 text-4xl md:text-5xl font-bold text-text">
        {t("title")}
        <span className="block mx-auto md:mx-0 mt-3 h-1 w-16 bg-accent rounded-full" />
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 xl:gap-24 w-full max-w-[1200px] mx-auto justify-items-center">
        {projects.map((project, index) => (
          <motion.div
            key={`${project.translationGroupId}-${project.slug}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              ease: "easeOut",
            }}
            className="w-full max-w-sm"
          >

            <ProjectCard
              key={project.slug}
              title={project.title}
              summary={project.summary}
              imagePath={project.imagePath}
              link={`/${locale}/blog/${project.slug}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
