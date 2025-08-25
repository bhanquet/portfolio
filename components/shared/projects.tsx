import ProjectCard from "../ui/project-card";
import { fetchBlogsByTag } from "@/lib/data";

export default async function Projects() {
  const projects = await fetchBlogsByTag("project");

  return (
    <div
      id="projects"
      className="bg-background px-6 sm:px-12 py-24 flex flex-col items-center"
    >
      <h3 className="mb-10 text-4xl">Projects</h3>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} link={`blog/${project.slug}`} />
        ))}
      </div>



      
    </div>
  );
}
