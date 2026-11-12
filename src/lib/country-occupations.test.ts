import { describe, expect, it } from "vitest";
import { getCountryOccupationOptions } from "@/lib/country-occupations";

describe("pilihan pekerjaan negara", () => {
  const country = {
    occupations: [
      { title: "Asisten Rumah Tangga (ART)", gender: "PEREMPUAN", status: "PUBLISHED" },
      { title: "Terapis SPA", gender: null, status: "PUBLISHED" },
      { title: "Konstruksi", gender: "LAKI_LAKI", status: "PUBLISHED" },
      { title: "Pekerjaan draf", gender: null, status: "DRAFT" }
    ]
  };

  it("menyaring pekerjaan menurut jenis kelamin dan hanya yang diterbitkan", () => {
    expect(getCountryOccupationOptions(country, "PEREMPUAN")).toEqual([
      "Asisten Rumah Tangga (ART)",
      "Terapis SPA"
    ]);
    expect(getCountryOccupationOptions(country, "LAKI_LAKI")).toEqual([
      "Terapis SPA",
      "Konstruksi"
    ]);
    expect(getCountryOccupationOptions(country)).toEqual(["Terapis SPA"]);
  });

  it("tidak memakai pilihan lama saat seluruh pekerjaan disembunyikan", () => {
    expect(getCountryOccupationOptions({ occupations: [] }, "LAKI_LAKI")).toEqual([]);
  });
});
