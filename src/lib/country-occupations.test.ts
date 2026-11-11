import { describe, expect, it } from "vitest";
import { getCountryOccupationOptions } from "@/lib/country-occupations";
import { initialCountryGenderCriteria } from "@/lib/country-gender-defaults";

describe("pilihan pekerjaan negara", () => {
  it("memisahkan pekerjaan Malaysia menurut jenis kelamin", () => {
    const country = {
      sectors: ["Asisten rumah tangga", "Konstruksi", "Pekerja kebun sawit/karet"],
      genderCriteria: initialCountryGenderCriteria.malaysia
    };
    expect(getCountryOccupationOptions(country)).toEqual([]);
    expect(getCountryOccupationOptions(country, "PEREMPUAN")).toEqual([
      "Asisten rumah tangga (ART)"
    ]);
    expect(getCountryOccupationOptions(country, "LAKI_LAKI")).toEqual([
      "Konstruksi",
      "Perkebunan sawit dan karet"
    ]);
  });

  it("memakai daftar pekerjaan umum bila belum diatur per jenis kelamin", () => {
    const country = {
      sectors: ["ABK (anak buah kapal)", "Perawatan lansia"],
      genderCriteria: initialCountryGenderCriteria.taiwan
    };
    expect(getCountryOccupationOptions(country, "PEREMPUAN")).toEqual(country.sectors);
    expect(getCountryOccupationOptions(country, "LAKI_LAKI")).toEqual(country.sectors);
  });
});
