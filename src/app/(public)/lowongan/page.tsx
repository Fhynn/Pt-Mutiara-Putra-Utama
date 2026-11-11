import { JobsExplorer } from "@/components/public/jobs-explorer";
import { PageHero } from "@/components/public/page-hero";
import { getOpenJobs, getPublishedCountries } from "@/lib/public-data";

export const revalidate = 60;
export const metadata = {
  title: "Lowongan",
  description:
    "Daftar lowongan luar negeri terverifikasi yang sedang dibuka PT Mutiara Putra Utama."
};

export default async function JobsPage() {
  const [jobs, countries] = await Promise.all([getOpenJobs(), getPublishedCountries()]);
  return (
    <>
      <PageHero
        breadcrumb="Lowongan"
        title="Lowongan yang sedang dibuka"
        description="Hanya lowongan berstatus terbuka dan belum melewati batas pendaftaran yang tampil di halaman ini."
      />
      <section className="section">
        <div className="container">
          <JobsExplorer
            jobs={jobs.map((job) => ({
              id: job.id,
              slug: job.slug,
              title: job.title,
              summary: job.summary,
              countrySlug: job.country.slug,
              countryName: job.country.name,
              deadline: job.deadline?.toISOString() ?? null
            }))}
            countries={countries.map((country) => ({
              slug: country.slug,
              name: country.name
            }))}
          />
        </div>
      </section>
    </>
  );
}
