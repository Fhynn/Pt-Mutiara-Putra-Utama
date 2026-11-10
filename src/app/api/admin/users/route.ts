import argon2 from "argon2";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase()),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]),
  password: z.string().min(12).max(200).optional(),
  isActive: z.boolean().default(true)
});

async function authorized() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const active = await prisma.user.findFirst({
    where: { id: session.user.id, isActive: true },
    select: { role: true, permissions: true }
  });
  return active && hasPermission(active.role, "users:manage", active.permissions) ? session : null;
}

export async function GET() {
  if (!(await authorized()))
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const items = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const input = userSchema.parse(await request.json());
    if (!input.id && !input.password)
      return NextResponse.json({ error: "Password awal wajib diisi." }, { status: 400 });
    if (input.id) {
      const current = await prisma.user.findUniqueOrThrow({ where: { id: input.id } });
      const activeSuperAdmins = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true }
      });
      if (
        current.role === "SUPER_ADMIN" &&
        activeSuperAdmins <= 1 &&
        (!input.isActive || input.role !== "SUPER_ADMIN")
      )
        return NextResponse.json(
          { error: "Super admin aktif terakhir tidak boleh dinonaktifkan atau diturunkan." },
          { status: 409 }
        );
      const passwordHash = input.password
        ? await argon2.hash(input.password, {
            type: argon2.argon2id,
            memoryCost: 19456,
            timeCost: 3,
            parallelism: 1
          })
        : undefined;
      await prisma.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
          isActive: input.isActive,
          ...(passwordHash ? { passwordHash, mustChangePassword: true } : {})
        }
      });
      await writeAudit({
        actorId: session.user.id,
        action: "UPDATE",
        entityType: "User",
        entityId: input.id,
        summary: `Memperbarui akun ${input.email}`
      });
    } else {
      const passwordHash = await argon2.hash(input.password!, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 3,
        parallelism: 1
      });
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
          isActive: input.isActive,
          passwordHash,
          mustChangePassword: true
        }
      });
      await writeAudit({
        actorId: session.user.id,
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        summary: `Membuat akun ${input.email}`
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyimpan pengguna." },
      { status: 400 }
    );
  }
}
