import { PasswordForm } from "@/components/admin/password-form";
import { getActiveAdmin } from "@/lib/admin-session";
export default async function ProfileAccountPage() {
  const admin = await getActiveAdmin();
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Profil Akun</h1>
          <p>
            {admin?.user.name} · {admin?.user.email} · {admin?.user.role}
          </p>
        </div>
      </div>
      {admin?.session.user.mustChangePassword && (
        <div className="admin-alert">
          Akun ini wajib mengganti password awal sebelum dipakai rutin.
        </div>
      )}
      <PasswordForm />
    </>
  );
}
