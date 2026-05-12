import type { Metadata } from "next";
import { blogPosts } from "@/content/blog";
import { BlogIndexView } from "@/components/blog/BlogIndexView";
import { LenisScroll } from "@/components/LenisScroll";
import { PageRoutePreloader } from "@/components/PageRoutePreloader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on design, motion, and creative coding.",
};

export default function BlogPage() {
  return (
    <PageRoutePreloader pageLabel="Blog">
      <LenisScroll>
        <ScrollProgress />
        <SiteHeader />
        <BlogIndexView posts={[...blogPosts].sort((a, b) => b.date.localeCompare(a.date))} />
        <SiteFooter />
      </LenisScroll>
    </PageRoutePreloader>
  );
}

