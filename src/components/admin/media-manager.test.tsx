// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MediaManager } from "@/components/admin/media-manager";

vi.mock("next/image", () => ({ default: () => <span data-testid="foto" /> }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("pengelolaan foto privat", () => {
  it("menjelaskan akses dan dapat menjadikan foto privat tersedia untuk website", async () => {
    const privateItem = {
      id: "foto-1",
      originalName: "kegiatan.jpg",
      kind: "IMAGE",
      mimeType: "image/jpeg",
      visibility: "PRIVATE",
      publicUrl: null,
      sizeBytes: "1000",
      permissionStatus: "PRIVATE_REVIEW_REQUIRED",
      altText: "Foto kegiatan",
      focalX: 0.5,
      focalY: 0.5,
      _count: { usages: 0, galleryItems: 0 }
    };
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) =>
      options?.method === "PATCH"
        ? { ok: true, json: async () => ({ item: { ...privateItem, visibility: "PUBLIC" } }) }
        : { ok: true, json: async () => ({ items: [{ ...privateItem, visibility: "PUBLIC" }] }) }
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true)
    );

    render(<MediaManager initialItems={[privateItem]} configured />);
    expect(screen.getByText("Perlu menyimpan file hanya untuk admin?")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat file" }).getAttribute("href")).toBe(
      "/api/admin/media/foto-1/preview"
    );

    fireEvent.click(screen.getByRole("button", { name: "Jadikan publik" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "makePublic", id: "foto-1", confirmed: true })
    });
    expect(
      screen.getByText(
        "File sekarang dapat dipilih untuk galeri atau bagian website. File belum tampil sampai Anda memilihnya di sana."
      )
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Jadikan publik" })).toBeNull();
  });

  it("menunjukkan album yang memakai foto dan status terbitnya", () => {
    render(
      <MediaManager
        configured
        initialItems={[
          {
            id: "foto-galeri",
            originalName: "kegiatan.jpg",
            kind: "IMAGE",
            mimeType: "image/jpeg",
            visibility: "PUBLIC",
            publicUrl: "https://example.com/kegiatan.jpg",
            sizeBytes: "1000",
            permissionStatus: "CLIENT_PROVIDED",
            altText: "Kegiatan MPU",
            focalX: 0.5,
            focalY: 0.5,
            _count: { usages: 0, galleryItems: 1 },
            galleryItems: [
              {
                album: {
                  id: "album-1",
                  title: "Dokumentasi PT Pusat",
                  slug: "dokumentasi-pt-pusat",
                  status: "PUBLISHED"
                }
              }
            ]
          }
        ]}
      />
    );

    expect(screen.getByRole("link", { name: "Dokumentasi PT Pusat" }).getAttribute("href")).toBe(
      "/admin/galeri/album-1"
    );
    expect(screen.getByText("(terbit)")).toBeTruthy();
    expect(screen.getByRole("link", { name: "lihat di website" }).getAttribute("href")).toBe(
      "/galeri/dokumentasi-pt-pusat"
    );
  });
});
