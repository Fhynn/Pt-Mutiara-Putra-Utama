import { describe, expect, it } from "vitest";
import { applicationSchema, contactSchema } from "@/lib/validation";
import { hasPermission } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

describe("validasi formulir publik", () => {
  it("menerima pendaftaran minimal yang sah", () => {
    expect(
      applicationSchema.safeParse({
        fullName: "Budi Santoso",
        phone: "+62 812-3456-7890",
        domicile: "Bogor",
        consent: true,
        website: ""
      }).success
    ).toBe(true);
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
