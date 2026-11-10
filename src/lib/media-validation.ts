import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

const allowed = {
  image: new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  pdf: new Set(["application/pdf"]),
  video: new Set(["video/mp4", "video/webm"])
};

export async function validateAndProcessUpload(file: File) {
  const source = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(source);
  const mime = detected?.mime;
  if (!mime) throw new Error("Tipe file tidak dapat diverifikasi.");

  const imageLimit = Number(process.env.MAX_IMAGE_UPLOAD_BYTES ?? 10 * 1024 * 1024);
  const pdfLimit = Number(process.env.MAX_PDF_UPLOAD_BYTES ?? 20 * 1024 * 1024);
  const videoLimit = Number(process.env.MAX_VIDEO_UPLOAD_BYTES ?? 150 * 1024 * 1024);

  let kind: "IMAGE" | "PDF" | "VIDEO";
  let limit: number;
  if (allowed.image.has(mime)) {
    kind = "IMAGE";
    limit = imageLimit;
  } else if (allowed.pdf.has(mime)) {
    kind = "PDF";
    limit = pdfLimit;
  } else if (allowed.video.has(mime)) {
    kind = "VIDEO";
    limit = videoLimit;
  } else {
    throw new Error("Format file tidak diizinkan. SVG dan file executable ditolak.");
  }
  if (source.byteLength > limit)
    throw new Error(`Ukuran file melebihi batas ${Math.round(limit / 1024 / 1024)} MB.`);

  const checksum = createHash("sha256").update(source).digest("hex");
  const safeBase = path
    .basename(file.name)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-100);
  const id = randomUUID();

  if (kind === "IMAGE") {
    const image = sharp(source, { failOn: "error" }).rotate();
    const metadata = await image.metadata();
    const optimized = await image.webp({ quality: 84, effort: 5 }).toBuffer();
    const thumbnail = await sharp(optimized)
      .resize(480, 320, { fit: "cover", position: "attention" })
      .webp({ quality: 78 })
      .toBuffer();
    return {
      kind,
      mimeType: "image/webp",
      body: optimized,
      thumbnail,
      width: metadata.autoOrient.width,
      height: metadata.autoOrient.height,
      objectKey: `images/${id}.webp`,
      thumbnailKey: `images/${id}-thumb.webp`,
      safeName: safeBase.replace(/\.[^.]+$/, ".webp"),
      checksum
    };
  }

  return {
    kind,
    mimeType: mime,
    body: source,
    width: null,
    height: null,
    objectKey: `${kind === "PDF" ? "legal" : "video"}/${id}.${detected.ext}`,
    thumbnail: null,
    thumbnailKey: null,
    safeName: safeBase,
    checksum
  };
}
