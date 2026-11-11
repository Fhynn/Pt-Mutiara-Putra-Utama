import { LegalText } from "@/components/public/legal-text";
import { PageHero } from "@/components/public/page-hero";
import { getSettings } from "@/lib/public-data";

export const revalidate = 60;

export const metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan pengelolaan data pribadi pada website PT. Mutiara Putra Utama."
};

const fallbackPolicy = `Data yang dikumpulkan
Formulir pendaftaran CPMI meminta negara tujuan, sektor, nama, NIK, tempat dan tanggal lahir, jenis kelamin, status pernikahan, agama, tinggi dan berat badan, alamat lengkap, kontak, pengalaman kerja, serta satu foto diri. Formulir kontak mengumpulkan data yang Anda isikan di sana.

Tujuan penggunaan
Data digunakan untuk memeriksa pendaftaran, menyesuaikan informasi program dan persyaratan, serta menghubungi Anda mengenai tahapan yang relevan. NIK disimpan terenkripsi dan foto berada di penyimpanan privat. Akses dibatasi kepada petugas berwenang.

Dokumen pribadi
Formulir hanya meminta nomor NIK dan foto diri, bukan unggahan foto KTP, KK, paspor, atau hasil medis. Jangan mengirim dokumen tersebut melalui kolom pesan. Penyerahan dokumen tahap lanjutan dilakukan melalui petugas dan saluran resmi MPU.

Masa simpan
Pendaftaran yang tidak dilanjutkan dan tidak mengalami aktivitas selama 12 bulan akan dihapus data pribadinya, termasuk NIK dan foto. Nomor referensi tanpa identitas dapat tetap disimpan sebagai catatan audit. Pendaftaran yang masih diproses disimpan selama diperlukan untuk tahapan tersebut.

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
