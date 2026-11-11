import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { initialCountryGenderCriteria } from "../src/lib/country-gender-defaults";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});
const apply = process.argv.includes("--apply");
const legacyCriteria = {
  malaysia: [
    "Warga Negara Indonesia (WNI)",
    "Wanita",
    "Usia 21–40 tahun",
    "Tinggi badan minimal 145 cm",
    "Berat badan proporsional/ideal",
    "Pendidikan minimal SD/sederajat"
  ],
  taiwan: [
    "Warga Negara Indonesia (WNI)",
    "Pria atau wanita",
    "Usia 20–40 tahun",
    "Tinggi badan minimal 165 cm untuk pria dan 155 cm untuk wanita",
    "Berat badan proporsional/ideal",
    "Pendidikan minimal SD/sederajat"
  ]
} as const;

try {
  for (const slug of ["malaysia", "taiwan"] as const) {
    const country = await prisma.country.findUnique({
      where: { slug },
      select: { id: true, criteria: true, genderCriteria: true }
    });
    if (!country) {
      process.stdout.write(`${slug}: negara tidak ditemukan.\n`);
      continue;
    }
    if (country.genderCriteria) {
      process.stdout.write(`${slug}: rincian terpisah sudah ada; tidak diubah.\n`);
      continue;
    }
    if (JSON.stringify(country.criteria) !== JSON.stringify(legacyCriteria[slug])) {
      process.stdout.write(
        `${slug}: kriteria lama sudah berubah; perlu ditinjau sebelum dipisah.\n`
      );
      continue;
    }
    if (apply) {
      await prisma.country.update({
        where: { id: country.id },
        data: { genderCriteria: initialCountryGenderCriteria[slug] }
      });
    }
    process.stdout.write(`${slug}: ${apply ? "rincian dipisahkan" : "siap dipisahkan"}.\n`);
  }
} finally {
  await prisma.$disconnect();
}
