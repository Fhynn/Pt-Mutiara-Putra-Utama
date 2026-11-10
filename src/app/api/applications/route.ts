import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { applicationSchema } from "@/lib/validation";
import { encryptNik, processApplicantPhoto } from "@/lib/application-private";
import { deleteObject, isStorageConfigured, putObject } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("multipart/form-data"))
    return NextResponse.json({ message: "Format pendaftaran tidak valid." }, { status: 415 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4 * 1024 * 1024)
    return NextResponse.json({ message: "Ukuran formulir terlalu besar." }, { status: 413 });
  if (!isStorageConfigured())
    return NextResponse.json(
      { message: "Pendaftaran belum tersedia. Hubungi petugas MPU." },
      { status: 503 }
    );

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await enforceRateLimit({
    action: "public-application",
    identifier: ip,
    limit: 5,
    windowSeconds: 60 * 60
  });
  if (!limit.allowed)
    return NextResponse.json(
      { message: "Terlalu banyak percobaan. Silakan coba kembali nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Formulir tidak dapat dibaca." }, { status: 400 });
  }
  let body: unknown;
  try {
    body = JSON.parse(String(form.get("data") ?? ""));
  } catch {
    return NextResponse.json({ message: "Isi formulir tidak valid." }, { status: 400 });
  }
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Periksa kembali data yang wajib diisi." },
      { status: 400 }
    );
  if (parsed.data.website) return NextResponse.json({ message: "Terima kasih." });
  const photos = form.getAll("photo");
  if (photos.length !== 1 || !(photos[0] instanceof File))
    return NextResponse.json({ message: "Pilih satu foto pendaftar." }, { status: 400 });

  if (parsed.data.idempotencyKey) {
    const existing = await prisma.application.findUnique({
      where: { idempotencyKey: parsed.data.idempotencyKey },
      select: { referenceNumber: true }
    });
    if (existing) return NextResponse.json({ referenceNumber: existing.referenceNumber });
  }
  const country = await prisma.country.findFirst({
    where: { id: parsed.data.countryId, status: "PUBLISHED" },
    select: { id: true }
  });
  if (!country)
    return NextResponse.json({ message: "Negara tujuan tidak tersedia." }, { status: 400 });
  if (parsed.data.jobId) {
    const job = await prisma.job.findFirst({
      where: {
        id: parsed.data.jobId,
        countryId: country.id,
        status: "OPEN",
        OR: [{ deadline: null }, { deadline: { gte: new Date() } }]
      }
    });
    if (!job)
      return NextResponse.json(
        { message: "Lowongan yang dipilih sudah tidak aktif." },
        { status: 400 }
      );
  }

  let photo: Awaited<ReturnType<typeof processApplicantPhoto>>;
  try {
    photo = await processApplicantPhoto(photos[0]);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Foto tidak valid." },
      { status: 400 }
    );
  }
  const objectKey = `applications/${randomUUID()}/photo.webp`;
  let stage = "encrypt";
  try {
    const nikEncrypted = encryptNik(parsed.data.nik);
    stage = "storage";
    await putObject({
      objectKey,
      body: photo.body,
      contentType: photo.mimeType,
      visibility: "PRIVATE"
    });
    stage = "database";
    const application = await prisma.$transaction(async (transaction) => {
      const year = new Date().getFullYear();
      const counter = await transaction.registrationCounter.upsert({
        where: { year },
        create: { year, currentValue: 1 },
        update: { currentValue: { increment: 1 } }
      });
      const referenceNumber = `MPU-${year}-${String(counter.currentValue).padStart(5, "0")}`;
      return transaction.application.create({
        data: {
          referenceNumber,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          email: parsed.data.email,
          domicile: parsed.data.domicile,
          province: parsed.data.province,
          sector: parsed.data.sector,
          nikEncrypted,
          birthPlace: parsed.data.birthPlace,
          birthDate: new Date(`${parsed.data.birthDate}T00:00:00.000Z`),
          gender: parsed.data.gender,
          maritalStatus: parsed.data.maritalStatus,
          religion: parsed.data.religion,
          heightCm: parsed.data.heightCm,
          weightKg: parsed.data.weightKg,
          address: parsed.data.address,
          rt: parsed.data.rt,
          rw: parsed.data.rw,
          village: parsed.data.village,
          district: parsed.data.district,
          countryId: country.id,
          jobId: parsed.data.jobId || null,
          workExperience: parsed.data.workExperience,
          photoObjectKey: objectKey,
          consent: true,
          consentAt: new Date(),
          privacyPolicyVersion: "2026-11-11",
          idempotencyKey: parsed.data.idempotencyKey
        }
      });
    });
    return NextResponse.json({ referenceNumber: application.referenceNumber }, { status: 201 });
  } catch (error) {
    console.error(
      "Pendaftaran gagal pada tahap",
      stage,
      error instanceof Error ? error.name : "UnknownError"
    );
    await deleteObject(objectKey, "PRIVATE").catch(() => undefined);
    return NextResponse.json(
      { message: "Pendaftaran belum dapat disimpan. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
