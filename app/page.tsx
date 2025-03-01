import Image from "next/image";
import brianHeroImage from "@/images/brian_hero.png";
import githubAvatarImage from "@/images/github_avatar.png";
import projetPortfolioImage from "@/images/projets/portfolio.png";
import Github from "./ui/icons/github";

import Header from "@/app/ui/header";
import ButtonPrimary from "./ui/button-primary";
import ButtonSecondary from "./ui/button-secondary";
import Card from "./ui/card";
import ProjectCard from "./ui/project-card";

export default function Home() {
  return (
    <>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        {/* Hero */}
        <main id="hero" className="px-10 grow flex items-center">
          <div className="mx-auto lg:mr-0">
            <h1 className="text-4xl">
              I&apos;m{" "}
              <span className="text-strongcolor font-bold">Brian Hanquet</span>
            </h1>
            <h2 className="text-secondarytext">
              I create simple, fast, and beautiful websites that are easy to
              use.
            </h2>
            <div className="mt-20 flex justify-around">
              <ButtonPrimary>Contact me</ButtonPrimary>
              <ButtonSecondary>See my work</ButtonSecondary>
            </div>
          </div>
          <div className="hidden lg:block self-end flex-shrink-0">
            <Image
              src={brianHeroImage}
              alt="Image of Brian Hanquet"
              width={700}
            />
          </div>
        </main>
      </div>
      {/* About */}
      <div id="about" className="bg-background2 p-24">
        <div className="flex items-center justify-center p-10 mx-auto">
          <div className="mr-7">
            <h3 className="text-4xl">About</h3>
          </div>
          <div className="w-1/3 border-l-4 border-maintext pl-7">
            <p>I love working on new technologies and learning new things.</p>
            <p>
              I build web applications that are fast, user-friendly, and
              efficient. I focus on performance, automation, and security to
              ensure reliability in every project.
            </p>
            <p>
              I also have a systems and infrastructure background that alow me
              to seamlessly integrate applications with cloud services,
              databases, and networking solutions.
            </p>
          </div>
        </div>
        {/* Social */}
        <div className="mt-24 flex justify-center">
          <Card className="w-96 h-44 mr-10 flex justify-between items-center">
            <div>
              <p className="mb-3">
                <Github size={24} />
              </p>
              <p className="text-xl">Brian Hanquet</p>
              <p className="mb-4 text-sm text-secondarytext">bhanquet</p>
              <ButtonPrimary>Github</ButtonPrimary>
            </div>
            <div>
              <Image
                src={githubAvatarImage}
                alt="bhanquet githubAvatar"
                className="rounded-full"
              />
            </div>
          </Card>
          <Card className="w-96 h-44 flex flex-col justify-between">
            <p className="mb-auto text-lg">My Curriculum Vitae</p>
            <div>
              <ButtonPrimary>Download my CV</ButtonPrimary>
            </div>
          </Card>
        </div>
      </div>
      {/* Projects */}
      <div className="bg-background p-24 flex flex-col items-center">
        <h3 className="mb-10 text-4xl">Projects</h3>
        <ProjectCard
          className="w-96 "
          imageSrc={projetPortfolioImage}
          imageAlt="Projet portfolio"
        />
      </div>
    </>
  );
}
