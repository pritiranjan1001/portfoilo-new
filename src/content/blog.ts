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

/** Full alternate copy for the same post (e.g. Odia). Enables language toggle on the detail page. */
export type BlogLocaleVariant = {
  title: string;
  secondaryHeadline: string;
  body: readonly BlogBodyBlock[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Short secondary headline under the meta row (reference layout). */
  secondaryHeadline: string;
  /** English (primary) fields above; Odia copy for the same post — detail page EN | ଓଡ଼ିଆ toggle. */
  odiaTranslation: BlogLocaleVariant;
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
    odiaTranslation: {
      title: "ଅମରୁଶତକର ଭାବକୁ କ୍ୟାନଭାସ୍‌ରେ ଜଣେ ଉଦୟୀ ଶିଳ୍ପୀ",
      secondaryHeadline: "ବିଷୟ, ରୂପ, ରଙ୍ଗ ଓ ଭାବର ସୂକ୍ଷ୍ମତାକୁ ସ୍ପର୍ଶ କରୁଥିବା ସୃଷ୍ଟି।",
      body: [
        {
          type: "p",
          text: "ଏହି ଲେଖାଟି ଦ ଟେଲିଗ୍ରାଫ୍ ଖବରକାଗଜର ଏକ କତରଣର ଡିଜିଟାଲ୍ ଅଭିଲେଖ (ଲେଖିକା: ଅନ୍ୱେଶା ଅମ୍ବାଲୀ) — ଭୁବନେଶ୍ୱରର ଗ୍ରାଫିକ୍ ଡିଜାଇନର ଜ୍ୟୋତି ରଞ୍ଜନ ସ୍ୱାଇଁ (୪୬), ଯିଏ ଥାର୍ଡ ଆଇ କମ୍ୟୁନିକେସନ୍ସ୍ ପରିଚାଳନା କରନ୍ତି, ଅମରୁଶତକର ପ୍ରତୀକକୁ ଆନ୍ତର୍ଜାତିକ ଦର୍ଶକଙ୍କ ପାଇଁ ଏକ ଶୃଙ୍ଖଳା କ୍ୟାନଭାସ୍‌ରେ ଅନୁବାଦ କରିଥିଲେ।",
        },
        {
          type: "figure",
          src: "/blog/telegraph-amaru-exhibition.png",
          alt: "କୁଆଲାଲମ୍ପୁର ପ୍ରଦର୍ଶନୀ ବିଷୟରେ ଦ ଟେଲିଗ୍ରାଫ୍ ଶିରୋନାମ ଓ ପ୍ରବନ୍ଧ ଲେଆଉଟ୍",
          width: 1024,
          height: 679,
          caption: "ଉତ୍ସ: ଦ ଟେଲିଗ୍ରାଫ୍ କତରଣ (ଶିରୋନାମ + ପ୍ରବନ୍ଧ)।",
        },
        { type: "h2", text: "ପ୍ରଦର୍ଶନୀ" },
        {
          type: "p",
          text: "ପ୍ରବନ୍ଧରେ କୁହାଯାଇଛି ଯେ ଅମରୁଙ୍କ ଅନୁଦିତ ସଂସ୍କୃତ କବିତା ସମ୍ପୁଟି ଅମରୁଶତକକୁ ଆଧାର କରି ୧୫ଟି କ୍ୟାନଭାସ୍‌ର ପ୍ରଦର୍ଶନୀ ୧୬ ଜୁଲାଇ ୨୦୦୮ରେ ମାଲେସିଆର କୁଆଲାଲମ୍ପୁରରେ ଖୋଲିଛି ଏବଂ ପ୍ରାୟ ଏକ ମାସ ପର୍ଯ୍ୟନ୍ତ ଚାଲିବା କଥା ଉଲ୍ଲେଖ ଅଛି।",
        },
        {
          type: "p",
          text: "ଖବରଟି କାମକୁ କାବ୍ୟର ଆଦର୍ଶ ଚରିତ୍ର — ନାୟକ ଓ ନାୟିକା — ଯେଉଁମାନେ ମୋହକ, ତେଜସ୍ୱୀ, ଛଳନାପୂର୍ଣ୍ଣ ବୋଲି ବର୍ଣ୍ଣିତ, ଏବଂ କାମୁକ ପ୍ରେମର ଚିତ୍ରଶିଳ୍ପ ଭାବରେ କେନ୍ଦ୍ରୀୟ — ସେହି ସହ ଚିତ୍ରଗୁଡ଼ିକ ସ୍ଥାୟିତ୍ୱ ଓ କ୍ଷଣିକତାକୁ ଏକାଠି ଧରିବାକୁ ଚେଷ୍ଟା କରେ ବୋଲି ଫ୍ରେମ୍ କରାଯାଇଛି।",
        },
        { type: "h2", text: "ଉତ୍ସବ ପରିପ୍ରେକ୍ଷ୍ୟ" },
        {
          type: "p",
          text: "ପ୍ରଦର୍ଶନୀଟି “Amorous Delight” ନାମକ ଏକ ଉତ୍ସବର ଅଂଶ, ଯାହା ସୁତ୍ର ଫାଉଣ୍ଡେସନ୍ ଦ୍ୱାରା ଆୟୋଜିତ — ମାଲେସିଆର ଓଡିଶୀ ନୃତ୍ୟଶିଳ୍ପୀ ରାମଲି ଇବ୍ରାହିମ୍‌ଙ୍କ ସହ ଯୋଡ଼ା ଏକ କଳା କେନ୍ଦ୍ର — ସେହି କାବ୍ୟ ଜଗତକୁ କେନ୍ଦ୍ର କରି ନୃତ୍ୟ, ସାହିତ୍ୟ ଓ ଦୃଶ୍ୟ କଳାକୁ ଏକାଠି ଆଣେ।",
        },
        {
          type: "p",
          text: "ଲେଖାରେ ଉପସ୍ଥିତ ବ୍ୟକ୍ତିବିଶେଷଙ୍କ ନାମ ମଧ୍ୟ ଅଛି: ଶ୍ରେଷ୍ଠ ଚିତ୍ରଶିଳ୍ପୀ ଓ ଲେଖକ ଡ଼ା. ଦିନନାଥ ପାଠୀ; ମାଲେସିଆରେ ଭାରତର ଉପ-ଉଚ୍ଚ ଆୟୁକ୍ତ ନିଖିଲେଶ ଗିରି; ଏବଂ କଟକର ନୃତ୍ୟଶିଳ୍ପୀ ମୀରା ଦାସ, ଯିଏ କାର୍ଯ୍ୟକ୍ରମର ଅଂଶ ଭାବେ ଓଡିଶୀ ନୃତ୍ୟ ପରିବେଷଣ କରିଥିଲେ।",
        },
        {
          type: "blockquote",
          quote:
            "ଏପରି ପ୍ରଦର୍ଶନୀ ଭାରତ ଓ ମାଲେସିଆ ମଧ୍ୟରେ ସମ୍ପର୍କକୁ ମଜଭୁତ କରିବାରେ ସାହାଯ୍ୟ କରିବ। ଏହି ପ୍ରଦର୍ଶନୀ ଏଠାକାର ଲୋକଙ୍କୁ ଆମ ସଂସ୍କୃତିର ସ୍ୱାଦ ଦେବ। ବିଦେଶରେ ନିଜ କଳା ଓ ସଂସ୍କୃତିକୁ ପ୍ରଚାର କରିବା ସର୍ବଦା ଆନନ୍ଦର ବିଷୟ।",
          cite: "ଡ଼ା. ଦିନନାଥ ପାଠୀ (ଲେଖାରୁ ଉଦ୍ଧୃତ)",
        },
        {
          type: "p",
          text: "ଉତ୍ସ ସାମଗ୍ରୀ: ଉପରେ ପ୍ରତିଲିପି କରାଯାଇଥିବା ଦ ଟେଲିଗ୍ରାଫ୍ କତରଣ (ଶିରୋନାମ + ପ୍ରବନ୍ଧ ଲେଆଉଟ୍)। ମୂଳ ଅନଲାଇନ୍ ଲିଙ୍କ୍ ଯୋଗ କରିବାକୁ ଚାହିଁଲେ URL ଦିଅନ୍ତୁ।",
        },
      ],
    },
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
    title: "Samaja: Kuala Lumpur exhibition — Amar Satakam",
    excerpt:
      "A Samaja news clipping about Jyotiranjan Swain’s solo watercolor exhibition in Kuala Lumpur—reportedly titled “Amar Satakam,” opened by India’s deputy high commissioner, with guests including Dinanath Pathy, Meera Das, and Ramli Ibrahim.",
    secondaryHeadline: "The Samaja — coverage from Kuala Lumpur, Malaysia.",
    odiaTranslation: {
      title: "ବିଦେଶରେ ଓଡ଼ିଆ ଶିଳ୍ପୀଙ୍କ ପ୍ରଦର୍ଶନୀ",
      secondaryHeadline: "ସମାଜ — ମାଲେସିଆର କୁଆଲାଲମ୍ପୁରରୁ ପ୍ରସାରିତ ଖବର।",
      body: [
        {
          type: "p",
          text: "ଏହି ଲେଖାଟି ସମାଜ ଖବରକାଗଜର ଏକ କତରଣ ଅଭିଲେଖ; ଏଥିରେ ଜଣେ ଓଡ଼ିଆ ଶିଳ୍ପୀ ବିଦେଶରେ ନିଜ କାମ ପ୍ରଦର୍ଶନ କରିବାର ଘଟଣାକୁ ଚିହ୍ନିତ କରାଯାଇଛି — କୁଆଲାଲମ୍ପୁରରେ ଏକାକୀ ପ୍ରଦର୍ଶନୀ, ଯାହା କେବଳ ଶିଳ୍ପ ଖୋଲିବା ନୁହେଁ, ଏକ ସାଂସ୍କୃତିକ ମୁହୂର୍ତ୍ତ ଭାବେ ମଧ୍ୟ ଉଠି ଆସେ।",
        },
        {
          type: "figure",
          src: "/blog/news-the-samaj-930x1536-v2.jpg",
          alt: "କୁଆଲାଲମ୍ପୁର ପ୍ରଦର୍ଶନୀ ବିଷୟରେ ସମାଜ ଖବରକାଗଜର କତରଣ",
          width: 930,
          height: 1536,
          caption:
            "ଉତ୍ସ: ସମାଜ କତରଣ (ଶିରୋନାମ ଓ ପ୍ରବନ୍ଧ)। ଉଚ୍ଚ ରିଜୋଲ୍ୟୁସନ ସ୍କାନ: jyotiranjanswain.com",
        },
        { type: "h2", text: "କପିରେ କ'ଣ ଲେଖା ଅଛି" },
        {
          type: "p",
          text: "ପ୍ରବନ୍ଧରେ ମାଲେସିଆର କୁଆଲାଲମ୍ପୁରରେ ଓଡ଼ିଆ ଶିଳ୍ପୀ ଜ୍ୟୋତିରଞ୍ଜନ ସ୍ୱାଇଁଙ୍କ ଏକ ପ୍ରଦର୍ଶନୀର ବର୍ଣ୍ଣନା ଅଛି। ଏକାକୀ ପ୍ରଦର୍ଶନୀର ନାମ “ଅମର ଶତକମ୍” ଭାବେ ଉଲ୍ଲେଖ ହୋଇଛି ଏବଂ ପ୍ରାୟ ୧୫୦ ଜଳରଙ୍ଗ ଚିତ୍ର ଏକ ମାସ ପାଇଁ ପ୍ରଦର୍ଶିତ ହେବା ବିଷୟରେ କୁହାଯାଇଛି।",
        },
        {
          type: "p",
          text: "ଉଦ୍ଘାଟନର ଔପଚାରିକ ଦିଗକୁ ମଧ୍ୟ ଲେଖା ଚିହ୍ନିତ କରେ: ଭାରତର ମାଲେସିଆସ୍ଥିତ ଉପ-ଉଚ୍ଚ ଆୟୁକ୍ତ (କପିରେ ନିଶିତିଶ ଗିରି ଭାବେ ଉଲ୍ଲେଖ) ଉଦ୍ଘାଟନ କରିଥିଲେ; ଉଲ୍ଲେଖନୀୟ ଅତିଥି ମଧ୍ୟରେ ଡ଼ା. ଦିନନାଥ ପାଠୀ, ନୃତ୍ୟଶିଳ୍ପୀ ମୀରା ଦାସ ଏବଂ ଆନ୍ତର୍ଜାତିକ ନୃତ୍ୟଶିଳ୍ପୀ ରାମଲି ଇବ୍ରାହିମ୍ ଅନ୍ତର୍ଭୁକ୍ତ।",
        },
        {
          type: "p",
          text: "ସମ୍ପାଦକୀୟ ଟିପ୍ପଣୀ (ସାରାଂଶ, ଶବ୍ଦଶବ୍ଦ ଅନୁବାଦ ନୁହେଁ): ଲେଖାଟି ଉଦ୍ଘାଟନକୁ କେବଳ ବ୍ୟକ୍ତିଗତ ଷ୍ଟୁଡିଓର ମାଇଲଷ୍ଟୋନ୍ ନୁହେଁ, ବରଂ ମାନ୍ୟଅତିଥି ଓ ପ୍ରତିଷ୍ଠାନର ଉପସ୍ଥିତି ସହ ଏକ ଔପଚାରିକ ସାଂସ୍କୃତିକ ମୁହୂର୍ତ୍ତ ଭାବେ ଚିତ୍ରିତ କରେ।",
        },
      ],
    },
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

