import { describe, expect, it } from "vitest";
import { getAdminPublicLink } from "@/lib/admin-public-links";

describe("tautan hasil perubahan admin", () => {
  it("membuka rincian pekerjaan yang sudah terbit di negara yang juga terbit", () => {
    expect(
      getAdminPublicLink(
        "pekerjaan-negara",
        { countryId: "country-1", slug: "anak-buah-kapal", status: "PUBLISHED" },
        [{ value: "country-1", slug: "taiwan", isPublished: true }]
      )
    ).toMatchObject({
      href: "/negara-tujuan/taiwan/pekerjaan/anak-buah-kapal",
      live: true
    });
  });

  it("tidak mengarahkan draft ke halaman detail yang belum terbit", () => {
    expect(getAdminPublicLink("berita", { slug: "kegiatan-baru", status: "DRAFT" })).toMatchObject({
      href: "/berita",
      live: false
    });
    expect(
      getAdminPublicLink(
        "pekerjaan-negara",
        { countryId: "country-1", slug: "konstruksi", status: "PUBLISHED" },
        [{ value: "country-1", slug: "brunei-darussalam", isPublished: false }]
      )
    ).toMatchObject({ href: "/negara-tujuan", live: false });
  });

  it("mengarah ke daftar setelah data dihapus atau lowongan kedaluwarsa", () => {
    expect(
      getAdminPublicLink("galeri", { slug: "kegiatan-kantor", status: "PUBLISHED" }, [], true)
    ).toMatchObject({ href: "/galeri", live: true });
    expect(
      getAdminPublicLink("lowongan", {
        slug: "konstruksi",
        status: "OPEN",
        deadline: "2020-01-01"
      })
    ).toMatchObject({ href: "/lowongan", live: false });
  });
});
