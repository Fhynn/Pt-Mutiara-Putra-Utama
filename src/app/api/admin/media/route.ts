import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { validateAndProcessUpload } from "@/lib/media-validation";
import { hasPermission } from "@/lib/permissions";
import {
  copyPrivateObjectToPublic,
  deleteObject,
  isStorageConfigured,
  putObject
} from "@/lib/storage";
import { serializeBigInt } from "@/lib/utils";

async function authorized() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const active = await prisma.user.findFirst({
    where: { id: session.user.id, isActive: true },
    select: { role: true, permissions: true }
  });
  return active && hasPermission(active.role, "media:write", active.permissions) ? session : null;
}

export async function GET() {
  if (!(await authorized()))
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const items = await prisma.mediaAsset.findMany({
    where: { isDeleted: false },
    include: {
      _count: { select: { usages: true, galleryItems: true } },
      galleryItems: {
        select: {
          album: { select: { id: true, title: true, slug: true, status: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({
    items: serializeBigInt(items),
    storageConfigured: isStorageConfigured()
  });
}

export async function POST(request: NextRequest) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      const input = z
        .object({
          embedUrl: z.string().url(),
          title: z.string().min(2),
          altText: z.string().default("")
        })
        .parse(await request.json());
      const url = new URL(input.embedUrl);
      if (
        !["youtube.com", "www.youtube.com", "youtu.be", "vimeo.com", "www.vimeo.com"].includes(
          url.hostname
        )
      )
        throw new Error("Hanya embed YouTube atau Vimeo yang diizinkan.");
      const item = await prisma.mediaAsset.create({
        data: {
          objectKey: `embed/${randomUUID()}`,
          originalName: input.title,
          safeName: input.title,
          kind: "EMBED",
          visibility: "PUBLIC",
          mimeType: "text/uri-list",
          sizeBytes: 0n,
          title: input.title,
          altText: input.altText,
          embedUrl: input.embedUrl,
          permissionStatus: "NEEDS_CONFIRMATION",
          uploaderId: session.user.id
        }
      });
      await writeAudit({
        actorId: session.user.id,
        action: "CREATE",
        entityType: "MediaAsset",
        entityId: item.id,
        summary: `Menambahkan embed ${input.title}`
      });
      return NextResponse.json({ item: serializeBigInt(item) });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Embed tidak valid." },
        { status: 400 }
      );
    }
  }
  if (!isStorageConfigured())
    return NextResponse.json(
      { error: "Object storage belum dikonfigurasi. Isi variabel S3/R2/MinIO sebelum upload." },
      { status: 503 }
    );
  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    const batchLimit = Number(process.env.MAX_UPLOAD_BATCH ?? 10);
    if (!files.length || files.length > batchLimit)
      throw new Error(`Pilih 1 sampai ${batchLimit} file.`);
    const visibility = form.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";
    const created = [];
    for (const file of files) {
      const processed = await validateAndProcessUpload(file);
      const publicUrl = await putObject({
        objectKey: processed.objectKey,
        body: processed.body,
        contentType: processed.mimeType,
        visibility
      });
      if (processed.thumbnail && processed.thumbnailKey)
        await putObject({
          objectKey: processed.thumbnailKey,
          body: processed.thumbnail,
          contentType: "image/webp",
          visibility
        });
      const item = await prisma.mediaAsset.create({
        data: {
          objectKey: processed.objectKey,
          publicUrl,
          originalName: file.name,
          safeName: processed.safeName,
          kind: processed.kind,
          visibility,
          mimeType: processed.mimeType,
          sizeBytes: BigInt(processed.body.length),
          width: processed.width,
          height: processed.height,
          altText: String(form.get("altText") ?? ""),
          checksum: processed.checksum,
          permissionStatus: String(form.get("permissionStatus") ?? "NEEDS_CONFIRMATION"),
          uploaderId: session.user.id
        }
      });
      created.push(serializeBigInt(item));
      await writeAudit({
        actorId: session.user.id,
        action: "CREATE",
        entityType: "MediaAsset",
        entityId: item.id,
        summary: `Mengunggah ${file.name}`
      });
    }
    return NextResponse.json({ items: created });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload gagal." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const body = await request.json();
    if (body?.action === "makePublic") {
      const input = z
        .object({ action: z.literal("makePublic"), id: z.string(), confirmed: z.literal(true) })
        .parse(body);
      const current = await prisma.mediaAsset.findUnique({ where: { id: input.id } });
      if (!current || current.isDeleted)
        return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
      if (current.visibility === "PUBLIC")
        return NextResponse.json({ item: serializeBigInt(current) });
      if (current.kind === "EMBED")
        return NextResponse.json({ error: "Tautan video sudah bersifat publik." }, { status: 400 });

      const publicUrl = await copyPrivateObjectToPublic(current.objectKey, current.mimeType);
      let item;
      try {
        item = await prisma.mediaAsset.update({
          where: { id: current.id },
          data: { visibility: "PUBLIC", publicUrl, permissionStatus: "CLIENT_PROVIDED" }
        });
      } catch (error) {
        await deleteObject(current.objectKey, "PUBLIC").catch(() => undefined);
        throw error;
      }
      await deleteObject(current.objectKey, "PRIVATE").catch(() => undefined);
      await writeAudit({
        actorId: session.user.id,
        action: "UPDATE",
        entityType: "MediaAsset",
        entityId: item.id,
        summary: `Membuka akses publik untuk ${item.originalName}`
      });
      return NextResponse.json({ item: serializeBigInt(item) });
    }
    const input = z
      .object({
        id: z.string(),
        altText: z.string().max(300),
        title: z.string().max(200).nullable(),
        caption: z.string().max(1000).nullable(),
        photographer: z.string().max(200).nullable(),
        source: z.string().max(500).nullable(),
        license: z.string().max(200).nullable(),
        permissionStatus: z.string().max(80),
        folder: z.string().max(120).nullable(),
        focalX: z.number().min(0).max(1),
        focalY: z.number().min(0).max(1)
      })
      .parse(body);
    const item = await prisma.mediaAsset.update({
      where: { id: input.id, isDeleted: false },
      data: input
    });
    await writeAudit({
      actorId: session.user.id,
      action: "UPDATE",
      entityType: "MediaAsset",
      entityId: item.id,
      summary: `Memperbarui keterangan ${item.originalName}`
    });
    return NextResponse.json({ item: serializeBigInt(item) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Perubahan file tidak dapat disimpan." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });
  const item = await prisma.mediaAsset.findUnique({
    where: { id },
    include: { _count: { select: { usages: true, galleryItems: true } } }
  });
  if (!item) return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });
  if (item._count.usages || item._count.galleryItems)
    return NextResponse.json(
      {
        error: `Media masih dipakai pada ${item._count.usages + item._count.galleryItems} lokasi.`
      },
      { status: 409 }
    );
  await prisma.mediaAsset.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() }
  });
  if (isStorageConfigured() && item.kind !== "EMBED")
    await deleteObject(item.objectKey, item.visibility).catch(() => undefined);
  await writeAudit({
    actorId: session.user.id,
    action: "DELETE",
    entityType: "MediaAsset",
    entityId: id,
    summary: `Soft-delete ${item.originalName}`
  });
  return NextResponse.json({ ok: true });
}
