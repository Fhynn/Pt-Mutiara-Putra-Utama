import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, FileText } from "lucide-react";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { prisma } from "@/lib/db";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = await prisma.country
    .findFirst({ where: { slug, status: "PUBLISHED" } })
    .catch(() => null);
  if (!country) return { title: "Negara tidak tersedia", robots: { index: false, follow: false } };
  return {
    title: country.metaTitle ?? `Pilihan pekerjaan di ${country.name}`,
    description: country.metaDescription ?? country.summary,
    alternates: { canonical: `/negara-tujuan/${slug}` }
  };
}

export default async function CountryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = await prisma.country
    .findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        occupations: { where: { status: "PUBLISHED" }, orderBy: { displayOrder: "asc" } },
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

  return (
    <>
      <section className="page-hero country-page-hero">
        <div className={`container ${cover?.publicUrl ? "country-hero-layout" : ""}`}>
          <div>
            <Breadcrumb
              items={[{ label: "Negara Tujuan", href: "/negara-tujuan" }, { label: country.name }]}
            />
            <span className="eyebrow">Negara Tujuan · Pilihan Pekerjaan</span>
            <h1 className="page-title">Pekerjaan di {country.name}</h1>
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

      <section className="section country-occupation-section">
        <div className="container">
          <div className="country-occupation-intro">
            <div>
              <span className="eyebrow">Pilih pekerjaan</span>
              <h2 className="section-title">Lihat syarat sesuai pekerjaan</h2>
              <p className="lead">
                Setiap pekerjaan memiliki batas usia dan gaji pokok yang berbeda. Pilih salah satu
                untuk membaca rinciannya sebelum mendaftar.
              </p>
            </div>
            <span className="country-occupation-count">
              {country.occupations.length} pilihan pekerjaan
            </span>
          </div>
          {country.occupations.length ? (
            <div className="country-occupation-grid">
              {country.occupations.map((occupation) => (
                <article className="country-occupation-card" key={occupation.id}>
                  <div className="country-occupation-card-top">
                    <BriefcaseBusiness aria-hidden="true" />
                    <span className="country-occupation-gender">
                      {occupation.gender === "PEREMPUAN"
                        ? "Perempuan"
                        : occupation.gender === "LAKI_LAKI"
                          ? "Laki-laki"
                          : "Jenis kelamin belum dicantumkan"}
                    </span>
                  </div>
                  <h3>{occupation.title}</h3>
                  <dl>
                    <div>
                      <dt>Usia</dt>
                      <dd>
                        {occupation.ageMin != null && occupation.ageMax != null
                          ? `${occupation.ageMin}–${occupation.ageMax} tahun`
                          : "Tanyakan kepada petugas"}
                      </dd>
                    </div>
                    <div>
                      <dt>Gaji pokok</dt>
                      <dd>{occupation.salaryLabel ?? "Belum dicantumkan"}</dd>
                    </div>
                  </dl>
                  <Link
                    className="country-occupation-link"
                    href={`/negara-tujuan/${country.slug}/pekerjaan/${occupation.slug}`}
                  >
                    Lihat syarat dan daftar <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="country-occupation-empty">
              <BriefcaseBusiness aria-hidden="true" />
              <h3>Rincian pekerjaan belum diterbitkan</h3>
              <p>Hubungi petugas MPU untuk menanyakan pekerjaan di {country.name}.</p>
              <Link className="button button-primary" href="/kontak">
                Hubungi Kami
              </Link>
            </div>
          )}
          <div className="country-occupation-document-note">
            <FileText aria-hidden="true" />
            <p>Daftar dokumen yang perlu disiapkan ada pada halaman rincian setiap pekerjaan.</p>
          </div>
          {country.jobs.length ? (
            <div className="country-active-vacancies">
              <h2>Lowongan yang sedang dibuka</h2>
              <div className="country-active-vacancy-list">
                {country.jobs.map((job) => (
                  <Link key={job.id} href={`/lowongan/${job.slug}`}>
                    {job.title}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
