// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GalleryItemManager } from "@/components/admin/gallery-item-manager";

vi.mock("next/image", () => ({
  default: ({ src }: { src: string }) => <span data-testid="foto-preview" data-src={src} />
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const photo = {
  id: "foto-1",
  originalName: "kegiatan.jpg",
  title: "Kelas persiapan",
  altText: "Kegiatan kelas persiapan CPMI",
  publicUrl: "https://example.com/kegiatan.jpg",
  kind: "IMAGE"
};

describe("editor foto album", () => {
  it("menampilkan foto, lokasi tampil, dan pratinjau file yang dipilih", () => {
    render(
      <GalleryItemManager
        albumId="album-1"
        albumSlug="dokumentasi-pt-pusat"
        albumStatus="PUBLISHED"
        albumFeatured
        initialItems={[
          {
            id: "item-1",
            mediaId: photo.id,
            caption: null,
            displayOrder: 0,
            isCover: true,
            media: photo
          }
        ]}
        media={[photo]}
      />
    );

    expect(screen.getByRole("link", { name: "halaman album ini" }).getAttribute("href")).toBe(
      "/galeri/dokumentasi-pt-pusat"
    );
    expect(screen.getByText("Kelas persiapan")).toBeTruthy();
    expect(screen.getByText("Sampul album")).toBeTruthy();
    expect(screen.getByTestId("foto-preview").getAttribute("data-src")).toBe(photo.publicUrl);

    fireEvent.change(screen.getByLabelText("Pilih file yang sudah diunggah"), {
      target: { value: photo.id }
    });
    expect(screen.getAllByTestId("foto-preview")).toHaveLength(2);
  });

  it("mengunggah foto langsung ke album dan membuat sampul otomatis", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === "/api/admin/media"
        ? { ok: true, json: async () => ({ items: [photo] }) }
        : {
            ok: true,
            json: async () => ({
              item: {
                id: "item-1",
                mediaId: photo.id,
                caption: null,
                displayOrder: 0,
                isCover: true,
                media: photo
              }
            })
          }
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <GalleryItemManager
        albumId="album-1"
        albumSlug="dokumentasi-pt-pusat"
        albumStatus="DRAFT"
        albumFeatured={false}
        initialItems={[]}
        media={[]}
      />
    );

    fireEvent.change(screen.getByLabelText("Unggah foto atau video ke album"), {
      target: { files: [new File(["foto"], "kegiatan.jpg", { type: "image/jpeg" })] }
    });

    await waitFor(() => expect(screen.getByText("Sampul album")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/media", {
      method: "POST",
      body: expect.any(FormData)
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/gallery-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId: "album-1", mediaId: photo.id, caption: null, isCover: true })
    });
  });
});
