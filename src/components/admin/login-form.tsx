"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false
    });
    setLoading(false);
    if (!result?.ok) return setError("Email atau password tidak valid, atau akun sedang dikunci.");
    const callbackUrl = searchParams.get("callbackUrl");
    router.replace(callbackUrl?.startsWith("/admin") ? callbackUrl : "/admin");
    router.refresh();
  }

  return (
    <div className="login-card">
      <Image src="/brand/mpu-logo.png" alt="Logo MPU" width={80} height={69} />
      <h1>Masuk ke CMS MPU</h1>
      <p className="form-note">
        Area internal untuk staf berwenang. Tidak tersedia pendaftaran akun publik.
      </p>
      <form className="admin-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="form-status error">{error}</p> : null}
        <button className="admin-button primary" disabled={loading} type="submit">
          {loading ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
