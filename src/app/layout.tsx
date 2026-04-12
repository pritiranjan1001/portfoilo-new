import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, JetBrains_Mono, Libre_Baskerville, Syne } from "next/font/google";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { site } from "@/lib/site";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const fontSerif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name}`,
    description: site.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontSerif.variable} ${fontBody.variable} ${fontMono.variable} h-full scroll-smooth antialiased`}
    >
      <body
        className="min-h-full min-h-[100dvh] bg-[var(--background)] font-body text-[var(--foreground)]"
        suppressHydrationWarning
      >
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
.header-inner--entrance,
#top .landing-hero-tagline,
#top .landing-hero-name .landing-hero-name-line,
#top .landing-hero-cta > a,
#top .landing-hero-cta .landing-hero-cta-rule,
#top .landing-hero-portrait-motion,
#top .landing-hero-scroll,
#prelude .bvc-kicker,
#prelude .bvc-step,
#prelude .bvc-line1,
#prelude .bvc-line2,
#prelude .bvc-eye,
#prelude .bvc-tag,
#prelude .bvc-cta,
#prelude .bvc-bottom-cap {
  opacity: 1 !important;
  transform: none !important;
}
`,
            }}
          />
        </noscript>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ScrollToTopOnNavigate />
        {children}
      </body>
    </html>
  );
}
