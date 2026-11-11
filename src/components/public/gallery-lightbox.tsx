"use client";

import Image from "next/image";
import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";

export function GalleryLightbox({
  items
}: {
  items: Array<{
    id: string;
    src: string;
    kind: string;
    alt: string;
    caption?: string | null;
  }>;
}) {
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
          <button
            type="button"
            className="gallery-item"
            key={item.id}
            onClick={() => setSelected(item)}
            style={{ border: 0, padding: 0, cursor: "zoom-in" }}
          >
            {item.kind === "IMAGE" ? (
              <Image src={item.src} alt={item.alt} width={900} height={700} />
            ) : item.kind === "VIDEO" ? (
              <video src={item.src} muted playsInline preload="metadata" aria-label={item.alt} />
            ) : (
              <div className="gallery-video-placeholder">
                <Play aria-hidden="true" /> Video
              </div>
            )}
            <span>{item.caption ?? item.alt}</span>
          </button>
        ))}
      </div>
      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.alt}
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(4,9,29,.92)"
          }}
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setSelected(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "grid",
              width: 46,
              height: 46,
              placeItems: "center",
              border: 0,
              borderRadius: 50,
              background: "white",
              color: "#111c52"
            }}
          >
            <X />
          </button>
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 1100, maxHeight: "88vh" }}
          >
            {selected.kind === "IMAGE" ? (
              <Image
                src={selected.src}
                alt={selected.alt}
                width={1200}
                height={900}
                style={{
                  width: "auto",
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain"
                }}
              />
            ) : selected.kind === "VIDEO" ? (
              <video
                src={selected.src}
                controls
                autoPlay
                style={{ width: "min(960px, 100%)", maxHeight: "80vh" }}
              />
            ) : (
              <a
                href={selected.src}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                Buka video
              </a>
            )}
            <p style={{ color: "white", textAlign: "center" }}>
              {selected.caption ?? selected.alt}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
