import { describe, expect, it } from "vitest";
import { adminResources, normalizeAdminPayload } from "@/lib/admin-resources";

describe("form admin ramah pengguna", () => {
  it("membuat alamat halaman otomatis dari judul", () => {
    const result = normalizeAdminPayload(adminResources.berita, {
      title: "Pelatihan Bahasa untuk CPMI",
      slug: ""
    });

    expect(result.slug).toBe("pelatihan-bahasa-untuk-cpmi");
  });

  it("membersihkan daftar kosong tanpa meminta JSON", () => {
    const result = normalizeAdminPayload(adminResources.lowongan, {
      responsibilities: ["Melayani pelanggan", "", "  Menjaga kebersihan  "]
    });

    expect(result.responsibilities).toEqual(["Melayani pelanggan", "Menjaga kebersihan"]);
  });

  it("memisahkan dokumen umum dan syarat tiap pekerjaan", () => {
    const countryFields = Object.fromEntries(
      adminResources.negara.fields.map((field) => [field.key, field.type])
    );
    const occupationFields = Object.fromEntries(
      adminResources["pekerjaan-negara"].fields.map((field) => [field.key, field.type])
    );
    expect(countryFields.requirements).toBe("list");
    expect(countryFields.salaryDetails).toBeUndefined();
    expect(occupationFields.countryId).toBe("relation");
    expect(occupationFields.ageMin).toBe("number");
    expect(occupationFields.salaryLabel).toBeUndefined();
  });

  it("menyimpan gaji dan kriteria tambahan pekerjaan secara terstruktur", () => {
    const result = normalizeAdminPayload(adminResources["pekerjaan-negara"], {
      title: "Konstruksi",
      slug: "",
      salaryLabel: "RM 1.700",
      ageMin: "18",
      ageMax: "43",
      additionalCriteria: ["  Sehat jasmani dan rohani  ", ""]
    });
    expect(result).toMatchObject({
      slug: "konstruksi",
      salaryLabel: "RM 1.700",
      ageMin: 18,
      ageMax: 43,
      additionalCriteria: ["Sehat jasmani dan rohani"]
    });
  });

  it("menghapus tautan media sosial yang belum diisi", () => {
    const result = normalizeAdminPayload(adminResources.pengaturan, {
      socialLinks: { instagram: "https://instagram.com/mpu", facebook: "" }
    });

    expect(result.socialLinks).toEqual({ instagram: "https://instagram.com/mpu" });
  });

  it("menyerahkan urutan baru ke sistem dan mengambil tahun dari tanggal terbit", () => {
    const album = normalizeAdminPayload(adminResources.galeri, {
      title: "Pelatihan CPMI",
      displayOrder: ""
    });
    const legal = normalizeAdminPayload(adminResources.legalitas, {
      issuedAt: "2021-05-12",
      issuedYear: ""
    });

    expect(album).not.toHaveProperty("displayOrder");
    expect(legal.issuedYear).toBe(2021);
  });
});
