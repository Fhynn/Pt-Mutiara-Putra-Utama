import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { adminResources, mutationEnvelope, normalizeAdminPayload } from "@/lib/admin-resources";
import {
  createAdminResource,
  deleteAdminResource,
  listAdminResource,
  updateAdminResource
} from "@/lib/admin-data";
import { authOptions } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { hasPermission, type Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { sanitizeRichText } from "@/lib/sanitize";

const permissions: Record<string, { read: Permission; write?: Permission }> = {
  content: { read: "content:read", write: "content:write" },
  applications: { read: "applications:read", write: "applications:write" },
  messages: { read: "messages:read", write: "messages:write" },
  audit: { read: "audit:read" },
  users: { read: "users:manage", write: "users:manage" },
  settings: { read: "settings:manage", write: "settings:manage" }
};

async function authorize(resource: string, write = false) {
  const session = await getServerSession(authOptions);
  const config = adminResources[resource];
  if (!session?.user || !config) return null;
  const active = await prisma.user.findFirst({
    where: { id: session.user.id, isActive: true },
    select: { role: true, permissions: true }
  });
  if (!active) return null;
  session.user.role = active.role;
  session.user.permissions = active.permissions;
  const permission = write
    ? permissions[config.permission].write
    : permissions[config.permission].read;
  if (!permission || !hasPermission(session.user.role, permission, session.user.permissions))
    return null;
  return { session, config };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  const access = await authorize(resource);
  if (!access) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const items = await listAdminResource(resource, request.nextUrl.searchParams.get("q") ?? "");
  return NextResponse.json({ items });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  const access = await authorize(resource, true);
  if (!access || access.config.readonly)
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const parsed = mutationEnvelope.parse(await request.json());
    if (access.config.noCreate && !parsed.id)
      return NextResponse.json({ error: "Data hanya dapat diperbarui." }, { status: 400 });
    const data = normalizeAdminPayload(access.config, parsed.data);
    for (const key of [
      "body",
      "detail",
      "description",
      "history",
      "directorMessage",
      "answer",
      "privacyPolicy",
      "terms"
    ]) {
      if (typeof data[key] === "string") data[key] = sanitizeRichText(data[key]);
    }
    if (
      data.content &&
      typeof data.content === "object" &&
      /<\s*script|javascript:|on\w+\s*=/i.test(JSON.stringify(data.content))
    ) {
      return NextResponse.json(
        { error: "Isi halaman mengandung format yang tidak diizinkan." },
        { status: 400 }
      );
    }
    const status = String(data.status ?? "");
    if (
      (status === "PUBLISHED" || status === "OPEN") &&
      !hasPermission(access.session.user.role, "content:publish", access.session.user.permissions)
    ) {
      return NextResponse.json(
        { error: "Role Anda tidak dapat memublikasikan konten." },
        { status: 403 }
      );
    }
    if (status === "PUBLISHED" || status === "OPEN") data.publishedAt = new Date();
    const item = parsed.id
      ? await updateAdminResource(resource, parsed.id, data)
      : await createAdminResource(resource, data);
    await writeAudit({
      actorId: access.session.user.id,
      action: parsed.id ? "UPDATE" : "CREATE",
      entityType: access.config.model,
      entityId: String(item.id),
      summary: `${parsed.id ? "Memperbarui" : "Membuat"} ${access.config.singular}`
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Data tidak dapat disimpan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  const access = await authorize(resource, true);
  if (!access || access.config.noDelete || access.config.readonly)
    return NextResponse.json({ error: "Penghapusan tidak diizinkan." }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  try {
    await deleteAdminResource(resource, id);
    await writeAudit({
      actorId: access.session.user.id,
      action: "DELETE",
      entityType: access.config.model,
      entityId: id,
      summary: `Menghapus ${access.config.singular}`
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Data tidak dapat dihapus." },
      { status: 409 }
    );
  }
}
