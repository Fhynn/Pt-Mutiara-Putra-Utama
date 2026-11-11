import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, BriefcaseBusiness, FileText, UsersRound } from "lucide-react";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { CompactList } from "@/components/public/compact-list";
import { EmptyState } from "@/components/public/empty-state";
import { prisma } from "@/lib/db";
import { readCountryGenderCriteria } from "@/lib/country-gender-criteria";

export const revalidate = 60;

export async function generateStaticParams() {
  const countries = await prisma.country
    .findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true }
    })
    .catch(() => []);
  return countries.map(({ slug }) => ({ slug }));
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const country = await prisma.country.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (!country)
      return { title: "Negara tidak tersedia", robots: { index: false, follow: false } };
    return {
      title: country.metaTitle ?? `Kriteria dan persyaratan kerja ke ${country.name}`,
      description: country.metaDescription ?? country.summary,
      alternates: { canonical: `/negara-tujuan/${slug}` }
    };
  } catch {
    return { title: "Negara Tujuan" };
  }
}

export default async function CountryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = await prisma.country
    .findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        jobs: {
          where: { status: "OPEN", OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }
        }
      }
    })
    .catch(() => null);
  if (!country) notFound();

  const cover = country.coverMediaId
    ? await prisma.mediaAsset
        .findFirst({
          where: {
            id: country.coverMediaId,
            kind: "IMAGE",
            visibility: "PUBLIC",
            isDeleted: false,
            publicUrl: { not: null }
          },
          select: { publicUrl: true, altText: true }
        })
        .catch(() => null)
    : null;

  const criteria = stringList(country.criteria);
  const genderCriteria = readCountryGenderCriteria(country.genderCriteria);
  const documents = stringList(country.requirements);
  const salaryDetails = stringList(country.salaryDetails);
  const hasOpenJobs = country.jobs.length > 0;
  const jobStatusLabel = hasOpenJobs
    ? `${country.jobs.length} lowongan sedang dibuka`
    : country.programStatus === "NOT_OPEN"
      ? "Program belum dibuka"
      : "Belum ada lowongan diumumkan";

  return (
    <>
      <section className="page-hero country-page-hero">
        <div className={`container ${cover?.publicUrl ? "country-hero-layout" : ""}`}>
          <div>
            <Breadcrumb
              items={[{ label: "Negara Tujuan", href: "/negara-tujuan" }, { label: country.name }]}
            />
            <span className="eyebrow">Negara Tujuan · Informasi Persyaratan</span>
            <h1 className="page-title">Kriteria &amp; Persyaratan Kerja ke {country.name}</h1>
            <p>{country.summary}</p>
          </div>
          {cover?.publicUrl ? (
            <div className="country-hero-photo">
              <Image
                src={cover.publicUrl}
                alt={cover.altText || `Foto negara ${country.name}`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 480px"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="section country-requirements-section">
        <div className="container">
          <div className="country-program-intro">
            <div>
              <span className="eyebrow">Panduan Calon Pekerja</span>
              <h2 className="section-title">Persyaratan kerja ke {country.name}</h2>
              <p className="lead">
                {country.programDescription ??
                  `Persyaratan rinci untuk ${country.name} belum dipublikasikan. Hubungi petugas MPU untuk informasi terbaru.`}
              </p>
            </div>
            <div className="country-program-action">
              <span className="status-pill">{jobStatusLabel}</span>
              <Link className="button button-primary" href={`/daftar?country=${country.slug}`}>
                Daftar sebagai calon CPMI
              </Link>
              <p className="country-registration-note">
                Formulir ini untuk pendataan calon pekerja, bukan lamaran pada lowongan tertentu.
              </p>
            </div>
          </div>

          <div className={`country-requirements-grid${genderCriteria ? " has-gender-split" : ""}`}>
            {genderCriteria ? (
              (["women", "men"] as const).map((gender) => {
                const label = gender === "women" ? "perempuan" : "laki-laki";
                const group = genderCriteria[gender];
                return (
                  <article className="requirement-panel gender-requirement-panel" key={gender}>
                    <div className="requirement-panel-heading">
                      <span className="requirement-icon">
                        <UsersRound aria-hidden="true" />
                      </span>
                      <div>
                        <span>Calon pekerja {label}</span>
                        <h2>Kriteria {label}</h2>
                      </div>
                    </div>
                    {group.jobs.length ? (
                      <div className="gender-job-block">
                        <strong>Bidang pekerjaan</strong>
                        <ul>
                          {group.jobs.map((job) => (
                            <li key={job}>{job}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {group.criteria.length ? (
                      <CompactList items={group.criteria} label={`kriteria ${label}`} />
                    ) : (
                      <p className="country-empty-copy">
                        Rincian kriteria untuk {label} belum diberikan MPU.
                      </p>
                    )}
                  </article>
                );
              })
            ) : (
              <article className="requirement-panel">
                <div className="requirement-panel-heading">
                  <span className="requirement-icon">
                    <span aria-hidden="true">✓</span>
                  </span>
                  <div>
                    <span>Calon pekerja</span>
                    <h2>Kriteria</h2>
                  </div>
                </div>
                {criteria.length ? (
                  <CompactList items={criteria} label="kriteria" />
                ) : (
                  <p className="country-empty-copy">
                    Kriteria belum dipublikasikan. Hubungi petugas MPU sebelum mendaftar.
                  </p>
                )}
              </article>
            )}

            <article className="requirement-panel document-requirement-panel">
              <div className="requirement-panel-heading">
                <span className="requirement-icon">
                  <FileText aria-hidden="true" />
                </span>
                <div>
                  <span>{genderCriteria ? "Untuk kedua jalur" : "Tahap lanjutan"}</span>
                  <h2>Dokumen yang perlu disiapkan</h2>
                </div>
              </div>
              {documents.length ? (
                <CompactList items={documents} label="dokumen" />
              ) : (
                <p className="country-empty-copy">
                  Daftar dokumen belum dipublikasikan. Mintalah daftar tertulis dari petugas MPU.
                </p>
              )}
              <p className="document-safety-note">
                Siapkan dokumen untuk verifikasi tahap lanjutan. Penyerahan dilakukan melalui
                petugas dan kanal resmi MPU—bukan melalui kolom pesan pada formulir pendaftaran
                awal.
              </p>
            </article>
          </div>

          <div className="country-detail-grid">
            <article className="country-detail-card country-salary-card">
              <Banknote aria-hidden="true" />
              <div>
                <h2>Gaji</h2>
                {salaryDetails.length ? (
                  <>
                    <ul>
                      {salaryDetails.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="country-salary-note">
                      Nominal ini bukan penawaran lowongan. Rincian gaji akhir tercantum pada
                      kontrak kerja.
                    </p>
                  </>
                ) : (
                  <p>Rincian gaji belum dipublikasikan.</p>
                )}
              </div>
            </article>

            <article className="country-detail-card">
              <BriefcaseBusiness aria-hidden="true" />
              <div>
                <span className="detail-kicker">Jenis pekerjaan</span>
                <h2>Keterangan sektor</h2>
                <dl className="sector-definition-list">
                  <div>
                    <dt>Informal</dt>
                    <dd>{country.informalSectorInfo ?? "Informasi belum dipublikasikan."}</dd>
                  </div>
                  <div>
                    <dt>Formal</dt>
                    <dd>{country.formalSectorInfo ?? "Informasi belum dipublikasikan."}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>

          <div className="country-jobs-section">
            <div className="country-jobs-heading">
              <span className="eyebrow">Lowongan Kerja</span>
              <h2 className="section-title">Lowongan yang dibuka di {country.name}</h2>
            </div>
            {country.jobs.length ? (
              <div className="content-grid">
                {country.jobs.map((job) => (
                  <article className="content-card" key={job.id}>
                    <h3>{job.title}</h3>
                    <p>{job.summary}</p>
                    <Link className="text-link" href={`/lowongan/${job.slug}`}>
                      Lihat rincian lowongan
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title={`Belum ada lowongan ${country.name} yang diumumkan`}
                description="Persyaratan di atas dapat Anda baca sebagai panduan. Pendaftaran calon CPMI tetap bisa dilakukan untuk pemeriksaan data awal."
                href="/lowongan"
                label="Lihat semua lowongan"
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
