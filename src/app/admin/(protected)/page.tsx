import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  const [
    applications,
    newApplications,
    unreadMessages,
    openJobs,
    countries,
    media,
    recentApplications,
    recentMessages,
    recentAudit
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.job.count({
      where: { status: "OPEN", OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }
    }),
    prisma.country.count({ where: { status: "PUBLISHED" } }),
    prisma.mediaAsset.count({ where: { isDeleted: false } }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, referenceNumber: true, fullName: true, status: true, createdAt: true }
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, subject: true, status: true, createdAt: true }
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { actor: { select: { name: true } } }
    })
  ]);
  const stats = [
    ["Total pendaftar", applications],
    ["Pendaftar baru", newApplications],
    ["Pesan belum dibaca", unreadMessages],
    ["Lowongan aktif", openJobs],
    ["Negara terpublikasi", countries],
    ["Total media", media]
  ] as const;
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan data riil dari database.</p>
        </div>
        <div className="admin-actions">
          <Link className="admin-button primary" href="/admin/lowongan">
            Tambah Lowongan
          </Link>
          <Link className="admin-button" href="/admin/media">
            Upload Foto
          </Link>
          <Link className="admin-button" href="/admin/berita">
            Buat Artikel
          </Link>
        </div>
      </div>
      <div className="stat-grid">
        {stats.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-grid-2">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Pendaftar terbaru</h2>
            <Link href="/admin/pendaftar">Lihat semua</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Referensi</th>
                  <th>Nama</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.referenceNumber}
                      <br />
                      <small>{formatDateTime(item.createdAt)}</small>
                    </td>
                    <td>{item.fullName}</td>
                    <td>
                      <span className="status-badge">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Pesan terbaru</h2>
            <Link href="/admin/pesan">Lihat semua</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pengirim</th>
                  <th>Subjek</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                      <br />
                      <small>{formatDateTime(item.createdAt)}</small>
                    </td>
                    <td>{item.subject}</td>
                    <td>
                      <span className="status-badge">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="admin-panel" style={{ marginTop: 20 }}>
        <div className="admin-panel-header">
          <h2>Aktivitas terbaru</h2>
          <Link href="/admin/aktivitas">Riwayat lengkap</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aktor</th>
                <th>Aksi</th>
                <th>Ringkasan</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>{item.actor?.name ?? "Sistem"}</td>
                  <td>{item.action}</td>
                  <td>{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
