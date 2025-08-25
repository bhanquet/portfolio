import ProjectCard from "../ui/project-card";
import { fetchBlogsByTag } from "@/lib/data";
import * as motion from "motion/react-client"

export default async function Projects() {
  const projects = await fetchBlogsByTag("project");

  return (
    <div
      id="projects"
      className="bg-background px-6 sm:px-12 py-24 flex flex-col items-center"
    >
      <h3 className="mb-10 text-4xl">Projects</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 xl:gap-24 w-full max-w-[1200px] mx-auto justify-items-center">
        {projects.map((project, index) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              ease: "easeOut",
            }}
            className="w-full max-w-sm"
          >

            <ProjectCard key={project.slug} {...project} link={`blog/${project.slug}`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
