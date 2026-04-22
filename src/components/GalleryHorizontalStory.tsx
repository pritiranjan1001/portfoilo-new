"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useWorkGalleryChrome,
  WorkGalleryCursor,
} from "@/components/WorkGalleryCursor";
import {
  createDebouncedScrollTriggerRefresh,
  horizontalSlideSnap,
  measureHorizontalScrollEnd,
} from "@/lib/horizontal-gallery-scroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLenisInstance } from "@/components/lenis-context";
import { refreshLenisAndScrollTrigger } from "@/lib/lenis-scroll-sync";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

const story = site.galleryStory;

type ImgRef = {
  image: string;
  frameW: number;
  frameH: number;
};

function workToImg(w: (typeof site.works)[number]): ImgRef {
  return {
    image: w.image,
    frameW: w.frameW,
    frameH: w.frameH,
  };
}

function slideToImg(slide: (typeof story.slides)[number]): ImgRef {
  return {
    image: slide.image,
    frameW: slide.frameW,
    frameH: slide.frameH,
  };
}

/** Hero title + light graphic ring — matches Korr’s single bold word-mark feel. */
function SlideHeadline({ title }: { title: string }) {
  return (
    <h2 className="relative inline-block font-display text-[clamp(2rem,9vw,5rem)] font-semibold leading-[0.92] tracking-tight text-neutral-950 dark:text-neutral-50">
      <span className="relative z-[1]">{title}</span>
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-1 top-[52%] h-[0.72em] w-[0.72em] -translate-y-1/2 text-neutral-950/[0.13] dark:text-white/[0.14] md:h-[0.78em] md:w-[0.78em]"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    </h2>
  );
}

function EditorialImage({
  img,
  className,
  priority,
  revealClass = "gallery-reveal-img",
}: {
  img: ImgRef;
  className?: string;
  priority?: boolean;
  revealClass?: string;
}) {
  return (
    <div
      className={`${revealClass} max-h-full overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65 ${className ?? ""}`}
    >
      <Image
        src={img.image}
        alt=""
        width={img.frameW}
        height={img.frameH}
        draggable={false}
        className="h-full w-full object-cover"
        sizes="(max-width: 768px) 45vw, 28vw"
        priority={priority}
      />
    </div>
  );
}

