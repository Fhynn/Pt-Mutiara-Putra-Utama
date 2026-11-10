"use client";
import { useState } from "react";
export function PasswordForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNext] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const b = await r.json();
    setMessage(r.ok ? "Password berhasil diubah." : b.error);
    if (r.ok) {
      setCurrent("");
      setNext("");
    }
  }
  return (
    <section className="admin-panel">
      <form onSubmit={submit}>
        <div className="admin-form-grid">
          <label>
            <span>Password saat ini</span>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </label>
          <label>
            <span>Password baru</span>
            <input
              required
              minLength={12}
              type="password"
              value={newPassword}
              onChange={(e) => setNext(e.target.value)}
            />
            <small>Minimal 12 karakter, huruf besar, huruf kecil, dan angka.</small>
          </label>
        </div>
        <button className="admin-button primary" style={{ marginTop: 18 }}>
          Ubah password
        </button>
      </form>
      {message && <p className="admin-message">{message}</p>}
    </section>
  );
}
