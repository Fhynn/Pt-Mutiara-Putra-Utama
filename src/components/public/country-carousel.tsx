"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { MoveHorizontal } from "lucide-react";

export function CountryCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScroll: number; active: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [indicator, setIndicator] = useState({ visible: false, width: 100, left: 0 });

  const updateIndicator = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const width = Math.min(100, (track.clientWidth / track.scrollWidth) * 100);
    setIndicator({
      visible: maxScroll > 2,
      width,
      left: maxScroll > 0 ? (track.scrollLeft / maxScroll) * (100 - width) : 0
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(track);
    track.addEventListener("scroll", updateIndicator, { passive: true });
    updateIndicator();
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateIndicator);
    };
  }, [updateIndicator]);

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
      <div
        className={`country-carousel-hint${indicator.visible ? "" : " country-carousel-hint-hidden"}`}
      >
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
      {indicator.visible ? (
        <div className="country-carousel-indicator" aria-hidden="true">
          <span style={{ width: `${indicator.width}%`, left: `${indicator.left}%` }} />
        </div>
      ) : null}
    </div>
  );
}
