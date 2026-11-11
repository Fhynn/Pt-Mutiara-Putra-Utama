import { UserManager } from "@/components/admin/user-manager";
import { notFound } from "next/navigation";
import { getActiveAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const user = (await getActiveAdmin())?.user;
  if (!user || !hasPermission(user.role, "users:manage", user.permissions)) notFound();
  const items = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  return (
    <UserManager
      initialItems={items.map((item) => ({
        ...item,
        lastLoginAt: item.lastLoginAt?.toISOString() ?? null
      }))}
    />
  );
}
