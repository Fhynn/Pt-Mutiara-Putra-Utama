import { getServerSession } from "next-auth";
import { PasswordForm } from "@/components/admin/password-form";
import { authOptions } from "@/lib/auth";
export default async function ProfileAccountPage() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Profil Akun</h1>
          <p>
            {session?.user.name} · {session?.user.email} · {session?.user.role}
          </p>
        </div>
      </div>
      {session?.user.mustChangePassword && (
        <div className="admin-alert">
          Akun ini wajib mengganti password awal sebelum dipakai rutin.
        </div>
      )}
      <PasswordForm />
    </>
  );
}
