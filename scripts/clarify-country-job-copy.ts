import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const oldProgramDescription = (name: string) =>
  `Rangkuman ini mengikuti informasi persyaratan ${name} yang pernah dipublikasikan MPU. Konfirmasikan ketersediaan program, biaya, dan rincian kontrak kepada petugas sebelum memulai proses.`;
const newProgramDescription =
  "Kriteria dan dokumen di bawah menjadi panduan awal. Lihat bagian lowongan untuk mengetahui pekerjaan yang sedang dibuka.";
const oldDomesticSummary =
  "Informasi MPU mencantumkan sektor informal untuk penjaga anak/bayi dan asisten rumah tangga. Sektor formal belum tersedia pada sumber yang diperiksa.";
const oldFormalInfo = "Belum tersedia pada informasi MPU yang diperiksa.";

const changes = [
  {
    slug: "taiwan",
    summary: [
      "Pilihan pekerjaan yang diinformasikan MPU meliputi perawatan lansia, asisten rumah tangga, pabrik, nelayan, serta ABK (anak buah kapal). Ketersediaan program perlu dikonfirmasi.",
      "Jenis pekerjaan yang dicantumkan MPU untuk Taiwan meliputi perawatan lansia, asisten rumah tangga, pabrik, nelayan, serta ABK (anak buah kapal)."
    ],
    programDescription: [oldProgramDescription("Taiwan"), newProgramDescription]
  },
  {
    slug: "hong-kong",
    summary: [
      oldDomesticSummary,
      "Jenis pekerjaan yang dicantumkan MPU untuk Hong Kong meliputi penjaga anak/bayi dan asisten rumah tangga."
    ],
    programDescription: [oldProgramDescription("Hong Kong"), newProgramDescription],
    formalSectorInfo: [
      oldFormalInfo,
      "Belum ada informasi pekerjaan sektor formal untuk Hong Kong."
    ]
  },
  {
    slug: "singapura",
    summary: [
      oldDomesticSummary,
      "Jenis pekerjaan yang dicantumkan MPU untuk Singapura meliputi penjaga anak/bayi dan asisten rumah tangga."
    ],
    programDescription: [oldProgramDescription("Singapura"), newProgramDescription],
    formalSectorInfo: [
      oldFormalInfo,
      "Belum ada informasi pekerjaan sektor formal untuk Singapura."
    ]
  },
  {
    slug: "malaysia",
    programDescription: [oldProgramDescription("Malaysia"), newProgramDescription]
  },
  {
    slug: "brunei-darussalam",
    summary: [
      "MPU menginformasikan pilihan pekerjaan sektor formal di Brunei Darussalam, termasuk konstruksi dan pembuatan kue. Rincian program dan ketersediaan lowongan perlu dikonfirmasi kepada petugas.",
      "Jenis pekerjaan yang dicantumkan MPU untuk Brunei Darussalam meliputi konstruksi dan pembuatan kue."
    ],
    programDescription: [
      "Informasi awal dari revisi klien 10 November 2026. Kriteria, dokumen, gaji, biaya, dan kontrak akan dijelaskan sesuai program yang berlaku.",
      "Kriteria dan dokumen rinci untuk Brunei Darussalam belum dipublikasikan. Tanyakan persyaratannya kepada petugas MPU."
    ]
  }
] as const;

try {
  for (const change of changes) {
    const country = await prisma.country.findUnique({ where: { slug: change.slug } });
    if (!country) continue;

    const data: { summary?: string; programDescription?: string; formalSectorInfo?: string } = {};
    if ("summary" in change && country.summary === change.summary[0]) {
      data.summary = change.summary[1];
    }
    if (country.programDescription === change.programDescription[0]) {
      data.programDescription = change.programDescription[1];
    }
    if ("formalSectorInfo" in change && country.formalSectorInfo === change.formalSectorInfo[0]) {
      data.formalSectorInfo = change.formalSectorInfo[1];
    }

    if (Object.keys(data).length) {
      await prisma.country.update({ where: { id: country.id }, data });
      console.log(`${country.name}: ${Object.keys(data).join(", ")} diperbarui.`);
    } else {
      console.log(`${country.name}: tidak ada teks lama yang perlu diperbarui.`);
    }
  }
} finally {
  await prisma.$disconnect();
}
