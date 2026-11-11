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

  it("menyediakan field persyaratan negara tanpa editor JSON", () => {
    const fields = adminResources.negara.fields;
    const fieldTypes = Object.fromEntries(fields.map((field) => [field.key, field.type]));

    expect(fieldTypes.criteria).toBe("list");
    expect(fieldTypes.genderCriteria).toBe("genderCriteria");
    expect(fieldTypes.requirements).toBe("list");
    expect(fieldTypes.salaryDetails).toBe("list");
    expect(fieldTypes.informalSectorInfo).toBe("textarea");
    expect(fieldTypes.formalSectorInfo).toBe("textarea");
  });

  it("menyimpan kriteria perempuan dan laki-laki secara terpisah", () => {
    const result = normalizeAdminPayload(adminResources.negara, {
      genderCriteria: {
        women: { jobs: ["ART", ""], criteria: ["Tinggi minimal 145 cm"] },
        men: { jobs: ["Konstruksi"], criteria: ["  Usia 21–40 tahun  "] }
      }
    });

    expect(result.genderCriteria).toEqual({
      women: { jobs: ["ART"], criteria: ["Tinggi minimal 145 cm"] },
      men: { jobs: ["Konstruksi"], criteria: ["Usia 21–40 tahun"] }
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
