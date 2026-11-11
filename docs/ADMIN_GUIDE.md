# Panduan Singkat Admin MPU

## Masuk

Buka `/admin/login` menggunakan akun staf. Setelah masuk, halaman **Ringkasan** menampilkan jumlah pendaftar baru, pesan belum dibaca, dan lowongan aktif.

## Menangani pendaftar dan pesan

1. Buka **Pendaftar** atau **Pesan Masuk** pada menu utama.
2. Pilih nama di daftar untuk membaca data lengkap di sebelahnya. Pada ponsel, detail muncul di bawah daftar.
3. Gunakan nomor telepon atau email yang tertera untuk menghubungi orang tersebut.
4. Pilih **Status penanganan**, lalu klik **Simpan status**. Data tetap tersimpan di dashboard; website tidak mengirim email otomatis.

NIK dan foto pendaftar hanya dapat dibuka oleh admin yang berwenang. Klik **Lihat NIK** atau **Lihat foto privat** di detail pendaftar bila diperlukan; akses ini tercatat di riwayat. Jika ada permintaan penghapusan data pribadi, buka pendaftar tersebut lalu klik **Hapus data pribadi** dan konfirmasi. Tindakan ini menghapus NIK, biodata, catatan, dan foto; nomor referensi tanpa identitas tetap ada untuk audit. Pendaftaran yang tidak dilanjutkan selama 12 bulan juga dibersihkan otomatis jika tugas harian Vercel telah dikonfigurasi.

Kolom pencarian mencari semua data yang tersimpan, termasuk halaman lama. Gunakan **Berikutnya** untuk melihat data berikutnya. Tombol **Perbarui daftar** menampilkan data terbaru jika ada formulir yang baru dikirim.

Formulir meminta **Pekerjaan yang diminati** setelah negara dan jenis kelamin dipilih. Pada Malaysia, pilihan perempuan dan laki-laki berbeda. Pilihan ini muncul di detail **Pendaftar**, terpisah dari lowongan aktif. Jika daftar pekerjaan negara diubah di **Negara Tujuan**, pilihan formulir ikut berubah setelah halaman publik diperbarui.

## Mengubah isi website

- **Negara Tujuan**: ubah informasi negara, kriteria, dan persyaratan. Buka negara dari daftar, ubah kolom yang diperlukan, lalu simpan.
- **Lowongan**: tambahkan atau ubah lowongan. Pilih status **Draf** sampai informasinya siap ditampilkan.
- **Galeri** dan **Foto & Video**: unggah media, lalu kelola album yang tampil di website. Tombol **Ubah** digunakan untuk judul, deskripsi, dan keterangan foto.
- **Konten lainnya**: buka menu ini jika ingin mengubah isi beranda, profil perusahaan, layanan, berita, FAQ, legalitas, dan bagian lain yang jarang diperbarui.
- **Akun & pengaturan**: ubah kontak website atau password akun. Menu pengguna dan riwayat aktivitas hanya terlihat untuk staf yang berwenang.

Untuk negara dengan syarat berbeda bagi perempuan dan laki-laki, buka **Negara Tujuan → Ubah**, aktifkan **Pisahkan persyaratan perempuan dan laki-laki**, lalu isi pekerjaan dan kriteria pada masing-masing bagian. Kosongkan syarat yang belum dipastikan; website tidak akan membuat angkanya sendiri. Daftar dokumen di bawahnya berlaku untuk kedua bagian. Klik **Simpan perubahan** agar halaman negara diperbarui.

Kolom **Pengaturan lanjutan** biasanya tidak perlu diubah. Alamat halaman dan beberapa pengaturan teknis dibuat otomatis atau sudah diisi dari data website.

Kolom teknis seperti judul untuk mesin pencari dan kode analitik tidak ditampilkan dalam pekerjaan harian admin.

## Foto dan video: arti akses file

Foto kegiatan biasa diunggah dengan akses **Publik**. Artinya file boleh dipilih untuk halaman atau album, tetapi **belum otomatis tampil**. Setelah mengunggah, buka **Galeri** untuk memasukkan foto ke album.

Pilihan **Hanya untuk admin** ada untuk berkas internal atau file yang belum boleh dilihat pengunjung. Pilihan ini berada di bagian tambahan saat upload. File tersebut dapat dibuka oleh staf lewat tombol **Lihat file**, tetapi tidak muncul sebagai pilihan foto galeri. Jika file sudah boleh digunakan, klik **Jadikan publik**, baca konfirmasi, lalu pilih file di Galeri atau editor halaman.
