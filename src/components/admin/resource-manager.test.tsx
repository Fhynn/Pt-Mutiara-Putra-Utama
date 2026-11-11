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
  it("mengisi kode bendera otomatis dari nama negara saat disimpan", async () => {
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) =>
      options?.method === "POST"
        ? { ok: true, json: async () => ({}) }
        : { ok: true, json: async () => ({ items: [] }) }
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ResourceManager
        resource="negara"
        config={adminResources.negara}
        initialItems={[]}
        relationOptions={{ mediaImages: [] }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tambah negara" }));
    fireEvent.change(screen.getByLabelText("Nama *"), { target: { value: "Jepang" } });
    expect(screen.queryByLabelText("Kode negara")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const saveCall = fetchMock.mock.calls.find(([, options]) => options?.method === "POST");
    expect(saveCall).toBeTruthy();
    expect(JSON.parse(String(saveCall?.[1]?.body)).data.isoCode).toBe("JP");
  });

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
              previewUrl: "https://example.com/singapura.jpg",
              kind: "IMAGE"
            }
          ],
          mediaUrls: []
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tambah negara" }));
    expect(screen.queryByText("Bendera untuk kartu negara")).toBeNull();
    fireEvent.click(screen.getByText("Pilih foto yang sudah ada"));
    fireEvent.change(screen.getByLabelText("Pilih foto negara yang sudah ada"), {
      target: { value: "media-1" }
    });

    expect(screen.getByTestId("pratinjau-foto").getAttribute("data-src")).toBe(
      "https://example.com/singapura.jpg"
    );
    expect(screen.getByText(/Bendera dibuat otomatis dari nama negara/)).toBeTruthy();
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
    fireEvent.change(screen.getByLabelText("Unggah foto"), {
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

describe("foto beranda di admin", () => {
  it("dapat diunggah langsung dari editor halaman", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [{ id: "foto-hero", kind: "IMAGE", publicUrl: "https://example.com/hero.jpg" }]
      })
    }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("scrollTo", vi.fn());

    render(
      <ResourceManager
        resource="halaman"
        config={adminResources.halaman}
        initialItems={[
          { id: "hero-1", key: "hero", title: "Pembuka", status: "DRAFT", content: {} }
        ]}
        relationOptions={{ mediaUrls: [] }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ubah" }));
    fireEvent.change(screen.getByLabelText("Unggah foto utama"), {
      target: { files: [new File(["foto"], "hero.jpg", { type: "image/jpeg" })] }
    });

    await waitFor(() =>
      expect(screen.getByTestId("pratinjau-foto").getAttribute("data-src")).toBe(
        "https://example.com/hero.jpg"
      )
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/media", {
      method: "POST",
      body: expect.any(FormData)
    });
  });
});
