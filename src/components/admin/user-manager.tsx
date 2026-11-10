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
          <p>Hanya super admin yang dapat mengelola akun dan role.</p>
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
              <span>Role</span>
              <select
                value={String(form.role)}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
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
            <label>
              <span>Akun aktif</span>
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
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
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                    {user.mustChangePassword ? " · wajib ganti password" : ""}
                  </td>
                  <td>
                    <button className="admin-button" onClick={() => edit(user)}>
                      Edit
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
