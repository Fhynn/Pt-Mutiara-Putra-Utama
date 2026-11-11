import { describe, expect, it } from "vitest";
import { applicationSchema, contactSchema } from "@/lib/validation";
import { hasPermission } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

describe("validasi formulir publik", () => {
  it("menerima formulir CPMI lengkap dan menolak NIK yang salah", () => {
    const form = {
      countryId: "clx1234567890123456789012",
      sector: "FORMAL",
      preferredOccupation: "Konstruksi",
      fullName: "Budi Santoso",
      nik: "3201010101010001",
      birthPlace: "Bogor",
      birthDate: "1995-01-01",
      gender: "LAKI_LAKI",
      maritalStatus: "BELUM_MENIKAH",
      religion: "ISLAM",
      heightCm: 170,
      weightKg: 65,
      address: "Jalan Melati No. 1",
      rt: "001",
      rw: "002",
      village: "Bojong Kulur",
      district: "Gunung Putri",
      domicile: "Bogor",
      province: "Jawa Barat",
      phone: "+62 812-3456-7890",
      email: "budi@example.com",
      workExperience: "Pernah bekerja sebagai tukang bangunan.",
      consent: true,
      website: ""
    };
    expect(applicationSchema.safeParse(form).success).toBe(true);
    expect(applicationSchema.safeParse({ ...form, nik: "12345" }).success).toBe(false);
  });
  it("menolak kontak tanpa email dan telepon", () => {
    expect(
      contactSchema.safeParse({
        name: "Budi",
        subject: "Informasi",
        message: "Saya ingin mendapatkan informasi program.",
        consent: true,
        website: ""
      }).success
    ).toBe(false);
  });
});

describe("keamanan CMS", () => {
  it("tidak memberikan hak publish kepada editor", () =>
    expect(hasPermission("EDITOR", "content:publish")).toBe(false));
  it("membersihkan script dari rich text", () =>
    expect(sanitizeRichText("<p>Aman</p><script>alert(1)</script>")).toBe("<p>Aman</p>"));
});
