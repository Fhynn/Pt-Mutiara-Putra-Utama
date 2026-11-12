import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Banknote, BriefcaseBusiness, FileText } from "lucide-react";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { prisma } from "@/lib/db";

export const revalidate = 60;

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}

export async function generateStaticParams() {
  const occupations = await prisma.countryOccupation
    .findMany({
      where: { status: "PUBLISHED", country: { status: "PUBLISHED" } },
      select: { slug: true, country: { select: { slug: true } } }
    })
    .catch(() => []);
  return occupations.map((item) => ({ slug: item.country.slug, occupation: item.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; occupation: string }>;
}) {
  const { slug, occupation } = await params;
  const item = await prisma.countryOccupation
    .findFirst({
      where: { slug: occupation, status: "PUBLISHED", country: { slug, status: "PUBLISHED" } },
      include: { country: { select: { name: true } } }
    })
    .catch(() => null);
  if (!item) return { title: "Pekerjaan tidak tersedia", robots: { index: false, follow: false } };
  return {
    title: `${item.title} di ${item.country.name} — Syarat dan Gaji`,
    description: `Persyaratan ${item.title} di ${item.country.name}: usia, pengalaman, dokumen, dan informasi gaji pokok.`,
    alternates: { canonical: `/negara-tujuan/${slug}/pekerjaan/${occupation}` }
  };
}

export default async function OccupationDetail({
  params
}: {
  params: Promise<{ slug: string; occupation: string }>;
}) {
  const { slug, occupation } = await params;
  const item = await prisma.countryOccupation
    .findFirst({
      where: { slug: occupation, status: "PUBLISHED", country: { slug, status: "PUBLISHED" } },
      include: { country: true }
    })
    .catch(() => null);
  if (!item) notFound();

  const criteria = [
    item.gender === "PEREMPUAN"
      ? "Untuk calon pekerja perempuan"
      : item.gender === "LAKI_LAKI"
        ? "Untuk calon pekerja laki-laki"
        : null,
    item.ageMin != null && item.ageMax != null ? `Usia ${item.ageMin}–${item.ageMax} tahun` : null,
    item.experienceRequirement,
    item.healthRequirement,
    ...stringList(item.additionalCriteria)
  ].filter((value): value is string => Boolean(value));
  const documents = stringList(item.country.requirements);

  return (
    <>
      <section className="page-hero occupation-page-hero">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Negara Tujuan", href: "/negara-tujuan" },
              { label: item.country.name, href: `/negara-tujuan/${slug}` },
              { label: item.title }
            ]}
          />
          <span className="eyebrow">{item.country.name} · Informasi Pekerjaan</span>
          <h1 className="page-title">{item.title}</h1>
          <p>
            Baca persyaratan pekerjaan dan siapkan dokumen yang berlaku sebelum mengisi formulir
            pendaftaran.
          </p>
        </div>
      </section>

      <section className="section occupation-detail-section">
        <div className="container occupation-detail-layout">
          <div className="occupation-detail-main">
            <article className="occupation-detail-panel">
              <div className="occupation-panel-heading">
                <BriefcaseBusiness aria-hidden="true" />
                <div>
                  <span>Persyaratan pekerjaan</span>
                  <h2>Kriteria {item.title}</h2>
                </div>
              </div>
              {criteria.length ? (
                <ul className="occupation-requirement-list">
                  {criteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
              ) : (
                <p>Rincian kriteria belum diterbitkan.</p>
              )}
            </article>
            <article className="occupation-detail-panel">
              <div className="occupation-panel-heading">
                <FileText aria-hidden="true" />
                <div>
                  <span>Berlaku untuk seluruh pekerjaan</span>
                  <h2>Dokumen yang perlu disiapkan</h2>
                </div>
              </div>
              {documents.length ? (
                <ol className="occupation-document-list">
                  {documents.map((document) => (
                    <li key={document}>{document}</li>
                  ))}
                </ol>
              ) : (
                <p>Daftar dokumen belum diterbitkan. Tanyakan kepada petugas MPU.</p>
              )}
              <p className="occupation-document-help">
                Dokumen disiapkan untuk tahapan verifikasi. Formulir online hanya meminta data diri
                dan foto.
              </p>
            </article>
          </div>
          <aside className="occupation-detail-aside">
            <div className="occupation-salary-box">
              <Banknote aria-hidden="true" />
              <span>Gaji pokok</span>
              <strong>{item.salaryLabel ?? "Belum dicantumkan"}</strong>
              {item.salaryLabel ? (
                <p>
                  Tunjangan, lembur, dan potongan gaji belum dicantumkan. Konfirmasi rincian kepada
                  petugas sebelum mendaftar.
                </p>
              ) : (
                <p>Konfirmasi nominal gaji kepada petugas sebelum melanjutkan.</p>
              )}
            </div>
            <div className="occupation-register-box">
              <h2>Memenuhi persyaratan?</h2>
              <p>
                Negara dan pekerjaan ini akan terisi pada formulir. Anda tetap bisa mengubahnya
                sebelum mengirim.
              </p>
              <Link
                className="button button-primary"
                href={`/daftar?country=${slug}&occupation=${occupation}`}
              >
                Daftar untuk pekerjaan ini <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="text-link" href={`/negara-tujuan/${slug}`}>
                Lihat pekerjaan lain di {item.country.name}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
