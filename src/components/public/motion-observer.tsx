"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const animatedSelectors = [
  ".section-heading",
  ".split-grid > *",
  ".trust-item",
  ".service-card",
  ".value-item",
  ".legal-visual",
  ".legal-content",
  ".country-card",
  ".timeline-card",
  ".gallery-item",
  ".faq-item",
  ".content-card",
  ".form-card",
  ".prose-card",
  ".page-hero > .container",
  ".final-cta .cta-grid"
].join(",");

export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(animatedSelectors));

    root.classList.add("motion-enabled");

    elements.forEach((element, index) => {
      element.classList.add("reveal-node");
      element.style.setProperty("--reveal-delay", `${(index % 6) * 55}ms`);
    });

    if (reduceMotion) {
      elements.forEach((element) => element.classList.add("reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
