import dotenv from "dotenv";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { putObject } from "../src/lib/storage";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const clientRevision = "Revisi konten dari klien, 10 November 2026";
const disclaimer =
  "Syarat, gaji, sektor, dan ketentuan dapat berubah mengikuti program, kontrak kerja, dan peraturan yang berlaku.";

async function uploadPublicAsset(file: string, key: string, mimeType: string) {
  const bytes = await fs.readFile(path.join(process.cwd(), "public", file));
  const url = await putObject({
    objectKey: key,
    body: bytes,
    contentType: mimeType,
    visibility: "PUBLIC"
  });
  if (!url) throw new Error(`Alamat publik belum tersedia untuk ${file}.`);
  const response = await fetch(url, { method: "HEAD" });
  if (!response.ok) throw new Error(`Berkas ${file} belum dapat dibuka dari bucket publik.`);
  return { bytes, url };
}

try {
  const [{ bytes: portraitBytes, url: portraitUrl }, { url: bruneiFlagUrl }] = await Promise.all([
    uploadPublicAsset(
      "client/director-martua-2026.png",
      "client/director-martua-2026.png",
      "image/png"
    ),
    uploadPublicAsset("flags/bn.png", "flags/bn.png", "image/png")
  ]);

  await prisma.$transaction(async (tx) => {
    const taiwan = await tx.country.findUniqueOrThrow({ where: { slug: "taiwan" } });
    await tx.country.update({
      where: { id: taiwan.id },
      data: {
        summary:
          "Pilihan pekerjaan yang diinformasikan MPU meliputi perawatan lansia, asisten rumah tangga, pabrik, nelayan, serta ABK (anak buah kapal). Ketersediaan program perlu dikonfirmasi.",
        formalSectorInfo:
          "Pabrik, nelayan, dan ABK (anak buah kapal). Rincian pekerjaan di kapal mengikuti program terkait.",
        sectors: [
          "ABK (anak buah kapal)",
          ...taiwan.sectors.filter((item) => item !== "ABK (anak buah kapal)")
        ]
      }
    });

    const malaysia = await tx.country.findUniqueOrThrow({ where: { slug: "malaysia" } });
    await tx.country.update({
      where: { id: malaysia.id },
      data: {
        summary:
          "Pilihan pekerjaan yang diinformasikan MPU meliputi penjaga anak/bayi, perawatan lansia, asisten rumah tangga, konstruksi, dan pekerja kebun sawit atau karet.",
        formalSectorInfo:
          "Konstruksi dan pekerjaan kebun sawit/karet diinformasikan klien. Klasifikasi sektor serta rincian kontrak mengikuti program terkait.",
        sectors: [
          "Konstruksi",
          "Pekerja kebun sawit/karet",
          ...malaysia.sectors.filter(
            (item) => item !== "Konstruksi" && item !== "Pekerja kebun sawit/karet"
          )
        ]
      }
    });

    await tx.country.upsert({
      where: { slug: "brunei-darussalam" },
      update: { flagUrl: bruneiFlagUrl },
      create: {
        name: "Brunei Darussalam",
        slug: "brunei-darussalam",
        isoCode: "BN",
        flagUrl: bruneiFlagUrl,
        summary:
          "MPU menginformasikan pilihan pekerjaan sektor formal di Brunei Darussalam, termasuk konstruksi dan pembuatan kue. Rincian program dan ketersediaan lowongan perlu dikonfirmasi kepada petugas.",
        programDescription:
          "Informasi awal dari revisi klien 10 November 2026. Kriteria, dokumen, gaji, biaya, dan kontrak akan dijelaskan sesuai program yang berlaku.",
        criteria: [],
        requirements: [],
        salaryDetails: [],
        informalSectorInfo: "Tidak disebutkan dalam informasi yang diberikan klien.",
        formalSectorInfo: "Konstruksi, pembuatan kue, dan bidang formal lain sesuai program.",
        sectors: ["Konstruksi", "Pembuat kue"],
        requirementsDisclaimer: disclaimer,
        programStatus: "MORE_INFO",
        status: "PUBLISHED",
        publishedAt: new Date(),
        isFeatured: true,
        displayOrder: 4
      }
    });

    const photo = await tx.mediaAsset.upsert({
      where: { objectKey: "client/director-martua-2026.png" },
      update: {
        publicUrl: portraitUrl,
        checksum: createHash("sha256").update(portraitBytes).digest("hex"),
        isDeleted: false,
        deletedAt: null
      },
      create: {
        objectKey: "client/director-martua-2026.png",
        publicUrl: portraitUrl,
        originalName: "Foto Direktur 10 November 2026.png",
        safeName: "director-martua-2026.png",
        kind: "IMAGE",
        visibility: "PUBLIC",
        mimeType: "image/png",
        sizeBytes: BigInt(portraitBytes.length),
        checksum: createHash("sha256").update(portraitBytes).digest("hex"),
        width: 960,
        height: 1280,
        altText: "Foto Direktur Utama PT Mutiara Putra Utama di jembatan penyeberangan",
        title: "Foto Direktur Utama",
        source: clientRevision,
        permissionStatus: "CLIENT_PROVIDED",
        folder: "Profil Perusahaan"
      }
    });
    await tx.companyProfile.update({
      where: { id: "default" },
      data: { directorPhoto: portraitUrl }
    });

    const oldGalleryPhoto = await tx.mediaAsset.findUnique({
      where: { objectKey: "seed/client-library/root/direktur-utama.webp" }
    });
    if (oldGalleryPhoto) {
      await tx.galleryItem.updateMany({
        where: { mediaId: oldGalleryPhoto.id },
        data: { mediaId: photo.id }
      });
    }

    const countryFaq = await tx.faq.findFirst({
      where: { question: "Negara tujuan apa yang tersedia?" }
    });
    if (countryFaq) {
      await tx.faq.update({
        where: { id: countryFaq.id },
        data: {
          answer:
            "Taiwan, Hong Kong, Singapura, Malaysia, dan Brunei Darussalam tersedia sebagai pilihan minat awal. Status program dan lowongan aktif harus dikonfirmasi pada halaman lowongan atau kepada petugas MPU."
        }
      });
    }
  });

  process.stdout.write("Revisi negara dan foto direktur tersimpan di database.\n");
} finally {
  await prisma.$disconnect();
}
