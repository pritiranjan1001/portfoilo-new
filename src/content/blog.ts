export type BlogBodyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "blockquote"; quote: string; cite?: string }
  | {
      type: "figure";
      src: string;
      alt: string;
      width: number;
      height: number;
      caption: string;
    };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Short secondary headline under the meta row (reference layout). */
  secondaryHeadline: string;
  /** Hero image shown in the clipped frame. */
  heroImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  /** Vertical rail links (labels only; URLs optional). */
  socials?: readonly { label: string; href?: string }[];
  date: string; // ISO-ish for display
  tags: readonly string[];
  /** Used for artistic gradients + scene palette. */
  palette: {
    ink: string;
    accent: string;
    paper: string;
  };
  body: readonly BlogBodyBlock[];
};

export const blogPosts: readonly BlogPost[] = [
  {
    slug: "budding-artist-paints-amarus-verses-on-canvas",
    title: "Budding artist paints Amaru's verses on canvas",
    excerpt:
      "A Telegraph clipping about Jyoti Ranjan Swain’s Kuala Lumpur exhibition—15 canvases inspired by the Amarushataka, staged as part of the Sutra Foundation’s “Amorous Delight” festival.",
    secondaryHeadline: "Creations deal with intricacies of theme, form, colour and essence.",
    heroImage: {
      src: "/artworks/Painting-2-min-1536x1194.webp",
      alt: "Painting used as the cover image for this journal entry",
      width: 1536,
      height: 1194,
    },
    socials: [{ label: "Journal" }],
    date: "2008-07-16T09:30:00",
    tags: ["art", "exhibition", "amarushataka", "kuala-lumpur", "press"],
    palette: { ink: "#14110d", accent: "#c45c2a", paper: "#f6f1e9" },
    body: [
      {
        type: "p",
        text: "This entry digitizes a Telegraph clipping (bylined to Anwesha Ambaly) about Bhubaneswar-based graphic designer Jyoti Ranjan Swain (46)—known for running Third Eye Communications—who translated Amarushataka imagery into a suite of canvases for an international audience.",
      },
      {
        type: "figure",
        src: "/blog/telegraph-amaru-exhibition.png",
        alt: "The Telegraph masthead and article layout about the Kuala Lumpur exhibition",
        width: 1024,
        height: 679,
        caption: "Source: The Telegraph clipping (masthead + article).",
      },
      { type: "h2", text: "The exhibition" },
      {
        type: "p",
        text: "The piece describes an exhibition of 15 canvases rooted in the Amarushataka—an anthology of Sanskrit poems attributed to Amaru—opened on 16 July in Kuala Lumpur, Malaysia, and slated to run for a month.",
      },
      {
        type: "p",
        text: "The reporting frames the work around the poems’ archetypes: the nayaka and nayika, described as charming, radiant, deceitful, and central to an iconography of erotic love—while the paintings aim to hold both permanence and transience in the same breath.",
      },
      { type: "h2", text: "Festival context" },
      {
        type: "p",
        text: "The show sits inside a festival titled “Amorous Delight,” organized by the Sutra Foundation—an arts center associated with Malaysian Odissi dancer Ramli Ibrahim—bringing together dance, literature, and visual art around the same poetic world.",
      },
      {
        type: "p",
        text: "The article also names figures present in the room: eminent artist and author Dinanath Pathy; India’s deputy high commissioner to Malaysia, Nikhilesh Giri; and Cuttack-based dancer Meera Das, who performed an Odissi recital as part of the program.",
      },
      {
        type: "blockquote",
        quote:
          "Such exhibitions will help strengthen the bond between India and Malaysia. This exhibition will let people here have a taste of our culture. Promoting your art and culture in a foreign land is always a pleasure.",
        cite: "Dinanath Pathy (as quoted in the piece)",
      },
      {
        type: "p",
        text: "Source material: The Telegraph clipping reproduced above (masthead + article layout). If you want this entry to link to the original online article, tell me the URL and I’ll wire it in as a primary citation.",
      },
    ],
  },
  {
    slug: "samaja-exhibition-kuala-lumpur-amar-satakam",
    title: "ବିଦେଶରେ ଓଡ଼ିଆ ଶିଳ୍ପୀଙ୍କ ପ୍ରଦର୍ଶନୀ",
    excerpt:
      "A Samaja news clipping about Jyotiranjan Swain’s solo watercolor exhibition in Kuala Lumpur—reportedly titled “Amar Satakam,” opened by India’s deputy high commissioner, with guests including Dinanath Pathy, Meera Das, and Ramli Ibrahim.",
    secondaryHeadline: "The Samaja — coverage from Kuala Lumpur, Malaysia.",
    heroImage: {
      src: "/artworks/Painting-2-min-1536x1194.webp",
      alt: "Painting used as the cover image for this journal entry",
      width: 1536,
      height: 1194,
    },
    socials: [{ label: "Journal" }],
    date: "2024-11-18T10:15:00",
    tags: ["press", "exhibition", "kuala-lumpur", "watercolor", "samaja"],
    palette: { ink: "#14110d", accent: "#8b1e3a", paper: "#f6f1e9" },
    body: [
      {
        type: "p",
        text: "This entry is a digital archive of a Samaja newspaper clipping about an Odia artist showing work abroad: a solo exhibition in Kuala Lumpur, framed as a cultural moment as much as an art opening.",
      },
      {
        type: "figure",
        src: "/blog/news-the-samaj-930x1536-v2.jpg",
        alt: "Scanned newspaper clipping from The Samaja about the Kuala Lumpur exhibition",
        width: 930,
        height: 1536,
        caption: "Source: The Samaja clipping (masthead + article). High-res scan: jyotiranjanswain.com",
      },
      { type: "h2", text: "What the clipping reports" },
      {
        type: "p",
        text: "The article describes an exhibition in Kuala Lumpur, Malaysia featuring Odia artist Jyotiranjan Swain. The coverage names the solo show as “Amar Satakam,” and notes a large body of work—around 150 watercolor paintings—on display for about a month.",
      },
      {
        type: "p",
        text: "The piece also records the ceremonial side of the opening: the exhibition was inaugurated by the Deputy High Commissioner of India in Malaysia (named in the clipping as Nishitish Giri), with notable guests including Dr. Dinanath Pathy, dancer Meera Das, and international dancer Ramli Ibrahim.",
      },
      {
        type: "p",
        text: "Editor’s note (summary, not a verbatim extract): the article frames the opening as a ceremonial cultural moment—guests of honor and institutional presence alongside the work—rather than only a private studio milestone.",
      },
      {
        type: "p",
        text: "If you want this post to match the clipping verbatim (Odia body copy typed in full), upload a clearer text transcript or PDF and I’ll replace my English summary with the original language column-for-column.",
      },
    ],
  },
];

function normalizeBlogSlug(input: string) {
  const s = String(input ?? "");
  const decoded = (() => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  })();
  return decoded.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

export function getBlogPost(slug: string) {
  const key = normalizeBlogSlug(slug);
  return blogPosts.find((p) => normalizeBlogSlug(p.slug) === key) ?? null;
}

