"use client";
import Image from "next/image";
import { ImageIcon, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";

type MediaRow = {
  id: string;
  originalName: string;
  kind: string;
  visibility: string;
  publicUrl?: string | null;
  embedUrl?: string | null;
  sizeBytes: string;
  permissionStatus: string;
  altText: string;
  title?: string | null;
  caption?: string | null;
  photographer?: string | null;
  source?: string | null;
  license?: string | null;
  folder?: string | null;
  focalX: number;
  focalY: number;
  _count: { usages: number; galleryItems: number };
};
export function MediaManager({
  initialItems,
  configured
}: {
  initialItems: MediaRow[];
  configured: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [files, setFiles] = useState<File[]>([]);
  const [visibility, setVisibility] = useState("PUBLIC");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [access, setAccess] = useState("ALL");
  const [embed, setEmbed] = useState({ title: "", embedUrl: "", altText: "" });
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesAccess = access === "ALL" || item.visibility === access;
        const haystack =
          `${item.title ?? ""} ${item.originalName} ${item.folder ?? ""}`.toLowerCase();
        return matchesAccess && haystack.includes(query.toLowerCase());
      }),
    [access, items, query]
  );
  async function reload() {
    const r = await fetch("/api/admin/media");
    const b = await r.json();
    if (r.ok) setItems(b.items);
  }
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const data = new FormData();
    files.forEach((file) => data.append("files", file));
    data.append("visibility", visibility);
    const r = await fetch("/api/admin/media", { method: "POST", body: data });
    const b = await r.json();
    setMessage(r.ok ? `${files.length} file berhasil diunggah.` : b.error);
    if (r.ok) {
      setFiles([]);
      await reload();
    }
    setBusy(false);
  }
  async function addEmbed(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed)
    });
    const b = await r.json();
    setMessage(r.ok ? "Embed berhasil ditambahkan." : b.error);
    if (r.ok) {
      setEmbed({ title: "", embedUrl: "", altText: "" });
      await reload();
    }
  }
  async function remove(id: string) {
    if (!confirm("Soft-delete media ini?")) return;
    const r = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
    const b = await r.json();
    setMessage(r.ok ? "Media dihapus." : b.error);
    if (r.ok) await reload();
  }
  async function saveMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const r = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    const b = await r.json();
    setMessage(r.ok ? "Metadata media disimpan." : b.error);
    if (r.ok) {
      setEditing(null);
      await reload();
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Pustaka Media</h1>
          <p>Kelola seluruh foto dan video perusahaan dari satu tempat.</p>
        </div>
      </div>
      {!configured && (
        <div className="admin-alert">
          Upload baru belum aktif karena penyimpanan cloud belum dikonfigurasi. Semua media klien
          yang sudah diimpor tetap tersedia di bawah ini.
        </div>
      )}
      <div className="admin-grid-2">
        <section className="admin-panel">
          <h2>Unggah beberapa file</h2>
          <form onSubmit={upload}>
            <label>
              <span>Pilih file</span>
              <input
                accept="image/jpeg,image/png,image/webp,image/avif,application/pdf,video/mp4,video/webm"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                type="file"
              />
            </label>
            <label>
              <span>Siapa yang dapat melihat?</span>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="PUBLIC">Publik — dapat ditampilkan di website</option>
                <option value="PRIVATE">Privat — hanya untuk admin</option>
              </select>
            </label>
            <button
              className="admin-button primary"
              disabled={busy || !files.length || !configured}
            >
              {busy ? "Mengunggah…" : `Unggah ${files.length || ""} file`}
            </button>
          </form>
        </section>
        <section className="admin-panel">
          <h2>Embed video</h2>
          <form onSubmit={addEmbed}>
            <label>
              <span>Judul</span>
              <input
                required
                value={embed.title}
                onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
              />
            </label>
            <label>
              <span>Tautan YouTube/Vimeo</span>
              <input
                required
                type="url"
                value={embed.embedUrl}
                onChange={(e) => setEmbed({ ...embed, embedUrl: e.target.value })}
              />
            </label>
            <label>
              <span>Deskripsi untuk aksesibilitas</span>
              <input
                value={embed.altText}
                onChange={(e) => setEmbed({ ...embed, altText: e.target.value })}
              />
            </label>
            <button className="admin-button primary">Tambah embed</button>
          </form>
        </section>
      </div>
      {message && <p className="admin-message">{message}</p>}
      {editing && (
        <section className="admin-panel" style={{ marginTop: 20 }}>
          <div className="admin-panel-header">
            <h2>Edit metadata: {editing.originalName}</h2>
            <button className="admin-button" type="button" onClick={() => setEditing(null)}>
              Tutup
            </button>
          </div>
          <form onSubmit={saveMetadata}>
            <div className="admin-form-grid">
              <label>
                <span>Deskripsi untuk aksesibilitas</span>
                <input
                  value={editing.altText}
                  onChange={(e) => setEditing({ ...editing, altText: e.target.value })}
                />
              </label>
              <label>
                <span>Judul</span>
                <input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value || null })}
                />
              </label>
              <label className="wide">
                <span>Caption</span>
                <textarea
                  value={editing.caption ?? ""}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value || null })}
                />
              </label>
              <label>
                <span>Fotografer</span>
                <input
                  value={editing.photographer ?? ""}
                  onChange={(e) => setEditing({ ...editing, photographer: e.target.value || null })}
                />
              </label>
              <label>
                <span>Sumber</span>
                <input
                  value={editing.source ?? ""}
                  onChange={(e) => setEditing({ ...editing, source: e.target.value || null })}
                />
              </label>
              <label>
                <span>Lisensi</span>
                <input
                  value={editing.license ?? ""}
                  onChange={(e) => setEditing({ ...editing, license: e.target.value || null })}
                />
              </label>
              <label>
                <span>Status izin penggunaan</span>
                <select
                  value={editing.permissionStatus}
                  onChange={(e) => setEditing({ ...editing, permissionStatus: e.target.value })}
                >
                  <option value="CLIENT_PROVIDED">Diberikan dan disetujui klien</option>
                  <option value="NEEDS_CONFIRMATION">Perlu konfirmasi</option>
                  <option value="PRIVATE_REVIEW_REQUIRED">Privat — perlu ditinjau</option>
                </select>
              </label>
              <label>
                <span>Folder</span>
                <input
                  value={editing.folder ?? ""}
                  onChange={(e) => setEditing({ ...editing, folder: e.target.value || null })}
                />
              </label>
              <label>
                <span>Posisi fokus horizontal</span>
                <input
                  min="0"
                  max="1"
                  step="0.01"
                  type="range"
                  value={editing.focalX}
                  onChange={(e) => setEditing({ ...editing, focalX: Number(e.target.value) })}
                />
              </label>
              <label>
                <span>Posisi fokus vertikal</span>
                <input
                  min="0"
                  max="1"
                  step="0.01"
                  type="range"
                  value={editing.focalY}
                  onChange={(e) => setEditing({ ...editing, focalY: Number(e.target.value) })}
                />
              </label>
            </div>
            <button className="admin-button primary" style={{ marginTop: 18 }}>
              Simpan metadata
            </button>
          </form>
        </section>
      )}
      <section className="admin-panel" style={{ marginTop: 20 }}>
        <div className="admin-panel-header media-library-toolbar">
          <div>
            <h2>Semua media ({filteredItems.length})</h2>
            <small>Media privat tidak pernah ditampilkan di website publik.</small>
          </div>
          <label className="media-search">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Cari media"
              placeholder="Cari foto, folder, atau judul…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter akses media"
            value={access}
            onChange={(event) => setAccess(event.target.value)}
          >
            <option value="ALL">Semua akses</option>
            <option value="PUBLIC">Publik</option>
            <option value="PRIVATE">Privat</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pratinjau</th>
                <th>Nama</th>
                <th>Jenis</th>
                <th>Akses</th>
                <th>Ukuran</th>
                <th>Penggunaan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="media-table-preview">
                      {item.publicUrl && item.kind === "IMAGE" ? (
                        <Image src={item.publicUrl} alt="" fill sizes="72px" />
                      ) : item.visibility === "PRIVATE" ? (
                        <LockKeyhole size={20} aria-label="Media privat" />
                      ) : (
                        <ImageIcon size={20} aria-label="Tanpa pratinjau" />
                      )}
                    </div>
                  </td>
                  <td className="media-name-cell">
                    <strong>{item.title || item.originalName}</strong>
                    {item.title ? <small>{item.originalName}</small> : null}
                  </td>
                  <td>
                    {item.kind === "IMAGE" ? "Foto" : item.kind === "VIDEO" ? "Video" : item.kind}
                  </td>
                  <td>
                    <span className={`status-badge ${item.visibility.toLowerCase()}`}>
                      {item.visibility === "PUBLIC" ? "Publik" : "Privat"}
                    </span>
                  </td>
                  <td>{Math.round(Number(item.sizeBytes) / 1024)} KB</td>
                  <td>{item._count.usages + item._count.galleryItems}</td>
                  <td>
                    <div className="admin-actions">
                      {item.publicUrl && (
                        <a
                          className="admin-button"
                          href={item.publicUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Lihat
                        </a>
                      )}
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => setEditing(item)}
                      >
                        Edit metadata
                      </button>
                      <button className="admin-button danger" onClick={() => remove(item.id)}>
                        Hapus
                      </button>
                    </div>
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
