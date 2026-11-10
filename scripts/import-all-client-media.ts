import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL wajib diisi.");

const workspace = process.cwd();
const sourceRoot = path.join(workspace, "drive-download-20261105T084821Z-1-001");
const publicRoot = path.join(workspace, "public", "client", "library");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".heic", ".mp4"]);
const selectedOutputs = new Map([
  ["PT CABANG SRAGEN/IMG_1537.PNG", "hero-training.webp"],
  ["PT CABANG SRAGEN/IMG_1532.PNG", "about-office.webp"],
  ["PT PUSAT/IMG_1526.JPG", "training-class.webp"],
  ["PT PUSAT/IMG_1534.JPG", "gallery-team.webp"],
  ["PT CABANG SRAGEN/IMG_1531.PNG", "gallery-office-sragen.webp"],
  ["PT CABANG SRAGEN/IMG_1538.PNG", "gallery-training-sragen.webp"],
  ["PT CABANG SRAGEN/IMG_1540.PNG", "gallery-briefing.webp"],
  ["PT CABANG LEGOK/IMG_1542.PNG", "gallery-training-legok.webp"],
  ["AGENCY KERJA SAMA/70c66d29-16b5-4eaa-872f-ed2436ac0020.jpg", "gallery-partner.webp"]
]);

const privateMedia = new Set(
  [
    "188d1241-515b-4647-b7f7-aac8180d81b9.jpg",
    "27a98011-e4d0-4345-b238-0479b73cd136.jpg",
    "481f7ad7-7921-4804-bc61-429b01773f20.jpg",
    "4eb58793-3a1d-4ced-b5cb-07a30a2b11ac.jpg",
    "4f51a28c-4ab2-4982-86f9-f83b69cbdca9.jpg",
    "605e1187-8e3e-45e1-8650-b9f27782baea.jpg",
    "6c2685f4-1a12-406a-974a-ceeedb9e6739.jpg",
    "86fe64a1-89d9-419b-8f50-498d65803e79.jpg",
    "8ea7fd0b-1d12-418b-906f-87d02f70f220.jpg",
    "955628cc-bec2-48cb-9a80-d90f1dfc19a5.jpg",
    "b42c2f0e-279e-4830-9867-290598d5a950.jpg",
    "ce94fed6-8b1f-483a-a2f7-e6498f21887b.jpg",
    "d174e086-356b-454c-8dcc-230ceb0edba6.jpg",
    "d3b0bcf2-ebbe-4110-aa2a-0982b6436a6a.jpg",
    "ea1fcb69-fe90-4a88-94fc-31344d872816.jpg",
    "ef1cd15d-5cf9-4b68-80af-ad8c8f72e730.jpg",
    "f4598f05-1946-4f94-8384-5e7d9dd392e1.jpg",
    "IMG_1398.HEIC",
    "acc226ed-25e5-4dbc-859c-39feaa7dd559.mp4"
  ].map((name) => `PT PUSAT/${name}`)
);

const folderDetails = {
  "(root)": {
    slug: "profil-perusahaan",
    title: "Profil Perusahaan",
    category: "profil",
    description: "Foto profil dan dokumentasi perusahaan."
  },
  "AGENCY KERJA SAMA": {
    slug: "agency-kerja-sama",
    title: "Agency Kerja Sama",
    category: "mitra",
    description: "Dokumentasi pertemuan dan kegiatan bersama mitra."
  },
  "PT CABANG KEBUMEN": {
    slug: "cabang-kebumen",
    title: "Kantor Cabang Kebumen",
    category: "kantor",
    description: "Dokumentasi kantor PT Mutiara Putra Utama Cabang Kebumen."
  },
  "PT CABANG LEGOK": {
    slug: "cabang-legok",
    title: "Kegiatan Cabang Legok",
    category: "kegiatan",
    description: "Dokumentasi kegiatan PT Mutiara Putra Utama Cabang Legok."
  },
  "PT CABANG SRAGEN": {
    slug: "cabang-sragen",
    title: "Kegiatan Cabang Sragen",
    category: "kegiatan",
    description: "Dokumentasi kegiatan PT Mutiara Putra Utama Cabang Sragen."
  },
  "PT PUSAT": {
    slug: "kegiatan-pt-pusat",
    title: "Dokumentasi PT Pusat",
    category: "kegiatan",
    description: "Dokumentasi kegiatan di kantor pusat PT Mutiara Putra Utama."
  }
};
type FolderName = keyof typeof folderDetails;

