import { ApplicationForm } from "@/components/forms/application-form";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pendaftaran Awal CPMI",
  description: "Formulir minat awal calon Pekerja Migran Indonesia."
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
        title="Pendaftaran Awal Calon Pekerja Migran Indonesia"
        description="Formulir ini mencatat minat awal di website perusahaan. Formulir ini bukan pendaftaran pemerintah dan bukan jaminan diterima atau diberangkatkan."
      />
      <section className="section section-muted">
        <div className="container form-shell">
          <aside>
            <span className="eyebrow">Sebelum Mengisi</span>
            <h2 className="section-title">Pendaftaran awal sebelum verifikasi dokumen</h2>
            <p className="lead">
              Isi data kontak, domisili, dan negara yang diminati. Petugas MPU akan menjelaskan
              tahapan berikutnya setelah memeriksa pendaftaran.
            </p>
            <ul className="check-list">
              <li>
                Kriteria usia, pendidikan, tinggi badan, dan sektor tersedia di halaman negara.
              </li>
              <li>
                KTP, KK, akta kelahiran, ijazah, surat izin keluarga, dan paspor lama disiapkan
                untuk verifikasi tahap lanjutan sesuai negara tujuan.
              </li>
              <li>
                Dokumen pribadi diserahkan melalui petugas dan kanal resmi MPU setelah ada arahan;
                jangan menyalin nomor identitas ke kolom pesan.
              </li>
              <li>
                Simpan nomor referensi internal yang muncul setelah formulir berhasil dikirim.
              </li>
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
