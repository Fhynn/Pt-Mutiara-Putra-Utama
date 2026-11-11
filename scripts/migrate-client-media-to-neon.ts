import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { putObject } from "../src/lib/storage";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");

const apply = process.argv.includes("--apply");
const publicRoot = path.resolve(process.cwd(), "public");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

function oldUrlForKey(key: string) {
  if (key.startsWith("seed/client-library/"))
    return `/client/library/${key.slice("seed/client-library/".length)}`;
  if (key.startsWith("seed/client/")) return `/client/${key.slice("seed/client/".length)}`;
  if (key.startsWith("client/")) return `/${key}`;
  return null;
}

async function localBytes(url: string) {
  const target = path.resolve(publicRoot, url.replace(/^\/+/, ""));
  if (!target.startsWith(`${publicRoot}${path.sep}`)) throw new Error("Path aset tidak aman.");
  return fs.readFile(target);
}

async function upload(key: string, localUrl: string, mimeType: string) {
  const bytes = await localBytes(localUrl);
  const url = await putObject({
    objectKey: key,
    body: bytes,
    contentType: mimeType,
    visibility: "PUBLIC"
  });
  if (!url) throw new Error(`URL publik tidak tersedia untuk ${localUrl}.`);
  const response = await fetch(url, { method: "HEAD" });
  if (!response.ok) throw new Error(`Berkas belum dapat dibuka dari bucket: ${localUrl}.`);
  return { url, bytes };
}

try {
  const assets = await prisma.mediaAsset.findMany({
    where: {
      isDeleted: false,
      visibility: "PUBLIC",
      OR: [
        { objectKey: { startsWith: "seed/client/" } },
        { objectKey: { startsWith: "seed/client-library/" } },
        { objectKey: "client/director-martua-2026.png" }
      ]
    },
    select: { id: true, objectKey: true, publicUrl: true, mimeType: true }
  });
  const pending = assets.filter((asset) => asset.publicUrl?.startsWith("/client/"));
  process.stdout.write(
    `${assets.length} foto klien tercatat; ${pending.length} masih memakai file website. Mode ${apply ? "migrasi" : "pemeriksaan"}.\n`
  );
  if (apply) {
    const urlMap = new Map<string, string>();
    let uploaded = 0;
    for (const asset of assets) {
      const oldUrl = oldUrlForKey(asset.objectKey);
      if (!oldUrl) continue;
      if (asset.publicUrl?.startsWith("https://")) {
        urlMap.set(oldUrl, asset.publicUrl);
        continue;
      }
      if (!asset.publicUrl?.startsWith("/client/")) continue;
      const { url } = await upload(asset.objectKey, oldUrl, asset.mimeType);
      await prisma.mediaAsset.update({ where: { id: asset.id }, data: { publicUrl: url } });
      urlMap.set(oldUrl, url);
      uploaded += 1;
      process.stdout.write(`Foto ${uploaded}/${pending.length} dipindahkan.\n`);
    }

    const logoPath = "/brand/mpu-logo.png";
    const logoKey = "client-assets/brand/mpu-logo.png";
    const { url: logoUrl, bytes: logoBytes } = await upload(logoKey, logoPath, "image/png");
    await prisma.mediaAsset.upsert({
      where: { objectKey: logoKey },
      update: { publicUrl: logoUrl, isDeleted: false, deletedAt: null },
      create: {
        objectKey: logoKey,
        publicUrl: logoUrl,
        originalName: "mpu-logo.png",
        safeName: "mpu-logo.png",
        kind: "IMAGE",
        visibility: "PUBLIC",
        mimeType: "image/png",
        sizeBytes: BigInt(logoBytes.length),
        altText: "Logo PT Mutiara Putra Utama",
        title: "Logo MPU",
        source: "Materi identitas perusahaan",
        permissionStatus: "CLIENT_PROVIDED",
        checksum: createHash("sha256").update(logoBytes).digest("hex")
      }
    });
    urlMap.set(logoPath, logoUrl);

    const sections = await prisma.pageSection.findMany({ select: { id: true, content: true } });
    let updatedSections = 0;
    for (const section of sections) {
      const before = JSON.stringify(section.content);
      const after = JSON.stringify(section.content, (_key, value) =>
        typeof value === "string" ? (urlMap.get(value) ?? value) : value
      );
      if (after !== before) {
        await prisma.pageSection.update({
          where: { id: section.id },
          data: { content: JSON.parse(after) }
        });
        updatedSections += 1;
      }
    }

    const profiles = await prisma.companyProfile.findMany({
      select: { id: true, directorPhoto: true }
    });
    for (const profile of profiles) {
      const directorPhoto = profile.directorPhoto ? urlMap.get(profile.directorPhoto) : null;
      if (directorPhoto)
        await prisma.companyProfile.update({ where: { id: profile.id }, data: { directorPhoto } });
    }
    const settings = await prisma.siteSetting.findMany({
      select: { id: true, logoUrl: true, faviconUrl: true, defaultOgImage: true }
    });
    for (const setting of settings) {
      const logo = setting.logoUrl ? urlMap.get(setting.logoUrl) : null;
      const favicon = setting.faviconUrl ? urlMap.get(setting.faviconUrl) : null;
      const ogImage = setting.defaultOgImage ? urlMap.get(setting.defaultOgImage) : null;
      await prisma.siteSetting.update({
        where: { id: setting.id },
        data: {
          ...(logo ? { logoUrl: logo } : {}),
          ...(favicon ? { faviconUrl: favicon } : {}),
          ...(ogImage ? { defaultOgImage: ogImage } : {})
        }
      });
    }

    process.stdout.write(
      `${uploaded} foto publik dipindahkan; ${updatedSections} bagian halaman dan identitas website diperbarui.\n`
    );
  }
} finally {
  await prisma.$disconnect();
}
