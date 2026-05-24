import type { Metadata } from "next";
import { ContactPageView } from "@/components/ContactPageView";
import { LenisScroll } from "@/components/LenisScroll";
import { PageRoutePreloader } from "@/components/PageRoutePreloader";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch — ${site.name}. Collaborations, commissions, and conversations.`,
};

export default function ContactPage() {
  return (
    <PageRoutePreloader pageLabel="Contact">
      <LenisScroll variant="immersive">
        <SiteHeader />
        <ContactPageView />
      </LenisScroll>
    </PageRoutePreloader>
  );
}