async function walk(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    })
  );
  return nested.flat();
}

function checksum(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function folderFor(relative: string): FolderName {
  const folder = relative.includes("/") ? relative.split("/")[0] : "(root)";
  if (!(folder in folderDetails)) throw new Error(`Folder sumber tidak dikenal: ${folder}`);
  return folder as FolderName;
}

function safeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFor(folder: FolderName, index: number) {
  if (folder === "(root)") return "Direktur Utama PT Mutiara Putra Utama";
  return `${folderDetails[folder].title} ${String(index + 1).padStart(2, "0")}`;
}

const sourceFiles = (await walk(sourceRoot))
  .filter((file) => mediaExtensions.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b));
const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN", isActive: true } });
const legacyDirectorPath = path.join(workspace, "public", "client", "director-portrait.jpg");
const legacyDirectorBuffer = await fs.readFile(legacyDirectorPath);
await prisma.mediaAsset.updateMany({
  where: { objectKey: "seed/client/director-portrait.jpg" },
  data: {
    originalName: "director-portrait.jpg",
    safeName: "director-portrait.jpg",
    title: "Foto resmi Direktur Utama",
    source: "Company profile MPU",
    checksum: checksum(legacyDirectorBuffer)
  }
});
const folderIndexes = new Map<FolderName, number>();
const importedByFolder = new Map<FolderName, Array<{ id: string }>>();
const totals = { total: sourceFiles.length, public: 0, private: 0, image: 0, video: 0 };

