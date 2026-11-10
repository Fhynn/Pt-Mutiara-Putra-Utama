import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login?callbackUrl=/admin");
  const active = await prisma.user
    .findFirst({ where: { id: session.user.id, isActive: true }, select: { id: true } })
    .catch(() => null);
  if (!active) redirect("/admin/login");
  return (
    <AdminShell
      user={{ name: session.user.name, email: session.user.email, role: session.user.role }}
    >
      {children}
    </AdminShell>
  );
}
