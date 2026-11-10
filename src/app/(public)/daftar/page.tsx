import { ApplicationForm } from "@/components/forms/application-form";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pendaftaran CPMI",
  description: "Formulir pendaftaran calon Pekerja Migran Indonesia PT Mutiara Putra Utama."
};

export default async function ApplyPage({
  searchParams
}: {
  searchParams: Promise<{ country?: string; job?: string }>;
}) {
  const query = await searchParams;
  let countries: Array<{ id: string; name: string; slug: string }> = [];
  let jobs: Array<{ id: string; title: string; slug: string; countryId: string }> = [];
  try {
    [countries, jobs] = await Promise.all([
      prisma.country.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, name: true, slug: true },
        orderBy: { displayOrder: "asc" }
      }),
      prisma.job.findMany({
        where: { status: "OPEN", OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
        select: { id: true, title: true, slug: true, countryId: true },
        orderBy: { publishedAt: "desc" }
      })
    ]);
  } catch {}
  const defaultCountryId =
    countries.find((country) => country.slug === query.country)?.id ??
    jobs.find((job) => job.slug === query.job)?.countryId ??
    "";
  const defaultJobId = jobs.find((job) => job.slug === query.job)?.id ?? "";
  return (
    <>
      <PageHero
        breadcrumb="Daftar"
        title="Pendaftaran Calon Pekerja Migran Indonesia"
        description="Isi formulir pendaftaran PT Mutiara Putra Utama. Data Anda diperiksa petugas sebelum tahapan berikutnya."
      />
      <section className="section section-muted">
        <div className="container form-shell">
          <aside>
            <span className="eyebrow">Sebelum Mengisi</span>
            <h2 className="section-title">Siapkan data diri dan foto</h2>
            <p className="lead">
              Siapkan NIK, alamat lengkap, riwayat pekerjaan, dan satu foto diri berukuran maksimal
              2 MB. Periksa kembali semua data sebelum dikirim.
            </p>
            <ul className="check-list">
              <li>Persyaratan setiap negara dapat dibaca di halaman negara tujuan.</li>
              <li>
                NIK dan foto disimpan secara privat untuk pemeriksaan pendaftaran oleh petugas MPU.
              </li>
              <li>
                Jangan mengirim foto KTP, paspor, atau dokumen lain melalui formulir ini. Dokumen
                lanjutan diserahkan setelah ada arahan petugas melalui saluran resmi.
              </li>
              <li>
                Simpan nomor referensi internal yang muncul setelah formulir berhasil dikirim.
              </li>
              <li>Pengisian formulir tidak menjamin diterima atau diberangkatkan.</li>
            </ul>
          </aside>
          <ApplicationForm
            countries={countries}
            jobs={jobs}
            defaultCountryId={defaultCountryId}
            defaultJobId={defaultJobId}
          />
        </div>
      </section>
    </>
  );
}
