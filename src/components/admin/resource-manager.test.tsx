// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminResources } from "@/lib/admin-resources";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-testid="pratinjau-foto" data-src={src} aria-label={alt} />
  )
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("foto negara di admin", () => {
  it("dapat memilih foto yang ada dan langsung melihat pratinjaunya", () => {
    render(
      <ResourceManager
        resource="negara"
        config={adminResources.negara}
        initialItems={[]}
        relationOptions={{
          mediaImages: [
            {
              value: "media-1",
              label: "Pemandangan Singapura",
              previewUrl: "https://example.com/singapura.jpg"
            }
          ],
          mediaUrls: []
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tambah negara" }));
    fireEvent.change(screen.getByLabelText("Foto negara untuk halaman detail"), {
      target: { value: "media-1" }
    });

    expect(screen.getByTestId("pratinjau-foto").getAttribute("data-src")).toBe(
      "https://example.com/singapura.jpg"
    );
    expect(screen.getByText(/Kartu daftar tetap memakai bendera/)).toBeTruthy();
  });

  it("dapat mengunggah foto langsung saat menambah negara", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "media-baru",
            kind: "IMAGE",
            publicUrl: "https://example.com/negara-baru.jpg"
          }
        ]
      })
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ResourceManager
        resource="negara"
        config={adminResources.negara}
        initialItems={[]}
        relationOptions={{ mediaImages: [], mediaUrls: [] }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tambah negara" }));
    fireEvent.change(screen.getByLabelText("Atau unggah foto negara baru"), {
      target: { files: [new File(["foto"], "negara.jpg", { type: "image/jpeg" })] }
    });

    await waitFor(() =>
      expect(screen.getByTestId("pratinjau-foto").getAttribute("data-src")).toBe(
        "https://example.com/negara-baru.jpg"
      )
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/media", {
      method: "POST",
      body: expect.any(FormData)
    });
  });
});
