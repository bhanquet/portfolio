import Hero from "@/components/shared/hero";
import AboutMe from "@/components/shared/aboutme";
import Projects from "@/components/shared/projects";
import Contact from "@/components/shared/contact";

export default function Home() {
  return (
    <div id="main-scroll" className="scroll-smooth h-[calc(100vh-68px)] overflow-y-scroll snap-y snap-mandatory">
      <section className="snap-start min-h-screen flex flex-col bg-linear-to-br from-background via-background to-surface-2">
        <Hero />
      </section>
      {/* About */}
      <section className="snap-start min-h-screen flex flex-col justify-center">
        <AboutMe />
      </section>
      {/* Projects */}
      <section className="snap-start min-h-screen flex flex-col justify-center">
        <Projects />
      </section>
      {/* Contact */}
      <section className="snap-start min-h-screen flex flex-col justify-center">
        <Contact email={process.env.MAIL_CONTACT} />
      </section>
    </div>
  );
}