try {
  for (const sourcePath of sourceFiles) {
    const relative = path.relative(sourceRoot, sourcePath).replaceAll("\\", "/");
    const folder = folderFor(relative);
    const folderIndex = folderIndexes.get(folder) ?? 0;
    folderIndexes.set(folder, folderIndex + 1);
    const original = await fs.readFile(sourcePath);
    const extension = path.extname(sourcePath).toLowerCase();
    const isVideo = extension === ".mp4";
    const isPrivate = privateMedia.has(relative);
    const semanticOutput = selectedOutputs.get(relative);
    let publicUrl = null;
    let objectKey;
    let mimeType;
    let sizeBytes;
    let width = null;
    let height = null;
    let safeName;

    if (!isPrivate) {
      if (semanticOutput) {
        const existingPath = path.join(workspace, "public", "client", semanticOutput);
        const existing = await fs.readFile(existingPath);
        const metadata = await sharp(existingPath).metadata();
        publicUrl = `/client/${semanticOutput}`;
        objectKey = `seed/client/${semanticOutput}`;
        mimeType = semanticOutput.endsWith(".jpg") ? "image/jpeg" : "image/webp";
        sizeBytes = existing.length;
        width = metadata.autoOrient?.width ?? metadata.width ?? null;
        height = metadata.autoOrient?.height ?? metadata.height ?? null;
        safeName = semanticOutput;
      } else {
        const folderSlug = safeSegment(folder);
        const base = safeSegment(path.basename(sourcePath, path.extname(sourcePath)));
        const relativeOutput = path.posix.join(folderSlug, `${base}.webp`);
        const outputPath = path.join(publicRoot, ...relativeOutput.split("/"));
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        const pipeline = sharp(original, { failOn: "error" }).rotate().resize({
          width: 1800,
          height: 1800,
          fit: "inside",
          withoutEnlargement: true
        });
        const metadata = await pipeline.metadata();
        const optimized = await pipeline.webp({ quality: 84, effort: 5 }).toBuffer();
        await fs.writeFile(outputPath, optimized);
        publicUrl = `/client/library/${relativeOutput}`;
        objectKey = `seed/client-library/${relativeOutput}`;
        mimeType = "image/webp";
        sizeBytes = optimized.length;
        width = metadata.autoOrient?.width ?? metadata.width ?? null;
        height = metadata.autoOrient?.height ?? metadata.height ?? null;
        safeName = `${base}.webp`;
      }
    } else {
      objectKey = `local-private/client-import/${relative}`;
      mimeType = isVideo
        ? "video/mp4"
        : extension === ".heic"
          ? "image/heic"
          : extension === ".png"
            ? "image/png"
            : "image/jpeg";
      sizeBytes = original.length;
      safeName = path.basename(sourcePath);
      if (!isVideo && extension !== ".heic") {
        const metadata = await sharp(original).metadata();
        width = metadata.autoOrient?.width ?? metadata.width ?? null;
        height = metadata.autoOrient?.height ?? metadata.height ?? null;
      }
    }

    const media = await prisma.mediaAsset.upsert({
      where: { objectKey },
      update: {
        publicUrl,
        originalName: path.basename(sourcePath),
        safeName,
        kind: isVideo ? "VIDEO" : "IMAGE",
        visibility: isPrivate ? "PRIVATE" : "PUBLIC",
        mimeType,
        sizeBytes: BigInt(sizeBytes),
        width,
        height,
        altText: isPrivate
          ? "Media privat klien — memerlukan pemeriksaan sebelum dipublikasikan"
          : `Dokumentasi PT Mutiara Putra Utama — ${folderDetails[folder].title}`,
        title: titleFor(folder, folderIndex),
        source: `Paket klien 5 November 2026 — ${relative}`,
        permissionStatus: isPrivate ? "PRIVATE_REVIEW_REQUIRED" : "CLIENT_PROVIDED",
        folder: folderDetails[folder].title,
        checksum: checksum(original),
        uploaderId: admin?.id ?? null,
        isDeleted: false,
        deletedAt: null
      },
      create: {
        objectKey,
        publicUrl,
        originalName: path.basename(sourcePath),
        safeName,
        kind: isVideo ? "VIDEO" : "IMAGE",
        visibility: isPrivate ? "PRIVATE" : "PUBLIC",
        mimeType,
        sizeBytes: BigInt(sizeBytes),
        width,
        height,
        altText: isPrivate
          ? "Media privat klien — memerlukan pemeriksaan sebelum dipublikasikan"
          : `Dokumentasi PT Mutiara Putra Utama — ${folderDetails[folder].title}`,
        title: titleFor(folder, folderIndex),
        source: `Paket klien 5 November 2026 — ${relative}`,
        permissionStatus: isPrivate ? "PRIVATE_REVIEW_REQUIRED" : "CLIENT_PROVIDED",
        folder: folderDetails[folder].title,
        checksum: checksum(original),
        uploaderId: admin?.id ?? null
      }
    });

    if (!isPrivate) {
      const entries = importedByFolder.get(folder) ?? [];
      entries.push(media);
      importedByFolder.set(folder, entries);
      totals.public += 1;
    } else totals.private += 1;
    if (isVideo) totals.video += 1;
    else totals.image += 1;
  }

  let albumOrder = 20;
  for (const [folder, media] of importedByFolder) {
    const details = folderDetails[folder];
    const album = await prisma.galleryAlbum.upsert({
      where: { slug: details.slug },
      update: {
        title: details.title,
        description: details.description,
        category: details.category,
        coverMediaId: media[0]?.id ?? null,
        status: "PUBLISHED",
        publishedAt: new Date(),
        displayOrder: albumOrder
      },
      create: {
        title: details.title,
        slug: details.slug,
        description: details.description,
        category: details.category,
        coverMediaId: media[0]?.id ?? null,
        status: "PUBLISHED",
        publishedAt: new Date(),
        displayOrder: albumOrder
      }
    });
    await prisma.galleryItem.deleteMany({ where: { albumId: album.id } });
    for (const [displayOrder, item] of media.entries()) {
      await prisma.galleryItem.upsert({
        where: { albumId_mediaId: { albumId: album.id, mediaId: item.id } },
        update: { displayOrder },
        create: { albumId: album.id, mediaId: item.id, displayOrder, isCover: displayOrder === 0 }
      });
    }
    albumOrder += 1;
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin?.id ?? null,
      action: "CREATE",
      entityType: "MediaAsset",
      summary: `Impor paket klien: ${totals.total} media (${totals.public} publik, ${totals.private} privat)`,
      metadata: totals
    }
  });

  console.log(JSON.stringify(totals));
} finally {
  await prisma.$disconnect();
}