function ScrollArrowHint() {
  return (
    <div
      className="pointer-events-none absolute bottom-6 right-6 z-10 flex items-center gap-3 md:bottom-10 md:right-10"
      aria-hidden
    >
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-500 sm:inline">
        Scroll
      </span>
      <svg
        width="48"
        height="12"
        viewBox="0 0 48 12"
        fill="none"
        className="text-neutral-950/35 dark:text-neutral-200/45"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 6h40m0 0-6-5m6 5-6 5"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function StorySlide({
  slide,
  index,
  horizontal,
  carouselSnap,
}: {
  slide: (typeof story.slides)[number];
  index: number;
  horizontal: boolean;
  /** Mobile: full-viewport slides in a horizontal snap scroller. */
  carouselSnap?: boolean;
}) {
  const wl = site.works.length;
  const extraA = workToImg(site.works[(index * 3 + 2) % wl]!);
  const extraB = workToImg(site.works[(index * 3 + 7) % wl]!);
  const main = slideToImg(slide);
  const variant = index % 3;

  const body = (
    <div
      data-lenis-prevent
      className="gallery-reveal w-full max-w-md"
    >
      <p className="gallery-reveal-inner text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 md:text-[12px] md:leading-relaxed">
        {slide.dek}
      </p>
    </div>
  );

  const kickerBlock = (
    <p className="max-w-[28ch] font-mono text-[9px] uppercase leading-snug tracking-[0.32em] text-neutral-400 dark:text-neutral-500">
      {slide.kicker}
    </p>
  );

  /** Mobile carousel: shorter collage so title + caption stay on-screen; desktop unchanged. */
  const collageBox = (inner: ReactNode) => (
    <div
      className={
        carouselSnap
          ? "relative mt-2 min-h-0 flex-1 overflow-hidden"
          : "relative mt-4 min-h-[min(46vh,460px)] flex-1 overflow-hidden md:mt-6 md:min-h-[min(52vh,580px)]"
      }
    >
      <div
        className={
          carouselSnap
            ? "relative h-full min-h-[min(26vh,220px)] max-h-[min(40vh,400px)]"
            : "relative h-full min-h-[min(46vh,460px)] md:min-h-[min(52vh,580px)]"
        }
      >
        {inner}
      </div>
    </div>
  );

  /** Staggered image collage — three variants for rhythm. */
  const collage =
    variant === 0 ? (
      collageBox(
        <>
          <EditorialImage
            img={main}
            priority={index === 0}
            className="absolute bottom-0 left-0 max-h-[96%] w-[min(48%,302px)] shadow-sm md:w-[44%]"
          />
          <EditorialImage
            img={{ image: extraA.image, frameW: extraA.frameW, frameH: extraA.frameH }}
            revealClass="gallery-float-a overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65"
            className="absolute left-[34%] top-[4%] max-h-[58%] w-[min(32%,216px)] shadow-sm md:left-[36%]"
          />
          <EditorialImage
            img={{ image: extraB.image, frameW: extraB.frameW, frameH: extraB.frameH }}
            revealClass="gallery-float-b overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65"
            className="absolute bottom-4 right-0 max-h-[92%] w-[min(42%,278px)] shadow-sm md:bottom-8 md:w-[40%]"
          />
        </>,
      )
    ) : variant === 1 ? (
      collageBox(
        <>
          <EditorialImage
            img={{ image: extraB.image, frameW: extraB.frameW, frameH: extraB.frameH }}
            revealClass="gallery-float-b overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65"
            className="absolute bottom-0 left-0 max-h-[74%] w-[min(38%,256px)] shadow-sm"
          />
          <EditorialImage
            img={main}
            priority={index === 0}
            className="absolute left-[22%] top-0 max-h-[86%] w-[min(54%,344px)] shadow-sm md:left-[26%]"
          />
          <EditorialImage
            img={{ image: extraA.image, frameW: extraA.frameW, frameH: extraA.frameH }}
            revealClass="gallery-float-a overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65"
            className="absolute bottom-10 right-0 max-h-[66%] w-[min(36%,238px)] shadow-sm md:bottom-14"
          />
        </>,
      )
    ) : (
      collageBox(
        <>
          <EditorialImage
            img={main}
            priority={index === 0}
            className="absolute right-0 top-0 max-h-[82%] w-[min(50%,322px)] shadow-sm md:w-[47%]"
          />
          <EditorialImage
            img={{ image: extraA.image, frameW: extraA.frameW, frameH: extraA.frameH }}
            revealClass="gallery-float-a overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65"
            className="absolute left-0 top-[18%] max-h-[60%] w-[min(36%,238px)] shadow-sm"
          />
          <EditorialImage
            img={{ image: extraB.image, frameW: extraB.frameW, frameH: extraB.frameH }}
            revealClass="gallery-float-b overflow-hidden bg-neutral-200/40 dark:bg-zinc-800/65"
            className="absolute bottom-2 left-[28%] max-h-[76%] w-[min(40%,260px)] shadow-sm md:bottom-6"
          />
        </>,
      )
    );

  const snap = carouselSnap ? "snap-center snap-always " : "";
  const shell = horizontal
    ? carouselSnap
      ? `${snap}relative flex h-[100dvh] w-screen shrink-0 flex-col bg-[#ede8de] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(0.75rem,calc(var(--site-header-height)+0.5rem))] pb-[max(5.25rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] text-neutral-900 dark:bg-[var(--background)] dark:text-neutral-100`
      : `${snap}relative flex h-[100dvh] w-screen shrink-0 flex-col bg-[#ede8de] px-5 pb-10 pt-16 text-neutral-900 dark:bg-[var(--background)] dark:text-neutral-100 md:px-12 md:pb-14 md:pt-20 lg:px-16`
    : `relative flex min-h-[100dvh] w-full flex-col bg-[#ede8de] px-6 py-20 text-neutral-900 dark:bg-[var(--background)] dark:text-neutral-100 md:px-14`;

  return (
    <section
      data-gallery-slide
      className={shell}
      aria-label={`${slide.kicker}: ${slide.title}`}
    >
      <div className="gallery-reveal-panel relative mx-auto flex min-h-0 h-full w-full max-w-[1400px] flex-col overflow-hidden">
        <div className="gallery-reveal-head relative z-10 flex shrink-0 flex-col gap-1 md:max-w-[90%]">
          {kickerBlock}
          <SlideHeadline title={slide.title} />
        </div>

        {collage}

        <div
          className={`mt-auto w-full shrink-0 md:max-w-xl ${
            carouselSnap ? "pt-3" : "pt-6 md:pt-8"
          }`}
        >
          {body}
        </div>

        {horizontal && !carouselSnap ? <ScrollArrowHint /> : null}
      </div>
    </section>
  );
}

