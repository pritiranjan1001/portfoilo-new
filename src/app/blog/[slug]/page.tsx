import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/content/blog";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { LenisScroll } from "@/components/LenisScroll";
import { PageRoutePreloader } from "@/components/PageRoutePreloader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const subtitle =
    post.title.length > 72 ? `${post.title.slice(0, 70).trimEnd()}…` : post.title;
  return (
    <PageRoutePreloader pageLabel="Blog" pageSubtitle={subtitle}>
      <LenisScroll>
        <ScrollProgress />
        <SiteHeader />
        <BlogDetailView post={post} />
        <SiteFooter />
      </LenisScroll>
    </PageRoutePreloader>
  );
}

