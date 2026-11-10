import { UserManager } from "@/components/admin/user-manager";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !hasPermission(session.user.role, "users:manage", session.user.permissions))
    notFound();
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
