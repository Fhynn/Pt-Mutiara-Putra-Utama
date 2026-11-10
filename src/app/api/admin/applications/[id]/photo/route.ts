import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { createPrivateDownloadUrl } from "@/lib/storage";

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
    select: { photoObjectKey: true }
  });
  if (!application?.photoObjectKey)
    return NextResponse.json({ error: "Foto tidak tersedia." }, { status: 404 });
  const url = await createPrivateDownloadUrl(application.photoObjectKey, 60);
  await writeAudit({
    actorId: session.user.id,
    action: "VIEW_SENSITIVE",
    entityType: "Application",
    entityId: id,
    summary: "Melihat foto pendaftar"
  });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "private, no-store" } });
}
