export const sharedOccupationDocuments = [
  "Kartu Tanda Penduduk (KTP)",
  "Kartu Keluarga (KK)",
  "Akta kelahiran atau ijazah",
  "Buku nikah, bagi calon pekerja yang berstatus menikah pada KTP",
  "Akta cerai, bagi calon pekerja yang berstatus cerai hidup pada KTP",
  "Surat izin orang tua, bagi calon pekerja yang berstatus belum kawin atau cerai hidup",
  "Surat izin suami, bagi calon pekerja perempuan yang berstatus menikah"
] as const;

type OccupationRevision = {
  slug: string;
  title: string;
  gender: "PEREMPUAN" | "LAKI_LAKI" | null;
  ageMin: number;
  ageMax: number;
  experienceRequirement: string | null;
  healthRequirement: string;
  salaryLabel: string | null;
};

export const clientOccupationRevision: Record<
  string,
  { summary: string; occupations: OccupationRevision[] }
> = {
  malaysia: {
    summary:
      "Pilihan pekerjaan di Malaysia: asisten rumah tangga, terapis SPA, konstruksi, perkebunan karet, dan perkebunan sawit.",
    occupations: [
      {
        slug: "asisten-rumah-tangga",
        title: "Asisten Rumah Tangga (ART)",
        gender: "PEREMPUAN",
        ageMin: 21,
        ageMax: 45,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "RM 1.500"
      },
      {
        slug: "terapis-spa",
        title: "Terapis SPA",
        gender: null,
        ageMin: 21,
        ageMax: 45,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: null
      },
      {
        slug: "konstruksi",
        title: "Konstruksi",
        gender: "LAKI_LAKI",
        ageMin: 18,
        ageMax: 43,
        experienceRequirement: "Pengalaman kerja minimal 1 tahun",
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "RM 1.700"
      },
      {
        slug: "perkebunan-karet",
        title: "Perkebunan Karet",
        gender: "LAKI_LAKI",
        ageMin: 18,
        ageMax: 43,
        experienceRequirement: "Pengalaman kerja minimal 1 tahun",
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "RM 1.700"
      },
      {
        slug: "perkebunan-sawit",
        title: "Perkebunan Sawit",
        gender: "LAKI_LAKI",
        ageMin: 18,
        ageMax: 43,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "RM 1.700"
      }
    ]
  },
  "hong-kong": {
    summary: "Pilihan pekerjaan di Hong Kong: asisten rumah tangga.",
    occupations: [
      {
        slug: "asisten-rumah-tangga",
        title: "Asisten Rumah Tangga (ART)",
        gender: "PEREMPUAN",
        ageMin: 21,
        ageMax: 45,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "HKD 5.220"
      }
    ]
  },
  taiwan: {
    summary: "Pilihan pekerjaan di Taiwan: asisten rumah tangga dan anak buah kapal (ABK).",
    occupations: [
      {
        slug: "asisten-rumah-tangga",
        title: "Asisten Rumah Tangga (ART)",
        gender: null,
        ageMin: 20,
        ageMax: 45,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "NTD 20.000"
      },
      {
        slug: "anak-buah-kapal",
        title: "Anak Buah Kapal (ABK)",
        gender: null,
        ageMin: 18,
        ageMax: 43,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: null
      }
    ]
  },
  singapura: {
    summary: "Pilihan pekerjaan di Singapura: asisten rumah tangga.",
    occupations: [
      {
        slug: "asisten-rumah-tangga",
        title: "Asisten Rumah Tangga (ART)",
        gender: "PEREMPUAN",
        ageMin: 23,
        ageMax: 45,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: "SGD 550"
      }
    ]
  },
  "brunei-darussalam": {
    summary: "Pilihan pekerjaan di Brunei Darussalam: konstruksi dan pembuat kue (baker).",
    occupations: [
      {
        slug: "konstruksi",
        title: "Konstruksi",
        gender: null,
        ageMin: 18,
        ageMax: 43,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: null
      },
      {
        slug: "baker-pembuat-kue",
        title: "Baker (Pembuat Kue)",
        gender: null,
        ageMin: 21,
        ageMax: 43,
        experienceRequirement: null,
        healthRequirement: "Sehat jasmani dan rohani",
        salaryLabel: null
      }
    ]
  }
};
