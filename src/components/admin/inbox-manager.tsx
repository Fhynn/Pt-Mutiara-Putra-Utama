"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applicationStatusLabels, messageStatusLabels } from "@/lib/admin-labels";

export type InboxItem = {
  id: string;
  name: string;
  createdAt: string;
  status: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  referenceNumber?: string;
  subject?: string;
  domicile?: string;
  country?: string;
  job?: string;
  workExperience?: string;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export function InboxManager({
  kind,
  initialItems,
  initialSelectedId,
  canEdit,
  initialQuery = "",
  initialFilter = "ALL",
  page = 1,
  pageSize = 30,
  total = initialItems.length
}: {
  kind: "pendaftar" | "pesan";
  initialItems: InboxItem[];
  initialSelectedId?: string;
  canEdit: boolean;
  initialQuery?: string;
  initialFilter?: string;
  page?: number;
  pageSize?: number;
  total?: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? initialItems[0]?.id ?? "");
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const labels = kind === "pendaftar" ? applicationStatusLabels : messageStatusLabels;
  const selected = items.find((item) => item.id === selectedId);
  const pendingStatus = status || selected?.status || "";
  function listUrl(nextPage: number, nextQuery = initialQuery, nextFilter = initialFilter) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextFilter !== "ALL") params.set("status", nextFilter);
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/admin/${kind}${params.size ? `?${params}` : ""}`;
  }

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(listUrl(1, query, filter));
  }

  async function saveStatus() {
    if (!selected || !pendingStatus || pendingStatus === selected.status) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, data: { status: pendingStatus } })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Status tidak dapat disimpan.");
      setItems((current) =>
        current.map((item) => (item.id === selected.id ? { ...item, status: pendingStatus } : item))
      );
      setStatus("");
      setMessage("Status berhasil disimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status tidak dapat disimpan.");
    } finally {
      setBusy(false);
    }
  }

  const isApplication = kind === "pendaftar";
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>{isApplication ? "Pendaftar" : "Pesan Masuk"}</h1>
          <p>
            {isApplication
              ? "Lihat data pendaftaran dan catat tahap penanganannya."
              : "Baca pesan dari pengunjung dan tandai tindak lanjutnya."}
          </p>
        </div>
        <button className="admin-button" type="button" onClick={() => window.location.reload()}>
          Perbarui daftar
        </button>
      </div>
      <form className="admin-inbox-toolbar" onSubmit={search}>
        <label>
          <span>Cari {isApplication ? "nama atau nomor pendaftaran" : "nama atau subjek"}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          <span>Tampilkan</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="ALL">Semua status</option>
            {Object.entries(labels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="admin-button primary" type="submit">
          Cari
        </button>
        <strong>{total} data</strong>
      </form>
      <div className="admin-inbox-layout">
        <section className="admin-panel admin-inbox-list" aria-label="Daftar masuk">
          {items.length ? (
            items.map((item) => (
              <button
                className={
                  item.id === selectedId ? "admin-inbox-item selected" : "admin-inbox-item"
                }
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setStatus("");
                  setMessage("");
                }}
                type="button"
              >
                <span className="admin-inbox-item-head">
                  <strong>{item.name}</strong>
                  <span className={`status-badge ${item.status.toLowerCase()}`}>
                    {labels[item.status] ?? item.status}
                  </span>
                </span>
                <span>{item.referenceNumber ?? item.subject}</span>
                <small>{dateLabel(item.createdAt)}</small>
              </button>
            ))
          ) : (
            <p className="admin-inbox-empty">
              {total
                ? "Tidak ada data pada halaman ini."
                : initialQuery || initialFilter !== "ALL"
                  ? "Tidak ada data yang cocok."
                  : "Belum ada data masuk."}
            </p>
          )}
        </section>
        <section className="admin-panel admin-inbox-detail" aria-label="Detail data masuk">
          {selected ? (
            <>
              <div className="admin-inbox-detail-head">
                <div>
                  <span className="admin-inbox-eyebrow">
                    {isApplication ? selected.referenceNumber : selected.subject}
                  </span>
                  <h2>{selected.name}</h2>
                  <p>Diterima {dateLabel(selected.createdAt)}</p>
                </div>
                <span className={`status-badge ${selected.status.toLowerCase()}`}>
                  {labels[selected.status] ?? selected.status}
                </span>
              </div>
              <div className="admin-inbox-details">
                {selected.phone && (
                  <div>
                    <span>Telepon / WhatsApp</span>
                    <a href={`tel:${selected.phone.replace(/[^+0-9]/g, "")}`}>{selected.phone}</a>
                  </div>
                )}
                {selected.email && (
                  <div>
                    <span>Email</span>
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  </div>
                )}
                {selected.domicile && (
                  <div>
                    <span>Domisili</span>
                    <strong>{selected.domicile}</strong>
                  </div>
                )}
                {selected.country && (
                  <div>
                    <span>Negara diminati</span>
                    <strong>{selected.country}</strong>
                  </div>
                )}
                {selected.job && (
                  <div>
                    <span>Lowongan diminati</span>
                    <strong>{selected.job}</strong>
                  </div>
                )}
                {selected.workExperience && (
                  <div className="wide">
                    <span>Pengalaman kerja</span>
                    <p>{selected.workExperience}</p>
                  </div>
                )}
                {selected.message && (
                  <div className="wide">
                    <span>{isApplication ? "Pesan tambahan" : "Isi pesan"}</span>
                    <p>{selected.message}</p>
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="admin-inbox-status-form">
                  <label>
                    <span>Status penanganan</span>
                    <select
                      value={pendingStatus}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      {Object.entries(labels).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="admin-button primary"
                    disabled={busy || pendingStatus === selected.status}
                    onClick={saveStatus}
                    type="button"
                  >
                    {busy ? "Menyimpan…" : "Simpan status"}
                  </button>
                </div>
              )}
              {message && (
                <p className="admin-message" role="status">
                  {message}
                </p>
              )}
            </>
          ) : (
            <p className="admin-inbox-empty">Pilih data di daftar untuk melihat detailnya.</p>
          )}
        </section>
      </div>
      {total > pageSize && (
        <nav className="admin-inbox-pagination" aria-label="Halaman daftar masuk">
          {page > 1 ? (
            <Link className="admin-button" href={listUrl(page - 1)}>
              Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span>
            Halaman {page} dari {Math.ceil(total / pageSize)}
          </span>
          {page * pageSize < total ? (
            <Link className="admin-button" href={listUrl(page + 1)}>
              Berikutnya
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
