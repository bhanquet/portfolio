import Image from "next/image";
import brianHeroImage from "@/images/brian_hero.png";
import projectPortfolioImage from "@/images/projects/portfolio.png";

import Header from "@/ui/header";
import Button from "@/ui/button";
import Card from "@/ui/card";
import ProjectCard from "@/ui/project-card";
import Input from "@/ui/form/input";
import Textarea from "@/ui/form/textarea";
import GithubCard from "@/ui/githubCard";
import { GithubCardSkeleton } from "@/ui/skeletons";
import { Suspense } from "react";

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
              <Button href="#contact">Contact me</Button>
              <Button href="#projects" variant="secondary">
                See my work
              </Button>
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
          <Suspense fallback={<GithubCardSkeleton />}>
            <GithubCard username="bhanquet" />
          </Suspense>
          <Card className="w-96 h-44 flex flex-col justify-between">
            <p className="mb-auto text-lg">My Curriculum Vitae</p>
            <div>
              <Button>Download my CV</Button>
            </div>
          </Card>
        </div>
      </div>
      {/* Projects */}
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
      {/* Contact */}
      <div id="contact" className="bg-background2 p-14">
        <div className="bg-white w-1/2 mx-auto rounded-md shadow-lg p-10">
          <h3 className="text-4xl mb-6">Contact</h3>
          <p>
            You can contact me at{" "}
            <a
              className="text-strongcolor"
              href={`mailto:${process.env.MAIL_CONTACT}`}
            >
              {process.env.MAIL_CONTACT}
            </a>
          </p>
          <form>
            <div className="grid grid-cols-2 gap-4">
              <Input type="text" placeholder="Firstname" />
              <Input type="text" placeholder="Lastname" />
              <Input className="col-span-2" type="email" placeholder="Email" />
              <Textarea className="col-span-2" placeholder="Message" />
            </div>
            <div className="mt-4">
              <Button>Send</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
