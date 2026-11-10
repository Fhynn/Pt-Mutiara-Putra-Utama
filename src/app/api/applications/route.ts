import { NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/email";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { applicationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Periksa kembali data yang wajib diisi." },
      { status: 400 }
    );
  if (parsed.data.website) return NextResponse.json({ message: "Terima kasih." });

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

  if (parsed.data.idempotencyKey) {
    const existing = await prisma.application.findUnique({
      where: { idempotencyKey: parsed.data.idempotencyKey }
    });
    if (existing) return NextResponse.json({ referenceNumber: existing.referenceNumber });
  }

  if (parsed.data.jobId) {
    const job = await prisma.job.findFirst({
      where: {
        id: parsed.data.jobId,
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
        email: parsed.data.email || null,
        domicile: parsed.data.domicile,
        countryId: parsed.data.countryId || null,
        jobId: parsed.data.jobId || null,
        workExperience: parsed.data.workExperience || null,
        message: parsed.data.message || null,
        consent: true,
        consentAt: new Date(),
        privacyPolicyVersion: "2026-11-05",
        idempotencyKey: parsed.data.idempotencyKey
      }
    });
  });

  const notification = await notifyAdmin({
    subject: `Pendaftaran awal baru ${application.referenceNumber}`,
    text: "Pendaftaran baru tersimpan di dashboard admin. Masuk ke CMS untuk melihat detail."
  });
  await prisma.application.update({
    where: { id: application.id },
    data: { notificationStatus: notification.status }
  });
  return NextResponse.json({ referenceNumber: application.referenceNumber }, { status: 201 });
}
