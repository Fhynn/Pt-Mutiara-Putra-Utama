import type { CountryGenderCriteria } from "@/lib/country-gender-criteria";

export const initialCountryGenderCriteria = {
  malaysia: {
    women: {
      jobs: ["Asisten rumah tangga (ART)"],
      criteria: [
        "Warga Negara Indonesia (WNI)",
        "Usia 21–40 tahun",
        "Tinggi badan minimal 145 cm",
        "Berat badan proporsional/ideal",
        "Pendidikan minimal SD/sederajat"
      ]
    },
    men: {
      jobs: ["Konstruksi", "Perkebunan sawit dan karet"],
      criteria: []
    }
  },
  taiwan: {
    women: {
      jobs: [],
      criteria: [
        "Warga Negara Indonesia (WNI)",
        "Usia 20–40 tahun",
        "Tinggi badan minimal 155 cm",
        "Berat badan proporsional/ideal",
        "Pendidikan minimal SD/sederajat"
      ]
    },
    men: {
      jobs: [],
      criteria: [
        "Warga Negara Indonesia (WNI)",
        "Usia 20–40 tahun",
        "Tinggi badan minimal 165 cm",
        "Berat badan proporsional/ideal",
        "Pendidikan minimal SD/sederajat"
      ]
    }
  }
} satisfies Record<"malaysia" | "taiwan", CountryGenderCriteria>;
