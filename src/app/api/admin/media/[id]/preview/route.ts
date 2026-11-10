import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { createPrivateDownloadUrl } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user
    ? await prisma.user.findFirst({
        where: { id: session.user.id, isActive: true },
        select: { role: true, permissions: true }
      })
    : null;
  if (!user || !hasPermission(user.role, "media:write", user.permissions))
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const { id } = await params;
  const media = await prisma.mediaAsset.findFirst({ where: { id, isDeleted: false } });
  if (!media) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  if (media.kind === "EMBED" && media.embedUrl)
    return NextResponse.redirect(media.embedUrl, { headers: { "Cache-Control": "no-store" } });
  if (media.visibility === "PUBLIC" && media.publicUrl)
    return NextResponse.redirect(media.publicUrl, { headers: { "Cache-Control": "no-store" } });
  if (media.visibility !== "PRIVATE")
    return NextResponse.json({ error: "File belum dapat ditampilkan." }, { status: 400 });
  try {
    const url = await createPrivateDownloadUrl(media.objectKey);
    return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Pratinjau belum tersedia." }, { status: 503 });
  }
}
