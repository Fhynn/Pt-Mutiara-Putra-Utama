// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InboxManager } from "@/components/admin/inbox-manager";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("dashboard pendaftar", () => {
  it("menampilkan data lengkap dan menyimpan status penanganan", async () => {
    const send = vi.fn(async () => ({ ok: true, json: async () => ({ item: {} }) }));
    vi.stubGlobal("fetch", send);
    render(
      <InboxManager
        kind="pendaftar"
        canEdit
        initialItems={[
          {
            id: "app-1",
            name: "Budi Santoso",
            referenceNumber: "MPU-2026-00001",
            createdAt: "2026-11-10T08:00:00.000Z",
            status: "NEW",
            phone: "+628123456789",
            email: "budi@example.test",
            domicile: "Bogor",
            country: "Hong Kong",
            message: "Ingin tahu prosesnya."
          }
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "Budi Santoso" })).toBeTruthy();
    expect(screen.getByText("Hong Kong")).toBeTruthy();
    expect(screen.getByText("Ingin tahu prosesnya.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Status penanganan"), {
      target: { value: "CONTACTED" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan status" }));

    await waitFor(() => expect(send).toHaveBeenCalledOnce());
    expect(send).toHaveBeenCalledWith("/api/admin/pendaftar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "app-1", data: { status: "CONTACTED" } })
    });
    await waitFor(() => expect(screen.getAllByText("Sudah dihubungi").length).toBeGreaterThan(0));
  });
});
