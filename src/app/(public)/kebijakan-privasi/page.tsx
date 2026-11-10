import { LegalText } from "@/components/public/legal-text";
import { PageHero } from "@/components/public/page-hero";
import { getSettings } from "@/lib/public-data";

export const metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan pengelolaan data pribadi pada website PT. Mutiara Putra Utama."
};

const fallbackPolicy = `Data yang dikumpulkan
Formulir pendaftaran awal meminta nama, nomor telepon atau WhatsApp, domisili, negara yang diminati, serta informasi tambahan yang Anda pilih untuk diberikan.

Tujuan penggunaan
Data digunakan untuk menanggapi konsultasi, memeriksa minat awal, dan menghubungi Anda mengenai tahapan yang relevan.

Dokumen pribadi
Jangan mengirim KTP, KK, paspor, hasil medis, atau dokumen sensitif melalui kolom pesan. Penyerahan dokumen tahap lanjutan dilakukan melalui petugas dan saluran resmi MPU.

Akses dan permintaan data
Akses data dibatasi kepada petugas berwenang. Permintaan koreksi atau penghapusan dapat diajukan melalui kontak resmi perusahaan.`;

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        breadcrumb="Informasi Hukum"
        title="Kebijakan Privasi"
        description="Penjelasan mengenai data yang dikumpulkan melalui website dan cara kami menjaganya."
      />
      <section className="section">
        <article className="container prose-card">
          <LegalText content={settings.privacyPolicy ?? fallbackPolicy} />
        </article>
      </section>
    </>
  );
}
