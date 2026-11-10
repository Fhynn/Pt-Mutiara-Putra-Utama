import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const privacyPolicy = `Data yang dikumpulkan
Formulir pendaftaran CPMI meminta negara tujuan, sektor, nama, NIK, tempat dan tanggal lahir, jenis kelamin, status pernikahan, agama, tinggi dan berat badan, alamat lengkap, kontak, pengalaman kerja, serta satu foto diri. Formulir kontak mengumpulkan data yang Anda isikan di sana.

Tujuan penggunaan
Data digunakan untuk memeriksa pendaftaran, menyesuaikan informasi program dan persyaratan, serta menghubungi Anda mengenai tahapan yang relevan. NIK disimpan terenkripsi dan foto berada di penyimpanan privat. Akses dibatasi kepada petugas berwenang.

Dokumen pribadi
Formulir hanya meminta nomor NIK dan foto diri, bukan unggahan foto KTP, KK, paspor, atau hasil medis. Jangan mengirim dokumen tersebut melalui kolom pesan. Penyerahan dokumen tahap lanjutan dilakukan melalui petugas dan saluran resmi MPU.

Masa simpan
Pendaftaran yang tidak dilanjutkan dan tidak mengalami aktivitas selama 12 bulan akan dihapus data pribadinya, termasuk NIK dan foto. Nomor referensi tanpa identitas dapat tetap disimpan sebagai catatan audit. Pendaftaran yang masih diproses disimpan selama diperlukan untuk tahapan tersebut.

Akses dan permintaan data
Akses data dibatasi kepada petugas berwenang. Permintaan koreksi atau penghapusan dapat diajukan melalui kontak resmi perusahaan.`;

const terms = `Pendaftaran melalui website
Pengisian formulir CPMI tidak menjamin diterima, memperoleh visa, ditempatkan, atau diberangkatkan.

Informasi program
Persyaratan negara, gaji, biaya, jadwal, kuota, dan sektor pekerjaan dapat berubah. Kontrak kerja serta dokumen resmi menjadi acuan utama.

Tanggung jawab pengguna
Berikan informasi yang benar dan jangan mengirim dokumen sensitif melalui kolom pesan atau kepada pihak yang tidak terverifikasi.

Lowongan dan pembayaran
Pastikan lowongan berstatus aktif, mintalah rincian biaya tertulis, dan lakukan pembayaran hanya melalui saluran resmi yang telah diverifikasi.`;

try {
  const setting = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!setting) throw new Error("Pengaturan website belum ada.");
  if (
    setting.privacyPolicy?.includes("Masa simpan") &&
    setting.terms?.startsWith("Pendaftaran melalui website")
  ) {
    console.log("Kebijakan pendaftaran sudah diperbarui.");
  } else if (
    setting.privacyPolicy?.startsWith("Data yang dikumpulkan\nFormulir pendaftaran awal meminta") &&
    setting.terms?.startsWith("Pendaftaran awal\nPengisian formulir")
  ) {
    await prisma.siteSetting.update({
      where: { id: "default" },
      data: { privacyPolicy, terms }
    });
    await prisma.faq.updateMany({
      where: { question: "Bagaimana cara melakukan pendaftaran awal?" },
      data: {
        question: "Bagaimana cara melakukan pendaftaran online?",
        answer:
          "Isi formulir CPMI di website dengan data diri, pengalaman kerja, dan satu foto. Tim MPU akan memeriksa pendaftaran dan menghubungi Anda untuk informasi tahap berikutnya. Formulir ini bukan jaminan diterima atau diberangkatkan."
      }
    });
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "SiteSetting",
        entityId: "default",
        summary: "Memperbarui kebijakan privasi dan ketentuan formulir CPMI"
      }
    });
    console.log("Kebijakan pendaftaran diperbarui.");
  } else {
    throw new Error("Kebijakan sudah diedit manual. Periksa dan ubah melalui dashboard admin.");
  }
} finally {
  await prisma.$disconnect();
}
