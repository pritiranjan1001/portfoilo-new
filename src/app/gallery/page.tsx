import type { Metadata } from "next";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteHeader } from "@/components/SiteHeader";
import { GalleryHorizontalStory } from "@/components/GalleryHorizontalStory";
import { LenisScroll } from "@/components/LenisScroll";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Story gallery — ${site.name}.`,
};

export default function GalleryPage() {
  return (
    <LenisScroll>
      <ScrollProgress />
      <SiteHeader />
      <main className="min-h-[100dvh] bg-[#ede8de] p-0 dark:bg-[var(--background)]">
        <GalleryHorizontalStory />
      </main>
    </LenisScroll>
  );
}
