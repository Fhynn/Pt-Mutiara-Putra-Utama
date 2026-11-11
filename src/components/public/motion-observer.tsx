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
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const belowFold = elements.filter(
      (element) => element.getBoundingClientRect().top > window.innerHeight * 1.05
    );
    belowFold.forEach((element, index) => {
      element.classList.add("reveal-node");
      element.style.setProperty("--reveal-delay", `${(index % 3) * 35}ms`);
    });
    root.classList.add("motion-enabled");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px 4% 0px", threshold: 0.08 }
    );

    belowFold.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
