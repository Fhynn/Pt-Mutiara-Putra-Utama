import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Login Admin" };
export default function AdminLoginPage() {
  return (
    <main className="login-page">
      <Suspense fallback={<div className="login-card">Memuat…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
