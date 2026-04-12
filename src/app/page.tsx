import { BeyondVisibleCover } from "@/components/BeyondVisibleCover";
import { ContactSection } from "@/components/ContactSection";
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
      <main>
        <LandingHero />
        <BeyondVisibleCover />
        <LandingAbout />
        <PracticeSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </LenisScroll>
  );
}
