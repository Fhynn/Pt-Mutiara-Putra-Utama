// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GalleryItemManager } from "@/components/admin/gallery-item-manager";

vi.mock("next/image", () => ({
  default: ({ src }: { src: string }) => <span data-testid="foto-preview" data-src={src} />
}));

afterEach(() => cleanup());

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
});
