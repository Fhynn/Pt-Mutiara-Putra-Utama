import { LegalText } from "@/components/public/legal-text";
import { PageHero } from "@/components/public/page-hero";
import { getSettings } from "@/lib/public-data";

export const revalidate = 60;

export const metadata = {
  title: "Syarat dan Ketentuan",
  description: "Ketentuan penggunaan website dan pendaftaran CPMI PT. Mutiara Putra Utama."
};

const fallbackTerms = `Pendaftaran melalui website
Pengisian formulir CPMI tidak menjamin diterima, memperoleh visa, ditempatkan, atau diberangkatkan.

Informasi program
Persyaratan negara, gaji, biaya, jadwal, kuota, dan sektor pekerjaan dapat berubah. Kontrak kerja serta dokumen resmi menjadi acuan utama.

Tanggung jawab pengguna
Berikan informasi yang benar dan jangan mengirim dokumen sensitif melalui kolom pesan atau kepada pihak yang tidak terverifikasi.

Lowongan dan pembayaran
Pastikan lowongan berstatus aktif, mintalah rincian biaya tertulis, dan lakukan pembayaran hanya melalui saluran resmi yang telah diverifikasi.`;

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        breadcrumb="Informasi Hukum"
        title="Syarat dan Ketentuan"
        description="Ketentuan penggunaan informasi, formulir, dan layanan digital MPU."
      />
      <section className="section">
        <article className="container prose-card">
          <LegalText content={settings.terms ?? fallbackTerms} />
        </article>
      </section>
    </>
  );
}
