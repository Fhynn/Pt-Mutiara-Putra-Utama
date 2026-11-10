import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job
    .findFirst({
      where: { slug, status: "OPEN", OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
      select: { title: true, summary: true, country: { select: { name: true } } }
    })
    .catch(() => null);
  if (!job) return { title: "Lowongan tidak tersedia", robots: { index: false, follow: false } };
  const title = `${job.title} di ${job.country.name}`;
  return {
    title,
    description: job.summary,
    alternates: { canonical: `/lowongan/${slug}` },
    openGraph: { title, description: job.summary, type: "website" }
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let job = null;
  try {
    job = await prisma.job.findFirst({
      where: { slug, status: "OPEN", OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
      include: { country: true, sector: true }
    });
  } catch {}
  if (!job) notFound();
  const list = (value: unknown) => (Array.isArray(value) ? value.map(String) : []);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumb items={[{ label: "Lowongan", href: "/lowongan" }, { label: job.title }]} />
          <h1 className="page-title">{job.title}</h1>
          <p>
            {job.country.name} · {job.sector?.name ?? "Sektor belum ditentukan"} · Batas{" "}
            {formatDate(job.deadline)}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container split-grid" style={{ alignItems: "start" }}>
          <article>
            <h2 className="section-title">Tentang lowongan</h2>
            <p className="lead">{job.summary}</p>
            <div dangerouslySetInnerHTML={{ __html: job.description }} />
            <h3>Tanggung jawab</h3>
            <ul>
              {list(job.responsibilities).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Persyaratan</h3>
            <ul>
              {list(job.requirements).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <aside className="content-card">
            <h3>Ringkasan</h3>
            <p>
              Negara: <strong>{job.country.name}</strong>
            </p>
            <p>
              Status: <strong>Terbuka</strong>
            </p>
            <p>
              Jumlah posisi: <strong>{job.positions ?? "Konfirmasi petugas"}</strong>
            </p>
            {job.feeNotes ? (
              <p>Catatan biaya: {job.feeNotes}</p>
            ) : (
              <p className="form-note">
                Rincian biaya belum dipublikasikan. Mintalah informasi tertulis.
              </p>
            )}
            <Link className="button button-primary" href={`/daftar?job=${job.slug}`}>
              Daftar untuk Lowongan Ini
            </Link>
            {job.sourceUrl ? (
              <a
                className="text-link"
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Periksa sumber/job order
              </a>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
