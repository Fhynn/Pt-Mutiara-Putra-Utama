import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { decryptNik } from "@/lib/application-private";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true, permissions: true }
  });
  if (!user?.isActive || !hasPermission(user.role, "applications:write", user.permissions))
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await context.params;
  const application = await prisma.application.findUnique({
    where: { id },
    select: { nikEncrypted: true }
  });
  if (!application?.nikEncrypted)
    return NextResponse.json({ error: "NIK tidak tersedia." }, { status: 404 });
  try {
    const nik = decryptNik(application.nikEncrypted);
    await writeAudit({
      actorId: session.user.id,
      action: "VIEW_SENSITIVE",
      entityType: "Application",
      entityId: id,
      summary: "Melihat NIK pendaftar"
    });
    return NextResponse.json({ nik }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "NIK tidak dapat dibuka." }, { status: 500 });
  }
}
