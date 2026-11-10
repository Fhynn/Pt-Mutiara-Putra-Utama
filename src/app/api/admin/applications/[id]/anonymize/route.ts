import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { anonymizeApplication } from "@/lib/application-retention";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true, permissions: true }
  });
  if (!user?.isActive || !hasPermission(user.role, "applications:write", user.permissions))
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await context.params;
  try {
    const result = await anonymizeApplication(id, session.user.id);
    if (result === "missing")
      return NextResponse.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Penghapusan belum tuntas. Coba lagi; foto yang tertinggal tetap privat." },
      { status: 503 }
    );
  }
}
