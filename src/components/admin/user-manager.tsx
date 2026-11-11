"use client";
import { useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
};
const empty = { name: "", email: "", role: "VIEWER", password: "", isActive: true };
const roles = [
  {
    value: "VIEWER",
    label: "Pembaca",
    description: "Hanya melihat data, tidak dapat mengubahnya."
  },
  {
    value: "EDITOR",
    label: "Editor konten",
    description: "Dapat menulis dan mengubah konten website."
  },
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Dapat mengelola konten, pendaftar, dan pesan."
  },
  {
    value: "SUPER_ADMIN",
    label: "Administrator utama",
    description: "Dapat mengelola seluruh website dan akun staf."
  }
] as const;

export function UserManager({ initialItems }: { initialItems: UserRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<Record<string, string | boolean>>(empty);
  const [id, setId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function reload() {
    const r = await fetch("/api/admin/users");
    const b = await r.json();
    if (r.ok) setItems(b.items);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: id ?? undefined })
    });
    const b = await r.json();
    setMessage(r.ok ? "Akun berhasil disimpan." : b.error);
    if (r.ok) {
      setForm(empty);
      setId(null);
      await reload();
    }
  }
  function edit(user: UserRow) {
    setId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      isActive: user.isActive
    });
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Pengguna Internal</h1>
          <p>Tambahkan staf yang boleh masuk dan tentukan tugasnya.</p>
        </div>
      </div>
      <section className="admin-panel" style={{ marginBottom: 20 }}>
        <form onSubmit={save}>
          <div className="admin-form-grid">
            <label>
              <span>Nama *</span>
              <input
                required
                value={String(form.name)}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              <span>Email *</span>
              <input
                required
                type="email"
                value={String(form.email)}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              <span>Hak akses</span>
              <select
                value={String(form.role)}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <small>{roles.find((role) => role.value === form.role)?.description}</small>
            </label>
            <label>
              <span>{id ? "Password baru (opsional)" : "Password awal *"}</span>
              <input
                minLength={12}
                required={!id}
                type="password"
                value={String(form.password)}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label className="admin-user-active">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span>Izinkan akun ini masuk ke dashboard</span>
            </label>
          </div>
          <div className="admin-actions" style={{ marginTop: 18 }}>
            <button className="admin-button primary">Simpan</button>
            {id && (
              <button
                className="admin-button"
                type="button"
                onClick={() => {
                  setId(null);
                  setForm(empty);
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
        {message && <p className="admin-message">{message}</p>}
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Hak akses</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{roles.find((role) => role.value === user.role)?.label ?? user.role}</td>
                  <td>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                    {user.mustChangePassword ? " · wajib ganti password" : ""}
                  </td>
                  <td>
                    <button className="admin-button" onClick={() => edit(user)}>
                      Ubah akun
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
