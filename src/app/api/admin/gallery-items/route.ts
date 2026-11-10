import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

async function authorized() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const active = await prisma.user.findFirst({
    where: { id: session.user.id, isActive: true },
    select: { role: true, permissions: true }
  });
  return active && hasPermission(active.role, "content:write", active.permissions) ? session : null;
}

export async function POST(request: Request) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const input = z
      .object({
        albumId: z.string(),
        mediaId: z.string(),
        caption: z.string().max(1000).nullable().optional(),
        isCover: z.boolean().default(false)
      })
      .parse(await request.json());
    const count = await prisma.galleryItem.count({ where: { albumId: input.albumId } });
    const item = await prisma.$transaction(async (tx) => {
      if (input.isCover)
        await tx.galleryItem.updateMany({
          where: { albumId: input.albumId },
          data: { isCover: false }
        });
      return tx.galleryItem.create({ data: { ...input, displayOrder: count } });
    });
    await writeAudit({
      actorId: session.user.id,
      action: "UPDATE",
      entityType: "GalleryAlbum",
      entityId: input.albumId,
      summary: "Menambahkan media ke album"
    });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Media tidak dapat ditambahkan." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const input = z
    .object({
      albumId: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          displayOrder: z.number().int().min(0),
          caption: z.string().max(1000).nullable(),
          isCover: z.boolean()
        })
      )
    })
    .parse(await request.json());
  if (input.items.filter((item) => item.isCover).length > 1)
    return NextResponse.json({ error: "Hanya satu cover diperbolehkan." }, { status: 400 });
  await prisma.$transaction(
    input.items.map((item) =>
      prisma.galleryItem.update({
        where: { id: item.id, albumId: input.albumId },
        data: { displayOrder: item.displayOrder, caption: item.caption, isCover: item.isCover }
      })
    )
  );
  await writeAudit({
    actorId: session.user.id,
    action: "UPDATE",
    entityType: "GalleryAlbum",
    entityId: input.albumId,
    summary: "Mengurutkan media album"
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });
  const item = await prisma.galleryItem.delete({ where: { id } });
  await writeAudit({
    actorId: session.user.id,
    action: "UPDATE",
    entityType: "GalleryAlbum",
    entityId: item.albumId,
    summary: "Menghapus media dari album"
  });
  return NextResponse.json({ ok: true });
}
