import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyAdmin } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Periksa kembali data kontak dan pesan." },
      { status: 400 }
    );
  if (parsed.data.website) return NextResponse.json({ message: "Terima kasih." });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await enforceRateLimit({
    action: "public-contact",
    identifier: ip,
    limit: 8,
    windowSeconds: 60 * 60
  });
  if (!limit.allowed)
    return NextResponse.json(
      { message: "Terlalu banyak pesan. Silakan coba kembali nanti." },
      { status: 429 }
    );

  const message = await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      consent: true,
      consentAt: new Date(),
      privacyPolicyVersion: "2026-11-05"
    }
  });
  const notification = await notifyAdmin({
    subject: `Pesan kontak baru: ${message.subject}`,
    text: "Pesan baru tersimpan di dashboard admin. Masuk ke CMS untuk melihat detail."
  });
  await prisma.contactMessage.update({
    where: { id: message.id },
    data: { notificationStatus: notification.status }
  });
  return NextResponse.json({ message: "Pesan tersimpan." }, { status: 201 });
}
