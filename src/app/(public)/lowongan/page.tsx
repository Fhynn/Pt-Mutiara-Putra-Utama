import Link from "next/link";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import { EmptyState } from "@/components/public/empty-state";
import { PageHero } from "@/components/public/page-hero";
import { getOpenJobs, getPublishedCountries } from "@/lib/public-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Lowongan",
  description:
    "Daftar lowongan luar negeri terverifikasi yang sedang dibuka PT Mutiara Putra Utama."
};

export default async function JobsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; country?: string }>;
}) {
  const filters = await searchParams;
  const [jobs, countries] = await Promise.all([
    getOpenJobs({ query: filters.q, country: filters.country }),
    getPublishedCountries()
  ]);
  return (
    <>
      <PageHero
        breadcrumb="Lowongan"
        title="Lowongan yang sedang dibuka"
        description="Hanya lowongan berstatus terbuka dan belum melewati batas pendaftaran yang tampil di halaman ini."
      />
      <section className="section">
        <div className="container">
          <form className="form-card" method="get" style={{ marginBottom: 32 }}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="q">Cari lowongan</label>
                <input
                  id="q"
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Judul atau kata kunci"
                />
              </div>
              <div className="field">
                <label htmlFor="country">Negara</label>
                <select id="country" name="country" defaultValue={filters.country ?? ""}>
                  <option value="">Semua negara</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.slug}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button className="button button-primary" type="submit">
                  Terapkan Filter
                </button>
              </div>
            </div>
          </form>
          {jobs.length ? (
            <div className="content-grid">
              {jobs.map((job) => (
                <article className="content-card" key={job.id}>
                  <BriefcaseBusiness />
                  <h2>{job.title}</h2>
                  <p>
                    <MapPin size={16} /> {job.country.name}
                  </p>
                  <p>{job.summary}</p>
                  <p className="form-note">Batas pendaftaran: {formatDate(job.deadline)}</p>
                  <Link className="button button-secondary" href={`/lowongan/${job.slug}`}>
                    Lihat Detail
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada lowongan aktif"
              description="Kami tidak menampilkan posisi contoh atau lowongan yang belum terverifikasi. Silakan konsultasi untuk informasi program terbaru."
            />
          )}
        </div>
      </section>
    </>
  );
}
