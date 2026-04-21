"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

/**
 * Homepage: active section marker for `[data-home-section]`.
 * Avoids ScrollTrigger.refresh / extra Observers on the scroll path (keeps scrolling light).
 */
export function HomeScrollOrchestrator() {
  useGSAP(() => {
    registerGsapPlugins();
    if (shouldReduceMotion()) return;

    const sections = gsap.utils.toArray<HTMLElement>("[data-home-section]");
    if (sections.length === 0) return;

    const triggers: ScrollTrigger[] = [];

    sections.forEach((section) => {
      const id = section.dataset.homeSection ?? "";
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            document.documentElement.dataset.homeActiveSection = id;
          }
        },
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
      document.documentElement.removeAttribute("data-home-active-section");
    };
  });

  return null;
}
