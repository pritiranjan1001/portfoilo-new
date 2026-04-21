import type { Metadata } from "next";
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
      <SiteHeader />
      <main className="min-h-[100dvh] pb-0 pt-0 md:pb-16 md:pt-[max(6rem,calc(var(--site-header-height)+1.25rem))]">
        <WorkHorizontalGallery />
      </main>
      <SiteFooter />
    </LenisScroll>
  );
}
