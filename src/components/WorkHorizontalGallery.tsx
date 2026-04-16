"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useWorkGalleryChrome,
  WorkGalleryCursor,
  WorkGalleryScrollHint,
} from "@/components/WorkGalleryCursor";
import {
  createDebouncedScrollTriggerRefresh,
  horizontalSlideSnap,
  measureHorizontalScrollEnd,
} from "@/lib/horizontal-gallery-scroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

const workIds = site.works.map((_, i) => `work-slide-${i}`);

/** Preload first N slides so horizontal scroll / swipe doesn’t wait on each new image. */
const WORK_IMAGE_PRELOAD_COUNT = 4;

/** Tiny neutral placeholder while Next Image resolves (perceived faster load). */
const WORK_IMAGE_BLUR_DATA =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function WorkSlideDetails({
  work,
  flip,
  horizontal,
  centered,
}: {
  work: (typeof site.works)[number];
  flip: boolean;
  horizontal: boolean;
  /** Center-aligned caption (stacked image + text layout). */
  centered?: boolean;
}) {
  const dimensions = "dimensions" in work ? work.dimensions : undefined;
  const medium = "medium" in work ? work.medium : undefined;
  const extraBlurb = "blurb" in work && work.blurb ? work.blurb : null;

  const scrollShell = horizontal
    ? "max-h-[min(52dvh,28rem)] overflow-y-auto md:max-h-[min(58dvh,32rem)] max-md:max-h-none max-md:overflow-visible"
    : "max-h-none overflow-visible";

  return (
    <div
      data-no-gallery-drag
      data-lenis-prevent
      className={`w-full select-text overscroll-y-contain pr-1 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] ${scrollShell} ${
        centered
          ? "mx-auto max-w-5xl text-center"
          : `max-w-md max-md:mx-auto max-md:text-center ${flip ? "md:ml-auto" : ""}`
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
        {work.category} · {work.year}
      </p>
      <h2
        className={`font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white ${
          centered ? "mt-1" : "mt-4"
        }`}
      >
        {work.title}
      </h2>
      {dimensions ? (
        <p
          className={`font-mono text-xs text-white/65 ${centered ? "mt-1" : "mt-3"}`}
        >
          {dimensions}
        </p>
      ) : null}

      <div>
        {medium ? (
          <p
            className={`text-pretty font-body text-sm leading-relaxed text-white/75 ${
              centered ? "mt-0.5" : "mt-2"
            }`}
          >
            {medium}
          </p>
        ) : null}
        {extraBlurb ? (
          <p
            className={`text-pretty font-body leading-snug italic text-white/85 ${
              centered
                ? "mt-2 text-sm md:text-base"
                : "mt-6 text-base md:text-lg"
            }`}
          >
            {extraBlurb}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function noiseBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.14%22/%3E%3C/svg%3E')] opacity-50 mix-blend-overlay"
      aria-hidden
    />
  );
}

function WorkSlide({
  work,
  wi,
  flip,
  horizontal,
  carouselSnap,
  showDetails = true,
}: {
  work: (typeof site.works)[number];
  wi: number;
  flip: boolean;
  horizontal: boolean;
  /** Mobile horizontal snap carousel — full-viewport slides that swipe sideways. */
  carouselSnap?: boolean;
  /** Render caption/title/details column. */
  showDetails?: boolean;
}) {
  const border = horizontal
    ? "border-l border-[var(--border)]"
    : "border-t border-[var(--border)]";
  const snap = carouselSnap ? "snap-center snap-always " : "";
  const base =
    horizontal
      ? `${snap}editorial-panel relative flex h-[100dvh] min-h-0 w-screen shrink-0 select-none flex-col overflow-hidden px-6 pb-10 pt-0 max-md:justify-center max-md:pb-0 md:px-14 md:pb-12 md:pt-[max(1.25rem,calc(var(--site-header-height)+1.25rem))] ${border}`
      : `relative flex min-h-[100dvh] w-full flex-col justify-center overflow-hidden px-6 py-24 md:px-14 ${border}`;

  const imageUrl = "image" in work ? work.image : undefined;
  const frameW =
    "frameW" in work && typeof work.frameW === "number" ? work.frameW : 1024;
  const frameH =
    "frameH" in work && typeof work.frameH === "number" ? work.frameH : 796;

  const galleryImages =
    "galleryImages" in work &&
    Array.isArray(work.galleryImages) &&
    work.galleryImages.length > 0
      ? work.galleryImages
      : null;

  const stacked =
    "stackedCaption" in work && work.stackedCaption === true;

  return (
    <section id={workIds[wi]} className={base}>
      <div
        className={`deck-bg pointer-events-none absolute inset-0 bg-gradient-to-br ${work.accent}`}
        aria-hidden
      />
      {noiseBg()}

      <div
        className={
          stacked
            ? "deck-fg relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-center gap-5 md:gap-8"
            : `deck-fg relative z-10 mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 content-center items-center gap-6 md:gap-16 ${
                flip ? "md:grid-cols-[1fr_1.05fr]" : "md:grid-cols-[1.05fr_1fr]"
              }`
        }
      >
        <div
          className={`flex w-full min-w-0 justify-center ${
            stacked
              ? "shrink-0 flex-col items-center"
              : flip
                ? "md:order-2"
                : ""
          }`}
        >
          <div
            className={
              stacked
                ? "relative mx-auto w-full min-w-0 max-w-full"
                : "relative mx-auto inline-block max-w-full max-md:max-w-[min(88vw,17.5rem)] md:max-w-full"
            }
          >
            <div
              className="relative overflow-hidden [&_img]:select-none [&_img]:[-webkit-user-drag:none]"
              onDragStart={(e) => e.preventDefault()}
            >
            {galleryImages ? (
              <div
                className={`flex w-full min-w-0 items-center justify-center ${
                  stacked
                    ? "flex-wrap gap-1.5 px-1 py-0 sm:gap-2 md:flex-nowrap md:gap-2.5 md:px-2"
                    : "gap-2 px-2 py-3 sm:gap-3 sm:px-3 sm:py-4 md:gap-5 md:px-5 md:py-6"
                }`}
              >
                {galleryImages.map((gi, ii) => (
                  <div
                    key={`${wi}-g-${ii}`}
                    className={
                      stacked
                        ? "relative shrink-0"
                        : "relative min-h-0 min-w-0 flex-1"
                    }
                  >
                    <Image
                      src={gi.src}
                      alt={
                        galleryImages.length > 1
                          ? `${work.title} (${ii + 1} of ${galleryImages.length})`
                          : work.title
                      }
                      width={gi.frameW}
                      height={gi.frameH}
                      draggable={false}
                      className={`object-contain ${
                        stacked
                          ? "h-[min(14dvh,112px)] w-auto shrink-0 md:h-[min(24dvh,255px)]"
                          : "mx-auto h-auto w-full max-w-full max-h-[min(34dvh,300px)] md:max-h-[min(64dvh,760px)]"
                      }`}
                      sizes="(max-width: 768px) 17vw, 11vw"
                      quality={78}
                      placeholder="blur"
                      blurDataURL={WORK_IMAGE_BLUR_DATA}
                      priority={wi < WORK_IMAGE_PRELOAD_COUNT}
                      fetchPriority={
                        wi === 0 && ii === 0
                          ? "high"
                          : wi < WORK_IMAGE_PRELOAD_COUNT
                            ? "auto"
                            : "low"
                      }
                    />
                  </div>
                ))}
              </div>
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt={work.title}
                width={frameW}
                height={frameH}
                draggable={false}
                className="h-auto w-auto max-w-full object-contain max-md:max-h-[min(38dvh,300px)] md:max-h-[min(70dvh,780px)]"
                sizes="(max-width: 768px) 88vw, min(50vw, 900px)"
                quality={78}
                placeholder="blur"
                blurDataURL={WORK_IMAGE_BLUR_DATA}
                priority={wi < WORK_IMAGE_PRELOAD_COUNT}
                fetchPriority={wi === 0 ? "high" : wi < WORK_IMAGE_PRELOAD_COUNT ? "auto" : "low"}
              />
            ) : (
              <div className="relative min-h-[min(28dvh,240px)] w-full min-w-[min(100%,20rem)] md:min-h-[min(50dvh,420px)]">
                <div className={`absolute inset-0 bg-gradient-to-br ${work.accent}`} />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.75%22%20numOctaves=%224%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22%20opacity=%220.2%22/%3E%3C/svg%3E')] opacity-60 mix-blend-overlay" />
              </div>
            )}
            {showDetails ? (
              <span className="absolute right-3 top-3 z-[1] font-mono text-[10px] text-white/55">
                {String(wi + 1).padStart(2, "0")} /{" "}
                {String(site.works.length).padStart(2, "0")}
              </span>
            ) : null}
          </div>
          </div>
        </div>
        {showDetails ? (
          <div
            className={`flex min-h-0 min-w-0 flex-col ${
              stacked
                ? "shrink-0 items-center text-center"
                : `justify-center max-md:items-center max-md:text-center ${
                    flip ? "md:order-1 md:items-end md:text-right" : ""
                  }`
            }`}
          >
            <WorkSlideDetails
              work={work}
              flip={stacked ? false : flip}
              horizontal={horizontal}
              centered={stacked}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function WorkHorizontalGallery() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dragging, setDragging] = useState(false);
  const chrome = useWorkGalleryChrome();
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
      registerGsapPlugins();
      const track = trackRef.current;
      const outer = outerRef.current;
      if (!track || !outer) return;

      const slideCount = site.works.length;

      const maxX = () =>
        measureHorizontalScrollEnd(outer, track, slideCount);

      const debouncedRefresh = createDebouncedScrollTriggerRefresh(140);

      const tween = gsap.to(track, {
        x: () => -maxX(),
        ease: "none",
        scrollTrigger: {
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

      requestAnimationFrame(() => {
        requestAnimationFrame(() => debouncedRefresh.flush());
      });
      const onResize = () => debouncedRefresh.schedule();
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(() => debouncedRefresh.schedule());
      ro.observe(outer);
      ro.observe(track);

      const imgs = track.querySelectorAll("img");
      imgs.forEach((img) => {
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
        const t = e.target as HTMLElement | null;
        if (t?.closest("[data-no-gallery-drag]")) return;
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

      /**
       * Let **vertical** wheel use native document scrolling (inertia, OS tuning, no fighting ST).
       * Only intercept **horizontal-dominant** gestures (trackpad sideways / some shift+wheel)
       * and map them to vertical scroll — those would not move the page otherwise.
       */
      const onWheelGallery = (e: WheelEvent) => {
        const t = e.target;
        if (t instanceof HTMLElement && t.closest("[data-no-gallery-drag]")) return;

        const dx = e.deltaX;
        const dy = e.deltaY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        const horizontalIntent =
          absX > absY * 1.2 && absX > 1.5;

        if (!horizontalIntent) return;

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
    { scope: outerRef, dependencies: [reduceMotion, isDesktop] },
  );

  return (
    <section id="work">
      <div className="mx-auto hidden max-w-6xl px-6 pt-16 md:block md:px-14 md:pt-20">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
          Work
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
          Paintings · 2016
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Scroll vertically to move through the gallery—drag sideways on desktop or use a
          horizontal trackpad gesture. Long captions scroll inside the text column.
        </p>
      </div>

      {reduceMotion ? (
        <div className="mt-12 bg-[var(--background)]">
          {site.works.map((work, wi) => (
            <WorkSlide
              key={`work-stack-${wi}`}
              work={work}
              wi={wi}
              flip={wi % 2 === 1}
              horizontal={false}
            />
          ))}
        </div>
      ) : !isDesktop ? (
        <div className="relative">
          <div
            data-lenis-prevent
            className="flex h-[100dvh] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {site.works.map((work, wi) => (
              <WorkSlide
                key={`work-mobile-${wi}`}
                work={work}
                wi={wi}
                flip={wi % 2 === 1}
                horizontal
                carouselSnap
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={outerRef}
          className={`relative mt-10 h-[100dvh] min-h-[100dvh] touch-pan-y overflow-hidden md:mt-14 ${
            chrome && !reduceMotion ? "cursor-none" : ""
          }`}
        >
          <WorkGalleryCursor
            zoneRef={outerRef}
            enabled={chrome && !reduceMotion}
            dragging={dragging}
          />
          <WorkGalleryScrollHint />
          <div
            ref={trackRef}
            className="flex h-[100dvh] w-max will-change-transform"
          >
            {site.works.map((work, wi) => (
              <WorkSlide
                key={`work-track-${wi}`}
                work={work}
                wi={wi}
                flip={wi % 2 === 1}
                horizontal
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
