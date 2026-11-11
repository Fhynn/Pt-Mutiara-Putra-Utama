import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getActiveAdmin } from "@/lib/admin-session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getActiveAdmin();
  if (!admin) redirect("/admin/login?callbackUrl=/admin");
  return (
    <AdminShell user={{ name: admin.user.name, email: admin.user.email, role: admin.user.role }}>
      {children}
    </AdminShell>
  );
}
