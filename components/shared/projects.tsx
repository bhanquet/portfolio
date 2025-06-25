import projectPortfolioImage from "@/images/projects/portfolio.png";
import ProjectCard from "../ui/project-card";

export default function Projects() {
  return (
    <div
      id="projects"
      className="bg-background p-24 flex flex-col items-center"
    >
      <h3 className="mb-10 text-4xl">Projects</h3>
      <ProjectCard
        className="w-96 "
        imageSrc={projectPortfolioImage}
        imageAlt="Project portfolio"
      />
    </div>
  );
}