export function GalleryHorizontalStory() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dragging, setDragging] = useState(false);
  const chrome = useWorkGalleryChrome();
  const slideCount = story.slides.length;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const lenis = useLenisInstance();

  useEffect(() => {
    setReduceMotion(shouldReduceMotion());
  }, []);

  useEffect(() => {
    if (reduceMotion || !isDesktop) return;
    const outer = outerRef.current;
    if (!outer) return;
    const onDown = () => setDragging(true);
    const onUp = () => setDragging(false);
    outer.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      outer.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [reduceMotion, isDesktop]);

  useGSAP(
    () => {
      if (reduceMotion || !isDesktop) return;
      if (!lenis) return;
      registerGsapPlugins();
      const track = trackRef.current;
      const outer = outerRef.current;
      if (!track || !outer) return;

      const maxX = () =>
        measureHorizontalScrollEnd(outer, track, slideCount);

      const debouncedRefresh = createDebouncedScrollTriggerRefresh(140);

      const tween = gsap.to(track, {
        x: () => -maxX(),
        ease: "none",
        scrollTrigger: {
          scroller: document.documentElement,
          trigger: outer,
          start: "top top",
          end: () => `+=${maxX()}`,
          pin: true,
          pinType: "transform",
          scrub: 1.45,
          snap: horizontalSlideSnap(slideCount),
          fastScrollEnd: false,
          anticipatePin: 0,
          invalidateOnRefresh: true,
        },
      });

      refreshLenisAndScrollTrigger(lenis);

      const slides = track.querySelectorAll<HTMLElement>("[data-gallery-slide]");
      slides.forEach((slideEl) => {
        const panel = slideEl.querySelector<HTMLElement>(".gallery-reveal-panel");
        if (!panel) return;
        gsap.fromTo(
          panel,
          { opacity: 0.25, y: 32 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              scroller: document.documentElement,
              trigger: slideEl,
              containerAnimation: tween,
              start: "left right",
              end: "center center",
              scrub: 0.55,
            },
          },
        );
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => debouncedRefresh.flush());
      });
      const onResize = () => debouncedRefresh.schedule();
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(() => debouncedRefresh.schedule());
      ro.observe(outer);
      ro.observe(track);

      track.querySelectorAll("img").forEach((img) => {
        if (img.complete) return;
        img.addEventListener("load", () => debouncedRefresh.schedule(), {
          once: true,
        });
      });

      let dragLastX = 0;
      let dragActive = false;
      let dragPointerId = 0;

      const blockSelect = (e: Event) => {
        e.preventDefault();
      };
      const clearTextSelection = () => {
        const sel = window.getSelection?.();
        if (sel && sel.rangeCount > 0) sel.removeAllRanges();
      };
      const detachWindowDrag = () => {
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);
      };
      const endDrag = () => {
        if (!dragActive) return;
        dragActive = false;
        document.documentElement.style.removeProperty("user-select");
        document.body.style.userSelect = "";
        document.body.style.removeProperty("-webkit-user-select");
        document.removeEventListener("selectstart", blockSelect, true);
        detachWindowDrag();
        clearTextSelection();
        try {
          outer.releasePointerCapture(dragPointerId);
        } catch {
          /* ignore */
        }
      };

      function onWindowPointerMove(e: PointerEvent) {
        if (!dragActive || e.pointerId !== dragPointerId) return;
        clearTextSelection();
        const dx = e.clientX - dragLastX;
        dragLastX = e.clientX;
        if (Math.abs(dx) < 0.15) return;
        window.scrollBy({ top: -dx * 0.82, left: 0, behavior: "auto" });
        ScrollTrigger.update();
      }

      function onWindowPointerUp(e: PointerEvent) {
        if (e.pointerId !== dragPointerId) return;
        endDrag();
      }

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragActive = true;
        dragPointerId = e.pointerId;
        dragLastX = e.clientX;
        clearTextSelection();
        document.documentElement.style.userSelect = "none";
        document.body.style.userSelect = "none";
        document.body.style.setProperty("-webkit-user-select", "none");
        document.addEventListener("selectstart", blockSelect, true);
        window.addEventListener("pointermove", onWindowPointerMove);
        window.addEventListener("pointerup", onWindowPointerUp);
        window.addEventListener("pointercancel", onWindowPointerUp);
        try {
          outer.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      };

      outer.addEventListener("pointerdown", onPointerDown);

      const onWheelGallery = (e: WheelEvent) => {
        const dx = e.deltaX;
        const dy = e.deltaY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (!(absX > absY * 1.2 && absX > 1.5)) return;
        e.preventDefault();
        window.scrollBy({ top: -dx * 0.82, left: 0, behavior: "auto" });
        ScrollTrigger.update();
      };
      outer.addEventListener("wheel", onWheelGallery, { passive: false });

      return () => {
        document.documentElement.style.removeProperty("user-select");
        document.body.style.userSelect = "";
        document.body.style.removeProperty("-webkit-user-select");
        document.removeEventListener("selectstart", blockSelect, true);
        detachWindowDrag();
        debouncedRefresh.cancel();
        window.removeEventListener("resize", onResize);
        ro.disconnect();
        outer.removeEventListener("pointerdown", onPointerDown);
        outer.removeEventListener("wheel", onWheelGallery);
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: outerRef, dependencies: [reduceMotion, slideCount, isDesktop, lenis] },
  );

  return (
    <section id="gallery" className="bg-[#ede8de] dark:bg-[var(--background)]">
      {reduceMotion ? (
        <div className="mt-0">
          {story.slides.map((slide, wi) => (
            <StorySlide
              key={`gallery-stack-${wi}`}
              slide={slide}
              index={wi}
              horizontal={false}
            />
          ))}
        </div>
      ) : !isDesktop ? (
        <div className="relative mt-0">
          <div
            className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-10 max-w-[9rem] text-right font-mono text-[9px] uppercase leading-snug tracking-[0.3em] text-neutral-400 dark:text-neutral-500"
            aria-hidden
          >
            Swipe · slides
          </div>
          <div
            data-lenis-prevent
            className="flex h-[100dvh] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {story.slides.map((slide, wi) => (
              <StorySlide
                key={`gallery-mobile-${wi}`}
                slide={slide}
                index={wi}
                horizontal
                carouselSnap
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={outerRef}
          className={`relative mt-0 h-[100dvh] min-h-[100dvh] touch-pan-y overflow-hidden ${
            chrome ? "cursor-none" : ""
          }`}
        >
          <WorkGalleryCursor
            zoneRef={outerRef}
            enabled={chrome}
            dragging={dragging}
          />
          <div
            ref={trackRef}
            className="flex h-[100dvh] w-max will-change-transform"
          >
            {story.slides.map((slide, wi) => (
              <StorySlide
                key={`gallery-track-${wi}`}
                slide={slide}
                index={wi}
                horizontal
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
