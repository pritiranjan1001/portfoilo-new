import { BeyondVisibleCover } from "@/components/BeyondVisibleCover";
import { ContactSection } from "@/components/ContactSection";
import { HomeScrollOrchestrator } from "@/components/HomeScrollOrchestrator";
import { LandingAbout } from "@/components/LandingAbout";
import { LandingHero } from "@/components/LandingHero";
import { LenisScroll } from "@/components/LenisScroll";
import { PracticeSection } from "@/components/PracticeSection";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <LenisScroll>
      <ScrollProgress />
      <SiteHeader />
      <main id="home-main" className="relative">
        <HomeScrollOrchestrator />
        <LandingHero />
        <BeyondVisibleCover />
        <LandingAbout />
        <PracticeSection />
        <div
          tabIndex={-1}
          className="flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
        >
          <ContactSection />
          <SiteFooter className="shrink-0 !py-7 md:!py-8" />
        </div>
      </main>
    </LenisScroll>
  );
}
