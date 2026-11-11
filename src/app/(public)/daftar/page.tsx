import { ApplicationForm } from "@/components/forms/application-form";
import { PageHero } from "@/components/public/page-hero";
import { getOpenJobs, getPublishedCountries } from "@/lib/public-data";

export const revalidate = 60;
export const metadata = {
  title: "Pendaftaran CPMI",
  description: "Formulir pendaftaran calon Pekerja Migran Indonesia PT Mutiara Putra Utama."
};

export default async function ApplyPage() {
  const [countries, jobs] = await Promise.all([getPublishedCountries(), getOpenJobs()]);
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
            countries={countries.map((country) => ({
              id: country.id,
              name: country.name,
              slug: country.slug
            }))}
            jobs={jobs.map((job) => ({
              id: job.id,
              title: job.title,
              slug: job.slug,
              countryId: job.countryId
            }))}
          />
        </div>
      </section>
    </>
  );
}
