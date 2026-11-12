import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  clientOccupationRevision,
  sharedOccupationDocuments
} from "../src/lib/client-occupation-revision";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});
const apply = process.argv.includes("--apply");
const previousDocumentWording = [
  "Kartu Tanda Penduduk (KTP)",
  "Kartu Keluarga (KK)",
  "Akta kelahiran atau ijazah",
  "Buku nikah, jika status pada KTP menikah",
  "Akta cerai, jika status pada KTP cerai hidup",
  "Surat izin orang tua, jika status belum kawin atau cerai hidup",
  "Surat izin suami, untuk calon pekerja perempuan yang berstatus menikah"
];

try {
  for (const [slug, revision] of Object.entries(clientOccupationRevision)) {
    const country = await prisma.country.findUnique({
      where: { slug },
      select: { id: true, name: true, requirements: true }
    });
    if (!country) {
      process.stdout.write(`${slug}: negara belum ada.\n`);
      continue;
    }
    const existing = await prisma.countryOccupation.count({ where: { countryId: country.id } });
    if (existing) {
      if (
        apply &&
        JSON.stringify(country.requirements) === JSON.stringify(previousDocumentWording)
      ) {
        await prisma.country.update({
          where: { id: country.id },
          data: { requirements: [...sharedOccupationDocuments] }
        });
      }
      process.stdout.write(
        `${country.name}: ${existing} pekerjaan sudah ada; data admin dipertahankan.\n`
      );
      continue;
    }
    if (!apply) {
      process.stdout.write(
        `${country.name}: siap menambahkan ${revision.occupations.length} pekerjaan.\n`
      );
      continue;
    }
    await prisma.$transaction(async (transaction) => {
      await transaction.country.update({
        where: { id: country.id },
        data: {
          summary: revision.summary,
          programDescription:
            "Pilih pekerjaan untuk melihat persyaratan, gaji pokok, dan dokumen yang perlu disiapkan.",
          criteria: [],
          requirements: [...sharedOccupationDocuments],
          salaryDetails: [],
          informalSectorInfo: null,
          formalSectorInfo: null,
          sectors: revision.occupations.map((occupation) => occupation.title)
        }
      });
      await transaction.countryOccupation.createMany({
        data: revision.occupations.map((occupation, order) => ({
          ...occupation,
          countryId: country.id,
          displayOrder: order,
          status: "PUBLISHED" as const
        }))
      });
    });
    process.stdout.write(
      `${country.name}: ${revision.occupations.length} pekerjaan ditambahkan.\n`
    );
  }
} finally {
  await prisma.$disconnect();
}
