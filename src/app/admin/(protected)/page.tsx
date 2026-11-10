import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { applicationStatusLabels, messageStatusLabels } from "@/lib/admin-labels";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  const [newApplications, unreadMessages, openJobs, recentApplications, recentMessages] =
    await Promise.all([
      prisma.application.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.job.count({
        where: { status: "OPEN", OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }
      }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, referenceNumber: true, fullName: true, status: true, createdAt: true }
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, subject: true, status: true, createdAt: true }
      })
    ]);
  const stats = [
    ["Pendaftar baru", newApplications, "/admin/pendaftar?status=NEW", "Lihat pendaftar"],
    ["Pesan belum dibaca", unreadMessages, "/admin/pesan?status=UNREAD", "Baca pesan"],
    ["Lowongan aktif", openJobs, "/admin/lowongan", "Lihat lowongan"]
  ] as const;
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Ringkasan</h1>
          <p>Pantau pendaftaran dan pesan yang perlu ditangani.</p>
        </div>
      </div>
      <div className="stat-grid admin-stat-grid">
        {stats.map(([label, value, href, action]) => (
          <Link className="stat-card" href={href} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{action} →</small>
          </Link>
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
                  <th>Nama</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.fullName}</strong>
                      <br />
                      <small>
                        {item.referenceNumber} · {formatDateTime(item.createdAt)}
                      </small>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {applicationStatusLabels[item.status]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/pendaftar?id=${item.id}`}>Buka</Link>
                    </td>
                  </tr>
                ))}
                {!recentApplications.length && (
                  <tr>
                    <td colSpan={3}>Belum ada pendaftar.</td>
                  </tr>
                )}
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
                  <th></th>
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
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {messageStatusLabels[item.status]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/pesan?id=${item.id}`}>Buka</Link>
                    </td>
                  </tr>
                ))}
                {!recentMessages.length && (
                  <tr>
                    <td colSpan={4}>Belum ada pesan masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
