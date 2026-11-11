import { describe, expect, it } from "vitest";
import { countryFlagUrl, inferCountryIso } from "@/lib/country-flags";

describe("bendera negara otomatis", () => {
  it("mengenali nama yang umum dipakai admin", () => {
    expect(inferCountryIso("Taiwan")).toBe("TW");
    expect(inferCountryIso("Hong Kong")).toBe("HK");
    expect(inferCountryIso("Brunei Darussalam")).toBe("BN");
    expect(inferCountryIso("Jepang")).toBe("JP");
  });

  it("memakai aset lokal dan bendera negara baru sesuai kode ISO", () => {
    expect(countryFlagUrl("TW")).toBe("/flags/tw.png");
    expect(countryFlagUrl("JP")).toBe("https://flagcdn.com/w320/jp.png");
    expect(countryFlagUrl("JP", "https://example.com/jp.png")).toBe("https://example.com/jp.png");
    expect(countryFlagUrl(null)).toBeNull();
  });
});
