import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

const maxPhotoBytes = 2 * 1024 * 1024;
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function encryptionKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Kunci enkripsi pendaftaran belum tersedia.");
  return Buffer.from(hkdfSync("sha256", secret, "mpu-applications", "nik-v1", 32));
}

export function encryptNik(nik: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(nik, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptNik(value: string) {
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Format NIK tidak valid.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

export async function processApplicantPhoto(file: File) {
  if (file.size < 1 || file.size > maxPhotoBytes)
    throw new Error("Foto wajib diisi dan ukurannya maksimal 2 MB.");
  const source = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(source);
  if (!detected || !allowedPhotoTypes.has(detected.mime))
    throw new Error("Foto harus JPG, PNG, atau WebP yang valid.");
  const image = sharp(source, { failOn: "error", limitInputPixels: 20_000_000 }).rotate();
  const metadata = await image.metadata();
  if ((metadata.autoOrient.width ?? 0) < 200 || (metadata.autoOrient.height ?? 0) < 200)
    throw new Error("Resolusi foto terlalu kecil. Gunakan minimal 200 × 200 piksel.");
  const body = await image
    .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { body, mimeType: "image/webp" };
}
