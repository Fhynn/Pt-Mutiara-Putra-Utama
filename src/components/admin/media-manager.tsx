"use client";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";

type MediaRow = {
  id: string;
  originalName: string;
  kind: string;
  mimeType: string;
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
  const [busyFileId, setBusyFileId] = useState<string | null>(null);
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
    setMessage("");
    try {
      const data = new FormData();
      files.forEach((file) => data.append("files", file));
      data.append("visibility", visibility);
      const r = await fetch("/api/admin/media", { method: "POST", body: data });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error ?? "File gagal diunggah.");
      setMessage(
        visibility === "PUBLIC"
          ? `${files.length} file tersimpan. Pilih file di menu Galeri atau bagian website yang ingin diubah.`
          : `${files.length} file tersimpan hanya untuk admin.`
      );
      setFiles([]);
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "File gagal diunggah.");
    } finally {
      setBusy(false);
    }
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
    if (!confirm("Hapus media ini dari daftar?")) return;
    const r = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
    const b = await r.json();
    setMessage(r.ok ? "Media dihapus." : b.error);
    if (r.ok) await reload();
  }
  async function makePublic(item: MediaRow) {
    if (
      !window.confirm(
        `Jadikan "${item.title || item.originalName}" dapat dibuka publik dan dipakai di website? Pastikan file ini tidak memuat data pribadi dan sudah diizinkan untuk ditampilkan.`
      )
    )
      return;
    setBusyFileId(item.id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "makePublic", id: item.id, confirmed: true })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "File belum bisa dijadikan publik.");
      setMessage(
        "File sekarang dapat dipilih untuk galeri atau bagian website. File belum tampil sampai Anda memilihnya di sana."
      );
      setEditing(null);
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "File belum bisa dijadikan publik.");
    } finally {
      setBusyFileId(null);
    }
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
    setMessage(r.ok ? "Keterangan media disimpan." : b.error);
    if (r.ok) {
      setEditing(null);
      await reload();
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Foto & Video</h1>
          <p>Simpan file di sini, lalu pilih foto atau video yang ingin dipakai di website.</p>
        </div>
      </div>
      <div className="admin-media-explainer">
        <strong>Cara menampilkan foto di website</strong>
        <p>
          <b>1. Unggah file</b> di sini. <b>2. Tambahkan ke album</b> melalui{" "}
          <Link href="/admin/galeri">Galeri</Link>, atau pilih di editor halaman. File baru tidak
          langsung muncul di website.
        </p>
        <p>
          <strong>Hanya untuk admin</strong> khusus berkas internal atau file yang belum boleh
          dilihat pengunjung. Foto kegiatan biasa gunakan akses publik.
        </p>
      </div>
      {!configured && (
        <div className="admin-alert">
          Upload baru belum aktif karena penyimpanan cloud belum dikonfigurasi. Semua media klien
          yang sudah diimpor tetap tersedia di bawah ini.
        </div>
      )}
      <div className="admin-media-tools">
        <section className="admin-panel">
          <h2>Unggah file</h2>
          <form onSubmit={upload}>
            <label>
              <span>Pilih foto, video, atau PDF</span>
              <input
                accept="image/jpeg,image/png,image/webp,image/avif,application/pdf,video/mp4,video/webm"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                type="file"
              />
            </label>
            <details className="admin-media-private-option">
              <summary>Perlu menyimpan file hanya untuk admin?</summary>
              <label>
                <input
                  checked={visibility === "PRIVATE"}
                  onChange={(e) => setVisibility(e.target.checked ? "PRIVATE" : "PUBLIC")}
                  type="checkbox"
                />
                <span>
                  Simpan hanya untuk admin. File ini tidak bisa dipilih di galeri sebelum dijadikan
                  publik.
                </span>
              </label>
            </details>
            <p className="admin-media-upload-note">
              {visibility === "PUBLIC"
                ? "Akses publik: file dapat dipilih untuk website, tetapi belum langsung tampil."
                : "Akses admin: file tidak dapat dilihat pengunjung website."}
            </p>
            <button
              className="admin-button primary"
              disabled={busy || !files.length || !configured}
            >
              {busy ? "Mengunggah…" : `Unggah ${files.length || ""} file`}
            </button>
          </form>
        </section>
        <details className="admin-panel admin-media-embed">
          <summary>Tambahkan video dari YouTube atau Vimeo</summary>
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
            <button className="admin-button primary">Tambahkan video</button>
          </form>
        </details>
      </div>
      {message && (
        <p className="admin-message" role="status">
          {message}
        </p>
      )}
      {editing && (
        <section className="admin-panel" style={{ marginTop: 20 }}>
          <div className="admin-panel-header">
            <h2>Ubah keterangan: {editing.originalName}</h2>
            <button className="admin-button" type="button" onClick={() => setEditing(null)}>
              Tutup
            </button>
          </div>
          <div className="admin-media-current-access">
            <strong>
              {editing.visibility === "PRIVATE" ? "Hanya untuk admin" : "Dapat dipakai di website"}
            </strong>
            {editing.visibility === "PRIVATE" && (
              <button
                className="admin-button primary"
                disabled={busyFileId === editing.id}
                onClick={() => makePublic(editing)}
                type="button"
              >
                {busyFileId === editing.id ? "Mengubah akses..." : "Jadikan publik"}
              </button>
            )}
          </div>
          <form onSubmit={saveMetadata}>
            <div className="admin-form-grid">
              <label>
                <span>Deskripsi foto</span>
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
                <span>Keterangan yang tampil di website</span>
                <textarea
                  value={editing.caption ?? ""}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value || null })}
                />
              </label>
            </div>
            <details className="admin-advanced">
              <summary>Informasi tambahan</summary>
              <p>Isi jika Anda perlu mencatat sumber atau mengatur posisi foto.</p>
              <div className="admin-form-grid">
                <label>
                  <span>Fotografer</span>
                  <input
                    value={editing.photographer ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, photographer: e.target.value || null })
                    }
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
                  <span>Izin penggunaan dari pemilik file</span>
                  <select
                    value={editing.permissionStatus}
                    onChange={(e) => setEditing({ ...editing, permissionStatus: e.target.value })}
                  >
                    <option value="CLIENT_PROVIDED">Sudah diizinkan</option>
                    <option value="NEEDS_CONFIRMATION">Belum diperiksa</option>
                    <option value="PRIVATE_REVIEW_REQUIRED">
                      Jangan ditampilkan sebelum diperiksa
                    </option>
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
            </details>
            <button className="admin-button primary" style={{ marginTop: 18 }}>
              Simpan keterangan
            </button>
          </form>
        </section>
      )}
      <section className="admin-panel" style={{ marginTop: 20 }}>
        <div className="admin-panel-header media-library-toolbar">
          <div>
            <h2>File tersimpan ({filteredItems.length})</h2>
            <small>
              Dapat dipakai belum berarti file sudah tampil. Pilih file di Galeri atau editor
              website.
            </small>
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
            <option value="ALL">Semua file</option>
            <option value="PUBLIC">Dapat dipakai di website</option>
            <option value="PRIVATE">Hanya untuk admin</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-media-table">
            <thead>
              <tr>
                <th>Pratinjau</th>
                <th>Nama</th>
                <th>Jenis</th>
                <th>Akses file</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="media-table-preview">
                      {item.kind === "IMAGE" &&
                      item.mimeType !== "image/heic" &&
                      (item.publicUrl || item.visibility === "PRIVATE") ? (
                        <Image
                          src={item.publicUrl || `/api/admin/media/${item.id}/preview`}
                          alt=""
                          fill
                          sizes="72px"
                          unoptimized={item.visibility === "PRIVATE"}
                        />
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
                    <small>
                      {item._count.usages + item._count.galleryItems > 0
                        ? "Sudah dipakai di website atau galeri"
                        : "Belum dipakai di website"}
                    </small>
                  </td>
                  <td>
                    {item.kind === "IMAGE"
                      ? "Foto"
                      : item.kind === "VIDEO"
                        ? "Video"
                        : item.kind === "PDF"
                          ? "PDF"
                          : "Video tautan"}
                  </td>
                  <td>
                    <span className={`status-badge ${item.visibility.toLowerCase()}`}>
                      {item.visibility === "PUBLIC" ? "Publik" : "Hanya admin"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <a
                        className="admin-button"
                        href={`/api/admin/media/${item.id}/preview`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Lihat file
                      </a>
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => setEditing(item)}
                      >
                        Ubah
                      </button>
                      {item.visibility === "PRIVATE" && (
                        <button
                          className="admin-button primary"
                          disabled={busyFileId === item.id}
                          onClick={() => makePublic(item)}
                          type="button"
                        >
                          {busyFileId === item.id ? "Mengubah akses..." : "Jadikan publik"}
                        </button>
                      )}
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
