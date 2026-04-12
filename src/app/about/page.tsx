import type { Metadata } from "next";
import { AboutPageView } from "@/components/AboutPageView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Experience and background — ${site.name}.`,
};

export default function AboutPage() {
  return <AboutPageView />;
}
