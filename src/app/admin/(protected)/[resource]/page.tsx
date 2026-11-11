import { notFound } from "next/navigation";
import { InboxManager, type InboxItem } from "@/components/admin/inbox-manager";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminResources } from "@/lib/admin-resources";
import { getAdminRelationOptions, listAdminResource } from "@/lib/admin-data";
import { getActiveAdmin } from "@/lib/admin-session";
import { hasPermission, type Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { ApplicationStatus, ContactStatus } from "@/generated/prisma/enums";

const readPermissions: Record<string, Permission> = {
  content: "content:read",
  applications: "applications:read",
  messages: "messages:read",
  settings: "settings:manage",
  users: "users:manage",
  audit: "audit:read"
};

export const dynamic = "force-dynamic";

export default async function AdminResourcePage({
  params,
  searchParams
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ id?: string; q?: string; status?: string; page?: string }>;
}) {
  const { resource } = await params;
  const config = adminResources[resource];
  if (!config) notFound();
  const user = (await getActiveAdmin())?.user;
  if (
    !user?.isActive ||
    !hasPermission(user.role, readPermissions[config.permission], user.permissions)
  )
    notFound();
  if (resource === "pendaftar" || resource === "pesan") {
    const { id, q: rawQuery, status: rawStatus, page: rawPage } = await searchParams;
    const query = rawQuery?.trim().slice(0, 100) ?? "";
    const page = Math.max(1, Math.min(100_000, Number.parseInt(rawPage ?? "1", 10) || 1));
    const pageSize = 30;
    const canEdit = hasPermission(
      user.role,
      resource === "pendaftar" ? "applications:write" : "messages:write",
      user.permissions
    );
    let inboxItems: InboxItem[];
    let total: number;
    let statusFilter = "ALL";
    if (resource === "pendaftar") {
      const status = Object.values(ApplicationStatus).includes(rawStatus as ApplicationStatus)
        ? (rawStatus as ApplicationStatus)
        : undefined;
      statusFilter = status ?? "ALL";
      const where: Prisma.ApplicationWhereInput = {
        ...(status ? { status } : {}),
        ...(query
          ? {
              OR: [
                { fullName: { contains: query, mode: "insensitive" } },
                { referenceNumber: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } }
              ]
            }
          : {})
      };
      const [count, rows] = await Promise.all([
        prisma.application.count({ where }),
        prisma.application.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            referenceNumber: true,
            fullName: true,
            status: true,
            createdAt: true,
            phone: true,
            email: true,
            message: true,
            domicile: true,
            workExperience: true,
            sector: true,
            preferredOccupation: true,
            birthPlace: true,
            birthDate: true,
            gender: true,
            maritalStatus: true,
            religion: true,
            heightCm: true,
            weightKg: true,
            address: true,
            rt: true,
            rw: true,
            village: true,
            district: true,
            province: true,
            nikEncrypted: true,
            photoObjectKey: true,
            anonymizedAt: true,
            country: { select: { name: true } },
            job: { select: { title: true } }
          }
        })
      ]);
      total = count;
      inboxItems = rows.map((row) => ({
        id: row.id,
        name: row.fullName,
        createdAt: row.createdAt.toISOString(),
        status: row.status,
        phone: row.phone,
        email: row.email,
        message: row.message,
        referenceNumber: row.referenceNumber,
        domicile: row.domicile,
        country: row.country?.name,
        job: row.job?.title,
        workExperience: row.workExperience ?? undefined,
        sector: row.sector ?? undefined,
        preferredOccupation: row.preferredOccupation ?? undefined,
        birthPlace: row.birthPlace ?? undefined,
        birthDate: row.birthDate?.toISOString().slice(0, 10),
        gender: row.gender ?? undefined,
        maritalStatus: row.maritalStatus ?? undefined,
        religion: row.religion ?? undefined,
        heightCm: row.heightCm ?? undefined,
        weightKg: row.weightKg ?? undefined,
        address: row.address ?? undefined,
        rt: row.rt ?? undefined,
        rw: row.rw ?? undefined,
        village: row.village ?? undefined,
        district: row.district ?? undefined,
        province: row.province ?? undefined,
        hasNik: Boolean(row.nikEncrypted),
        hasPhoto: Boolean(row.photoObjectKey),
        anonymizedAt: row.anonymizedAt?.toISOString()
      }));
    } else {
      const status = Object.values(ContactStatus).includes(rawStatus as ContactStatus)
        ? (rawStatus as ContactStatus)
        : undefined;
      statusFilter = status ?? "ALL";
      const where: Prisma.ContactMessageWhereInput = {
        ...(status ? { status } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { subject: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } }
              ]
            }
          : {})
      };
      const [count, rows] = await Promise.all([
        prisma.contactMessage.count({ where }),
        prisma.contactMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            name: true,
            createdAt: true,
            status: true,
            phone: true,
            email: true,
            message: true,
            subject: true
          }
        })
      ]);
      total = count;
      inboxItems = rows.map((row) => ({
        id: row.id,
        name: row.name,
        createdAt: row.createdAt.toISOString(),
        status: row.status,
        phone: row.phone,
        email: row.email,
        message: row.message,
        subject: row.subject
      }));
    }
    return (
      <InboxManager
        key={`${resource}-${page}-${query}-${statusFilter}`}
        kind={resource}
        initialItems={inboxItems}
        initialSelectedId={id}
        canEdit={canEdit}
        initialQuery={query}
        initialFilter={statusFilter}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    );
  }
  const [items, relationOptions] = await Promise.all([
    listAdminResource(resource),
    getAdminRelationOptions(config)
  ]);
  return (
    <ResourceManager
      resource={resource}
      config={config}
      initialItems={items}
      relationOptions={relationOptions}
    />
  );
}
