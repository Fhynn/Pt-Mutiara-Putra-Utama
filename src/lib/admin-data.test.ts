import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminResource } from "@/lib/admin-data";

const { findMany, create } = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  prisma: { galleryAlbum: { findMany, create } }
}));

beforeEach(() => {
  findMany.mockReset();
  create.mockReset();
});

describe("otomatisasi album baru", () => {
  it("memberi urutan berikutnya tanpa meminta admin mengisi angka", async () => {
    findMany.mockResolvedValueOnce([{ displayOrder: 2 }]);
    create.mockResolvedValue({ id: "album-1" });

    await createAdminResource("galeri", {
      title: "Kegiatan MPU",
      slug: "kegiatan-mpu",
      category: "Kegiatan",
      status: "DRAFT",
      isFeatured: false
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ displayOrder: 3 })
    });
  });
});
