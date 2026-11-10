import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminResources } from "@/lib/admin-resources";
import { getAdminRelationOptions, listAdminResource } from "@/lib/admin-data";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";

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
  params
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const config = adminResources[resource];
  if (!config) notFound();
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !hasPermission(session.user.role, readPermissions[config.permission], session.user.permissions)
  )
    notFound();
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
