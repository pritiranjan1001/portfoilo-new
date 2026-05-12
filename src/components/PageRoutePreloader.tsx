"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { shouldReduceMotion } from "@/lib/gsap-plugins";
import styles from "./page-route-preloader.module.css";

/** After the first full preloader completes in this tab, skip overlay on client route changes. */
const SESSION_FIRST_LOAD_DONE = "swain-preloader-session-done";

function readSessionFirstLoadDone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_FIRST_LOAD_DONE) === "1";
  } catch {
    return false;
  }
}

function writeSessionFirstLoadDone(): void {
  try {
    window.sessionStorage.setItem(SESSION_FIRST_LOAD_DONE, "1");
  } catch {
    /* private mode / quota */
  }
}

export type PageRoutePreloaderProps = {
  /** Short section title, e.g. "About", "Work". */
  pageLabel: string;
  /** Optional second line (e.g. blog post title). */
  pageSubtitle?: string;
  children: ReactNode;
};

function sleep(ms: number): Promise<void> {
  const t = Math.max(0, ms);
  return t === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, t));
}

function raceTimeout<T>(p: Promise<T>, ms: number): Promise<T | "timeout"> {
  return Promise.race([
    p.then((v) => v as T),
    sleep(ms).then(() => "timeout" as const),
  ]);
}

/** `load` can hang in dev if a resource never finishes — bound wait. */
function waitForWindowLoad(maxMs: number): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    window.addEventListener("load", done, { once: true });
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "complete") done();
    });
    setTimeout(done, maxMs);
  });
}

function waitForFonts(maxMs: number): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const f = document.fonts;
  if (!f?.ready) return Promise.resolve();
  return raceTimeout(f.ready.then(() => undefined), maxMs).then(() => undefined);
}

function waitFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    let n = 0;
    function tick() {
      n += 1;
      if (n >= count) resolve();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function waitImage(img: HTMLImageElement): Promise<void> {
  if (img.complete) {
    if (img.naturalWidth > 0) {
      const d = img.decode?.();
      return d != null ? d.catch(() => undefined) : Promise.resolve();
    }
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

/**
 * Next/Image (and native) defer offscreen work with lazy + low fetch priority.
 * Those should not block the route preloader — only “hero” / eager images do.
 */
function isDeferredImage(img: HTMLImageElement): boolean {
  if (img.complete) return false;
  if (img.loading === "lazy") return true;
  const fp = img.getAttribute("fetchpriority");
  return fp === "low";
}

function waitVideo(v: HTMLVideoElement): Promise<void> {
  const HAVE_CURRENT_DATA = 2;
  if (v.readyState >= HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    v.addEventListener("loadeddata", done, { once: true });
    v.addEventListener("error", done, { once: true });
  });
}

function allImagesDecoded(root: HTMLElement | null): boolean {
  if (!root) return true;
  for (const img of root.querySelectorAll("img")) {
    if (isDeferredImage(img)) continue;
    if (!img.complete) return false;
  }
  return true;
}

function allVideosReady(root: HTMLElement | null): boolean {
  if (!root) return true;
  const HAVE_CURRENT_DATA = 2;
  return [...root.querySelectorAll("video")].every((v) => v.readyState >= HAVE_CURRENT_DATA);
}

/** Optional: WebGL canvas has layout size — never block forever (see wait loop). */
function allCanvasesPainted(root: HTMLElement | null): boolean {
  if (!root) return true;
  const canvases = [...root.querySelectorAll("canvas")];
  if (canvases.length === 0) return true;
  return canvases.every((c) => c.clientWidth > 0 && c.clientHeight > 0);
}

function routeMediaReady(root: HTMLElement | null): boolean {
  return allImagesDecoded(root) && allVideosReady(root);
}

/**
 * Fonts + document complete (bounded), then only **blocking** images (not lazy / fetchPriority=low)
 * and video. Matches Next/Image on /work: many slides defer; we don’t wait for the whole strip.
 */
async function waitForRouteContentReady(root: HTMLElement | null, reduceMotion: boolean): Promise<void> {
  const capMs = reduceMotion ? 6500 : 12000;
  const capUntil = performance.now() + capMs;
  const timeLeft = () => Math.max(0, capUntil - performance.now());

  const fontBudget = Math.min(2200, capMs);
  const loadBudget = Math.min(4500, capMs);

  await Promise.all([waitForFonts(fontBudget), waitForWindowLoad(loadBudget)]);

  const canvasBudgetUntil = performance.now() + Math.min(2800, timeLeft());

  while (performance.now() < capUntil) {
    const mediaOk = routeMediaReady(root);
    const canvasOk = allCanvasesPainted(root) || performance.now() >= canvasBudgetUntil;
    if (mediaOk && canvasOk) break;

    const imgs = root ? [...root.querySelectorAll("img")].filter((img) => !isDeferredImage(img)) : [];
    const pendingImgs = imgs.filter((img) => !img.complete);
    const HAVE_CURRENT_DATA = 2;
    const pendingVideos = root
      ? [...root.querySelectorAll("video")].filter((v) => v.readyState < HAVE_CURRENT_DATA)
      : [];

    await Promise.race([
      Promise.all([...pendingImgs.map((img) => waitImage(img)), ...pendingVideos.map((v) => waitVideo(v))]),
      sleep(Math.min(250, timeLeft())),
    ]);

    const mediaOk2 = routeMediaReady(root);
    const canvasOk2 = allCanvasesPainted(root) || performance.now() >= canvasBudgetUntil;
    if (mediaOk2 && canvasOk2) break;

    await sleep(Math.min(80, timeLeft()));
  }

  await waitFrames(2);
}

type PreloadPhase = "boot" | "loading" | "exit" | "gone";

export function PageRoutePreloader({ pageLabel, pageSubtitle, children }: PageRoutePreloaderProps) {
  const reduce = shouldReduceMotion();
  const [phase, setPhase] = useState<PreloadPhase>("boot");
  const contentRef = useRef<HTMLDivElement>(null);
  const skipSessionRef = useRef(false);

  useLayoutEffect(() => {
    if (readSessionFirstLoadDone()) skipSessionRef.current = true;
  }, []);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (phase === "gone") {
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
      return;
    }

    if (skipSessionRef.current) {
      setPhase("gone");
      return;
    }

    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [phase]);

  useLayoutEffect(() => {
    if (skipSessionRef.current || phase === "gone") return;
    if (phase !== "boot") return;
    const id = requestAnimationFrame(() => setPhase("loading"));
    return () => cancelAnimationFrame(id);
  }, [phase]);

  useEffect(() => {
    if (skipSessionRef.current || phase === "gone") return;
    let cancelled = false;
    const run = async () => {
      try {
        await waitFrames(1);
        if (cancelled) return;
        await waitForRouteContentReady(contentRef.current, reduce);
      } catch {
        /* still dismiss */
      }
      if (!cancelled) setPhase("exit");
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [phase, reduce]);

  useEffect(() => {
    if (phase !== "exit") return;
    const ms = reduce ? 340 : 980;
    const t = setTimeout(() => setPhase("gone"), ms);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  useEffect(() => {
    if (phase !== "gone") return;
    writeSessionFirstLoadDone();
  }, [phase]);

  const overlayPhase: PreloadPhase | null = phase === "gone" ? null : phase;

  return (
    <>
      <div ref={contentRef} className={styles.contentRoot} data-route-preloader-content>
        {children}
      </div>
      {overlayPhase ? (
        <div
          className={styles.root}
          data-phase={overlayPhase}
          data-reduce={reduce ? "1" : undefined}
          aria-busy="true"
          aria-live="polite"
          aria-label={pageSubtitle ? `Loading ${pageLabel}: ${pageSubtitle}` : `Loading ${pageLabel}`}
        >
          <div className={styles.ambient} aria-hidden>
            <div className={styles.ambientBlobA} />
            <div className={styles.ambientBlobB} />
          </div>
          <div className={styles.grain} aria-hidden />
          <div className={styles.vignette} aria-hidden />

          <div className={styles.shell}>
            <div className={styles.plate}>
              <div className={styles.plateGlow} aria-hidden />

              <div className={styles.mainCol}>
                <div className={styles.birdRing} aria-hidden>
                  <svg className={styles.birdSvg} viewBox="0 0 100 100" fill="none">
                    <g transform="translate(50 50)">
                      <circle
                        className={styles.ringStroke}
                        cx="0"
                        cy="0"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="0.75"
                        opacity="0.22"
                      />
                      <g className={styles.ringSpin}>
                        <circle
                          className={styles.ringStrokeInner}
                          cx="0"
                          cy="0"
                          r="44"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeDasharray="4 14"
                          strokeLinecap="round"
                          opacity="0.42"
                        />
                      </g>
                      <g className={styles.birdOrbit}>
                        <g transform="translate(0 -32)">
                          <g className={styles.bird}>
                            <path className={styles.birdTail} d="M -9 3 L -14 6 L -11 1 Z" />
                            <ellipse className={styles.birdBody} cx="-1" cy="1" rx="7" ry="4.2" />
                            <path
                              className={styles.birdWing}
                              d="M -4 0 Q -12 -2 -14 2 Q -10 5 -3 3"
                              stroke="currentColor"
                              strokeWidth="0.35"
                            />
                            <circle className={styles.birdEye} cx="4" cy="0" r="1.1" />
                            <circle className={styles.birdPupil} cx="4.2" cy="-0.15" r="0.45" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>

                <p className={styles.pageTag}>{pageLabel}</p>
              </div>

              <div className={styles.meter} aria-hidden>
                <span className={styles.meterDot} />
                <span className={styles.meterDot} />
                <span className={styles.meterDot} />
                <span className={styles.meterTrack}>
                  <span className={styles.meterFill} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
