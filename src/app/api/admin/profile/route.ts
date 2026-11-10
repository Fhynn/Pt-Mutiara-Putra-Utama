import argon2 from "argon2";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(12)
    .max(200)
    .regex(/[A-Z]/, "Gunakan minimal satu huruf kapital.")
    .regex(/[a-z]/, "Gunakan minimal satu huruf kecil.")
    .regex(/[0-9]/, "Gunakan minimal satu angka.")
});
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !(await prisma.user.findFirst({
      where: { id: session.user.id, isActive: true },
      select: { id: true }
    }))
  )
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const input = schema.parse(await request.json());
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
    if (!(await argon2.verify(user.passwordHash, input.currentPassword)))
      return NextResponse.json({ error: "Password saat ini tidak benar." }, { status: 400 });
    const passwordHash = await argon2.hash(input.newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 3,
      parallelism: 1
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false }
    });
    await writeAudit({
      actorId: user.id,
      action: "PASSWORD_CHANGE",
      entityType: "User",
      entityId: user.id,
      summary: "Mengubah password akun sendiri"
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Password tidak dapat diubah." },
      { status: 400 }
    );
  }
}
