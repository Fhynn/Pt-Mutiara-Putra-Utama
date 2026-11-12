"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { MoveHorizontal } from "lucide-react";

export function CountryCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScroll: number; active: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateOverflow = () => setHasOverflow(track.scrollWidth > track.clientWidth + 2);
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(track);
    updateOverflow();
    return () => {
      observer.disconnect();
    };
  }, []);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if (event.currentTarget.scrollWidth <= event.currentTarget.clientWidth + 2) return;
    dragRef.current = {
      startX: event.clientX,
      startScroll: event.currentTarget.scrollLeft,
      active: false
    };
    suppressClickRef.current = false;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const distance = event.clientX - drag.startX;
    if (!drag.active && Math.abs(distance) < 5) return;
    if (!drag.active) {
      drag.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.style.scrollSnapType = "none";
    }
    event.currentTarget.scrollLeft = drag.startScroll - distance;
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag?.active) {
      suppressClickRef.current = true;
      const track = event.currentTarget;
      const moved = track.scrollLeft - drag.startScroll;
      const card = track.querySelector<HTMLElement>(".country-card");
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = (card?.getBoundingClientRect().width ?? track.clientWidth) + gap;
      const startIndex = Math.round(drag.startScroll / step);
      const numberOfCards =
        Math.abs(moved) > 50 ? Math.max(1, Math.round(Math.abs(moved) / step)) : 0;
      const target = (startIndex + Math.sign(moved) * numberOfCards) * step;
      track.style.scrollSnapType = "";
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      track.scrollTo({
        left: target,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth"
      });
    }
    dragRef.current = null;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function moveWithKeyboard(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".country-card");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * ((card?.getBoundingClientRect().width ?? track.clientWidth) + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  }

  return (
    <div className="country-carousel">
      <div className={`country-carousel-hint${hasOverflow ? "" : " country-carousel-hint-hidden"}`}>
        <MoveHorizontal size={17} aria-hidden="true" />
        <span>Geser untuk melihat negara lain</span>
      </div>
      <div
        ref={trackRef}
        className="country-grid country-carousel-track"
        tabIndex={0}
        aria-label="Daftar negara tujuan, geser untuk melihat negara lain"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          moveWithKeyboard(event.key === "ArrowRight" ? 1 : -1);
        }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
      >
        {children}
      </div>
    </div>
  );
}
