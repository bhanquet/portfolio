import { Suspense } from "react";
import { GithubCardSkeleton } from "@/components/ui/skeletons";
import GithubCard from "@/components/ui/githubCardServer";
import AboutMeInfos from "@/components/shared/aboutme_infos";
import CV from "@/components/shared/aboutme_cv";

export default function AboutMe() {
  return (
    <div id="about" className="bg-background2 px-3 py-10 lg:py-24">
      <AboutMeInfos />
      {/* Social */}
      <div className="mt-24 flex flex-col lg:flex-row gap-3 justify-center">
        <Suspense fallback={<GithubCardSkeleton />}>
          <GithubCard username="bhanquet" />
        </Suspense>
        <CV />
      </div>
    </div>
  );
}
