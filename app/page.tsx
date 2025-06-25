import Header from "@/components/shared/header";
import Hero from "@/components/shared/hero";
import AboutMe from "@/components/shared/aboutme";
import Projects from "@/components/shared/projects";
import Contact from "@/components/shared/contact";

export default function Home() {
  return (
    <div className="scroll-smooth lg:snap-y snap-mandatory h-screen overflow-y-scroll">
      <div className="snap-start bg-background min-h-screen flex flex-col">
        <Header />
        <Hero />
      </div>
      {/* About */}
      <div className="snap-start">
        <AboutMe />
      </div>
      {/* Projects */}
      <div className="snap-start">
        <Projects />
      </div>
      {/* Contact */}
      <div className="snap-start">
        <Contact />
      </div>
    </div>
  );
}
