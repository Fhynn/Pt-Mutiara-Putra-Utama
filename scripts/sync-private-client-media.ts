import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { putObject } from "../src/lib/storage";

dotenv.config({ path: ".env.local", quiet: true });
const sourceRoot = path.resolve(process.cwd(), "drive-download-20261105T084821Z-1-001");
const keyPrefix = "local-private/client-import/";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL belum diatur.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

try {
  const rows = await prisma.mediaAsset.findMany({
    where: { objectKey: { startsWith: keyPrefix }, visibility: "PRIVATE", isDeleted: false },
    select: { objectKey: true, mimeType: true, checksum: true }
  });
  let uploaded = 0;
  for (const item of rows) {
    const relative = item.objectKey.slice(keyPrefix.length);
    const sourcePath = path.resolve(sourceRoot, ...relative.split("/"));
    if (!sourcePath.startsWith(`${sourceRoot}${path.sep}`))
      throw new Error("Lokasi berkas impor tidak valid.");
    const body = await fs.readFile(sourcePath);
    const actualChecksum = createHash("sha256").update(body).digest("hex");
    if (item.checksum && actualChecksum !== item.checksum)
      throw new Error("Isi berkas sumber berubah sejak impor. Sinkronisasi dihentikan.");
    await putObject({
      objectKey: item.objectKey,
      body,
      contentType: item.mimeType,
      visibility: "PRIVATE"
    });
    uploaded += 1;
  }
  process.stdout.write(`${uploaded} berkas internal tersimpan di bucket privat.\n`);
} finally {
  await prisma.$disconnect();
}
