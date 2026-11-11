import { prisma } from "@/lib/db";
import { adminResources, type AdminOption, type AdminResourceConfig } from "@/lib/admin-resources";
import { serializeBigInt } from "@/lib/utils";

type CrudDelegate = {
  findMany(args: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  update(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  delete(args: Record<string, unknown>): Promise<Record<string, unknown>>;
};

function delegate(config: AdminResourceConfig) {
  return (prisma as unknown as Record<string, CrudDelegate>)[config.model];
}

export async function listAdminResource(resource: string, query = "") {
  const config = adminResources[resource];
  if (!config) throw new Error("Resource admin tidak dikenal.");
  const where =
    query && config.searchFields?.length
      ? {
          OR: config.searchFields.map((field) => ({
            [field]: { contains: query, mode: "insensitive" }
          }))
        }
      : {};
  const rows = await delegate(config).findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return serializeBigInt(rows) as Record<string, unknown>[];
}

export async function getAdminRelationOptions(config: AdminResourceConfig) {
  const requested = new Set(config.fields.map((field) => field.relation).filter(Boolean));
  const result: Record<string, AdminOption[]> = {};

  await Promise.all(
    [...requested].map(async (relation) => {
      if (relation === "countries") {
        const rows = await prisma.country.findMany({ orderBy: { name: "asc" } });
        result[relation] = rows.map((row) => ({ value: row.id, label: row.name }));
      } else if (relation === "sectors") {
        const rows = await prisma.sector.findMany({ orderBy: { name: "asc" } });
        result[relation] = rows.map((row) => ({ value: row.id, label: row.name }));
      } else if (relation === "users") {
        const rows = await prisma.user.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" }
        });
        result[relation] = rows.map((row) => ({
          value: row.id,
          label: `${row.name} — ${row.email}`
        }));
      } else if (relation === "media") {
        const rows = await prisma.mediaAsset.findMany({
          where: { isDeleted: false, visibility: "PUBLIC" },
          orderBy: { createdAt: "desc" },
          take: 250
        });
        result[relation] = rows.map((row) => ({
          value: row.id,
          label: row.title || row.altText || row.originalName
        }));
      } else if (relation === "mediaImages") {
        const rows = await prisma.mediaAsset.findMany({
          where: {
            isDeleted: false,
            visibility: "PUBLIC",
            kind: "IMAGE",
            publicUrl: { not: null }
          },
          orderBy: { createdAt: "desc" },
          take: 250
        });
        result[relation] = rows.map((row) => ({
          value: row.id,
          label: row.title || row.altText || row.originalName,
          previewUrl: row.publicUrl!
        }));
      } else if (relation === "mediaUrls") {
        const rows = await prisma.mediaAsset.findMany({
          where: {
            isDeleted: false,
            visibility: "PUBLIC",
            kind: "IMAGE",
            publicUrl: { not: null }
          },
          orderBy: { createdAt: "desc" },
          take: 250
        });
        result[relation] = rows.map((row) => ({
          value: row.publicUrl!,
          label: row.title || row.altText || row.originalName,
          previewUrl: row.publicUrl!
        }));
      } else if (relation === "articleCategories") {
        const rows = await prisma.articleCategory.findMany({ orderBy: { name: "asc" } });
        result[relation] = rows.map((row) => ({ value: row.id, label: row.name }));
      }
    })
  );

  return result;
}

export async function createAdminResource(resource: string, data: Record<string, unknown>) {
  const config = adminResources[resource];
  if (!config) throw new Error("Resource admin tidak dikenal.");
  return delegate(config).create({ data });
}

export async function updateAdminResource(
  resource: string,
  id: string,
  data: Record<string, unknown>
) {
  const config = adminResources[resource];
  if (!config) throw new Error("Resource admin tidak dikenal.");
  return delegate(config).update({ where: { id }, data });
}

export async function deleteAdminResource(resource: string, id: string) {
  const config = adminResources[resource];
  if (!config) throw new Error("Resource admin tidak dikenal.");
  return delegate(config).delete({ where: { id } });
}
