import type { Metadata } from "next";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkHorizontalGallery } from "@/components/WorkHorizontalGallery";
import { LenisScroll } from "@/components/LenisScroll";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description: `Selected projects — ${site.name}.`,
};

export default function WorkPage() {
  return (
    <LenisScroll variant="immersive">
      <ScrollProgress />
      <SiteHeader />
      <main className="min-h-[100dvh] pb-16 pt-20 md:pt-24">
        <WorkHorizontalGallery />
      </main>
      <SiteFooter />
    </LenisScroll>
  );
}
