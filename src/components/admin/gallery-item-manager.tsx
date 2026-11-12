"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon, Video } from "lucide-react";
import { useState } from "react";

type Media = {
  id: string;
  originalName: string;
  title: string | null;
  altText: string;
  publicUrl: string | null;
  kind: string;
};

type Item = {
  id: string;
  mediaId: string;
  caption: string | null;
  displayOrder: number;
  isCover: boolean;
  media: Omit<Media, "id">;
};

function MediaPreview({
  media
}: {
  media: Pick<Media, "kind" | "publicUrl" | "altText" | "originalName">;
}) {
  return (
    <div className="admin-album-thumb">
      {media.kind === "IMAGE" && media.publicUrl ? (
        <Image
          src={media.publicUrl}
          alt={media.altText || media.originalName}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 300px"
        />
      ) : media.kind === "VIDEO" && media.publicUrl ? (
        <video src={media.publicUrl} controls preload="metadata" aria-label={media.originalName} />
      ) : media.kind === "EMBED" || media.kind === "VIDEO" ? (
        <Video aria-label="Video" />
      ) : (
        <ImageIcon aria-label="Pratinjau tidak tersedia" />
      )}
    </div>
  );
}

export function GalleryItemManager({
  albumId,
  albumSlug,
  albumStatus,
  albumFeatured,
  initialItems,
  media
}: {
  albumId: string;
  albumSlug: string;
  albumStatus: string;
  albumFeatured: boolean;
  initialItems: Item[];
  media: Media[];
}) {
  const [items, setItems] = useState(initialItems);
  const [mediaOptions, setMediaOptions] = useState(media);
  const [mediaId, setMediaId] = useState("");
  const [message, setMessage] = useState("");
  const [showResultLink, setShowResultLink] = useState(false);
  const [busy, setBusy] = useState(false);
  const selectedMedia = mediaOptions.find((asset) => asset.id === mediaId);
  const isPublished = albumStatus === "PUBLISHED";

  async function uploadDirectly(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    setMessage("");
    setShowResultLink(false);
    try {
      const data = new FormData();
      Array.from(files).forEach((file) => data.append("files", file));
      data.append("visibility", "PUBLIC");
      const uploadResponse = await fetch("/api/admin/media", { method: "POST", body: data });
      const uploadBody = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadBody.error ?? "Foto gagal diunggah.");
      const uploaded = (uploadBody.items ?? []) as Media[];
      setMediaOptions((current) => [...uploaded, ...current]);
      let added = 0;
      let hasCover = items.some((item) => item.isCover);
      for (const asset of uploaded) {
        if (!["IMAGE", "VIDEO"].includes(asset.kind)) continue;
        const isCover = !hasCover && asset.kind === "IMAGE";
        const addResponse = await fetch("/api/admin/gallery-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId,
            mediaId: asset.id,
            caption: null,
            isCover
          })
        });
        const addBody = await addResponse.json();
        if (!addResponse.ok)
          throw new Error(
            `${addBody.error ?? "File belum dapat dimasukkan ke album."} File tetap tersimpan di Foto & Video dan bisa dipilih di bawah.`
          );
        setItems((current) => [...current, addBody.item]);
        if (isCover) hasCover = true;
        added += 1;
      }
      setMessage(`${added} file berhasil ditambahkan ke album.`);
      setShowResultLink(added > 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "File belum dapat ditambahkan.");
    } finally {
      setBusy(false);
    }
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!mediaId || busy) return;
    setBusy(true);
    setMessage("");
    setShowResultLink(false);
    try {
      const response = await fetch("/api/admin/gallery-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          mediaId,
          caption: null,
          isCover: items.length === 0 && selectedMedia?.kind === "IMAGE"
        })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Foto tidak dapat ditambahkan.");
      setItems((current) => [...current, body.item]);
      setMediaId("");
      setMessage("Foto ditambahkan ke album.");
      setShowResultLink(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Foto tidak dapat ditambahkan.");
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((item, displayOrder) => ({ ...item, displayOrder })));
    setMessage("Urutan berubah. Klik Simpan perubahan untuk menampilkannya di website.");
    setShowResultLink(false);
  }

  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/gallery-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          items: items.map(({ id, displayOrder, caption, isCover }) => ({
            id,
            displayOrder,
            caption,
            isCover
          }))
        })
      });
      const body = await response.json();
      setMessage(response.ok ? "Sampul, urutan, dan keterangan foto disimpan." : body.error);
      setShowResultLink(response.ok);
    } catch {
      setMessage("Perubahan belum tersimpan. Coba lagi.");
      setShowResultLink(false);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Keluarkan foto dari album ini? File tetap tersimpan di Foto & Video."))
      return;
    try {
      const response = await fetch(`/api/admin/gallery-items?id=${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Foto belum dapat dikeluarkan.");
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("Foto dikeluarkan dari album. File aslinya tetap tersedia di Foto & Video.");
      setShowResultLink(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Foto belum dapat dikeluarkan.");
      setShowResultLink(false);
    }
  }

  return (
    <>
      <div className="admin-media-explainer admin-album-guide">
        <strong>Di mana foto album ini tampil?</strong>
        {isPublished ? (
          <p>
            Album sudah terbit. Foto yang ditambahkan tampil di{" "}
            <Link href={`/galeri/${albumSlug}`} target="_blank">
              halaman album ini
            </Link>
            , dan album tercantum di <Link href="/galeri">halaman Galeri</Link>.
          </p>
        ) : (
          <p>
            Album belum terlihat oleh pengunjung. Setelah fotonya lengkap, pilih
            <b> Tampilkan di website</b> saat mengubah album di{" "}
            <Link href="/admin/galeri">daftar Galeri</Link>.
          </p>
        )}
        <p>
          {albumFeatured
            ? "Album ini juga dapat tampil di bagian Galeri pada beranda setelah diterbitkan."
            : "Jika ingin album ini tampil di beranda, aktifkan Tampilkan di beranda saat mengubah album."}
        </p>
      </div>

      <section className="admin-panel admin-album-add">
        <div className="admin-panel-header">
          <h2>Tambahkan foto atau video</h2>
        </div>
        <div className="admin-album-upload-direct">
          <label className="admin-button primary admin-simple-media-upload">
            <span>{busy ? "Menambahkan…" : "Unggah langsung ke album"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              multiple
              disabled={busy}
              aria-label="Unggah foto atau video ke album"
              onChange={(event) => {
                void uploadDirectly(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <small>
            Foto pertama otomatis menjadi sampul album. Anda dapat menggantinya di bawah.
          </small>
        </div>
        <details className="admin-album-existing-files">
          <summary>Pilih foto yang sudah diunggah sebelumnya</summary>
          <form onSubmit={add}>
            <label>
              <span>Pilih file yang sudah diunggah</span>
              <select required value={mediaId} onChange={(event) => setMediaId(event.target.value)}>
                <option value="">Pilih foto atau video…</option>
                {mediaOptions.map((asset) => (
                  <option value={asset.id} key={asset.id}>
                    {asset.title || asset.altText || asset.originalName} ({asset.originalName})
                  </option>
                ))}
              </select>
            </label>
            {selectedMedia ? (
              <div className="admin-album-selected">
                <MediaPreview media={selectedMedia} />
                <div>
                  <strong>
                    {selectedMedia.title || selectedMedia.altText || selectedMedia.originalName}
                  </strong>
                  <small>{selectedMedia.originalName}</small>
                </div>
              </div>
            ) : null}
            <button className="admin-button primary" disabled={!mediaId || busy}>
              {busy ? "Menambahkan…" : "Tambahkan ke album"}
            </button>
            {!mediaOptions.length ? <p>Belum ada foto atau video yang tersimpan.</p> : null}
          </form>
        </details>
      </section>

      <section className="admin-panel admin-album-items">
        <div className="admin-panel-header">
          <div>
            <h2>Isi album ({items.length})</h2>
            <p>
              Pilih satu foto sebagai sampul album. Urutan di bawah mengikuti urutan di website.
            </p>
          </div>
        </div>
        {items.length ? (
          <div className="admin-album-grid">
            {items.map((item, index) => (
              <article className="admin-album-card" key={item.id}>
                <div className="admin-album-card-visual">
                  <MediaPreview media={item.media} />
                  {item.isCover ? (
                    <span className="admin-album-cover-badge">Sampul album</span>
                  ) : null}
                </div>
                <div className="admin-album-card-body">
                  <span className="admin-album-order">Urutan {index + 1}</span>
                  <strong>
                    {item.media.title || item.media.altText || item.media.originalName}
                  </strong>
                  <small title={item.media.originalName}>{item.media.originalName}</small>
                  <label>
                    <span>Keterangan foto</span>
                    <textarea
                      value={item.caption ?? ""}
                      onChange={(event) => {
                        setItems(
                          items.map((row) =>
                            row.id === item.id
                              ? { ...row, caption: event.target.value || null }
                              : row
                          )
                        );
                        setMessage("Keterangan berubah. Klik Simpan perubahan.");
                        setShowResultLink(false);
                      }}
                      placeholder="Contoh: Kegiatan pelatihan di kantor cabang"
                    />
                  </label>
                  {item.media.kind === "IMAGE" ? (
                    <label className="admin-album-cover-choice">
                      <input
                        type="radio"
                        checked={item.isCover}
                        name="cover"
                        onChange={() => {
                          setItems(items.map((row) => ({ ...row, isCover: row.id === item.id })));
                          setMessage("Sampul berubah. Klik Simpan perubahan.");
                          setShowResultLink(false);
                        }}
                      />
                      <span>Jadikan sampul album</span>
                    </label>
                  ) : (
                    <small>Sampul album dipilih dari foto.</small>
                  )}
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
                      Keluarkan
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-album-empty">
            Album ini belum berisi foto. Pilih file di atas untuk menambahkannya.
          </p>
        )}
        {items.length ? (
          <div className="admin-album-footer">
            <button className="admin-button primary" disabled={busy} onClick={save}>
              {busy ? "Menyimpan…" : "Simpan perubahan"}
            </button>
            <span>Simpan setelah mengubah sampul, keterangan, atau urutan.</span>
          </div>
        ) : null}
        {message ? (
          <div className="admin-message" role="status">
            {message}
            {showResultLink && isPublished ? (
              <a
                className="admin-button primary"
                href={`/galeri/${albumSlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={15} aria-hidden="true" /> Lihat hasil di website
              </a>
            ) : null}
            {showResultLink && !isPublished ? (
              <small>
                Album belum tampil untuk pengunjung. Terbitkan album setelah fotonya siap.
              </small>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
