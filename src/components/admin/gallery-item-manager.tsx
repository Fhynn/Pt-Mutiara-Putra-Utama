"use client";
import { useState } from "react";
type Item = {
  id: string;
  mediaId: string;
  caption: string | null;
  displayOrder: number;
  isCover: boolean;
  media: { originalName: string; publicUrl: string | null; kind: string };
};
type Media = { id: string; originalName: string; kind: string };
export function GalleryItemManager({
  albumId,
  initialItems,
  media
}: {
  albumId: string;
  initialItems: Item[];
  media: Media[];
}) {
  const [items, setItems] = useState(initialItems);
  const [mediaId, setMediaId] = useState("");
  const [message, setMessage] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/gallery-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId, mediaId, caption: null, isCover: items.length === 0 })
    });
    const b = await r.json();
    if (!r.ok) return setMessage(b.error);
    location.reload();
  }
  function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((item, displayOrder) => ({ ...item, displayOrder })));
  }
  async function save() {
    const r = await fetch("/api/admin/gallery-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId, items })
    });
    const b = await r.json();
    setMessage(r.ok ? "Urutan dan caption disimpan." : b.error);
  }
  async function remove(id: string) {
    if (!confirm("Keluarkan media dari album?")) return;
    const r = await fetch(`/api/admin/gallery-items?id=${id}`, { method: "DELETE" });
    if (r.ok) setItems(items.filter((item) => item.id !== id));
  }
  return (
    <>
      <section className="admin-panel" style={{ marginBottom: 20 }}>
        <form onSubmit={add}>
          <div className="admin-form-grid">
            <label>
              <span>Pilih media</span>
              <select required value={mediaId} onChange={(e) => setMediaId(e.target.value)}>
                <option value="">Pilih…</option>
                {media.map((asset) => (
                  <option value={asset.id} key={asset.id}>
                    {asset.originalName} ({asset.kind})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="admin-button primary" style={{ marginTop: 18 }}>
            Tambahkan ke album
          </button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Media</th>
                <th>Caption</th>
                <th>Cover</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.media.originalName}</td>
                  <td>
                    <textarea
                      value={item.caption ?? ""}
                      onChange={(e) =>
                        setItems(
                          items.map((row) =>
                            row.id === item.id ? { ...row, caption: e.target.value || null } : row
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={item.isCover}
                      name="cover"
                      onChange={() =>
                        setItems(items.map((row) => ({ ...row, isCover: row.id === item.id })))
                      }
                    />
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-button"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        type="button"
                      >
                        Naik
                      </button>
                      <button
                        className="admin-button"
                        disabled={index === items.length - 1}
                        onClick={() => move(index, 1)}
                        type="button"
                      >
                        Turun
                      </button>
                      <button
                        className="admin-button danger"
                        onClick={() => remove(item.id)}
                        type="button"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 20 }}>
          <button className="admin-button primary" onClick={save}>
            Simpan urutan
          </button>
          {message && <p className="admin-message">{message}</p>}
        </div>
      </section>
    </>
  );
}
