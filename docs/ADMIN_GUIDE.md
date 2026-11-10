# Panduan Admin MPU

## Login dan keamanan akun

1. Buka `/admin/login` dan masuk dengan akun internal.
2. Akun hasil bootstrap wajib mengganti password melalui **Profil Akun**.
3. Jangan berbagi akun. SUPER_ADMIN mengelola pengguna; ADMIN mengelola konten; EDITOR tidak dapat publish; VIEWER hanya membaca.

## Mengelola konten

- **Halaman**: edit section terstruktur. `pageId` menghubungkan section ke halaman; `key` harus unik per halaman. Konten memakai JSON valid. Pilih `DRAFT` untuk review dan `PUBLISHED` setelah disetujui.
- **Profil**: perbarui sejarah, sambutan direktur, visi/misi, bidang pekerjaan, dan rencana pengembangan.
- **Negara/Lowongan**: simpan draft lebih dulu. Jangan masukkan kuota, biaya, upah, atau fasilitas tanpa job order/sumber tertulis. Lowongan lewat deadline otomatis tidak diperlakukan aktif pada publik.
- **Legalitas**: pisahkan jenis dokumen dan nomor izin, isi URL sumber dan tanggal verifikasi, aktifkan `needsReview` bila belum pasti.
- **Testimoni**: hanya publish bila status `APPROVED` dan consent publikasi aktif.
- **Pengaturan**: kontak, alamat, SEO, kebijakan privasi, syarat, pengumuman, dan tautan sosial dikelola di sini.

## Media dan galeri

1. Buka **Media**, pilih beberapa JPG/PNG/WebP/AVIF, PDF, MP4, atau WebM.
2. Pilih `PUBLIC` hanya untuk media website yang sudah berizin; gunakan `PRIVATE` untuk dokumen terbatas.
3. Upload tersedia bila S3/R2/MinIO telah dikonfigurasi. Gambar diubah ke WebP, EXIF tidak diteruskan, dan signature file diperiksa.
4. Embed hanya menerima YouTube/Vimeo. Media yang masih dipakai album/entitas lain tidak dapat dihapus.
5. Buat album pada **Galeri**, lalu publish setelah cover, caption, dan izin seluruh media diperiksa.

## Pendaftar dan pesan

- **Pendaftar**: cari nomor referensi/nama, lalu ubah status menjadi `CONTACTED`, `SCREENING`, `IN_PROCESS`, dan seterusnya. Catatan sensitif jangan ditaruh di konten publik.
- **Pesan**: ubah `UNREAD` menjadi `READ`, `FOLLOW_UP`, `RESOLVED`, `SPAM`, atau `ARCHIVED`.
- Form publik hanya mengumpulkan data awal; jangan meminta KTP/paspor/medis melalui media library publik.

## Operasional dan backup

- Periksa **Aktivitas** untuk perubahan penting, login, publish, dan penghapusan.
- Backup PostgreSQL harian dan aktifkan versioning/lifecycle object storage.
- Uji restore berkala. Sebelum update aplikasi, buat snapshot database dan simpan release sebelumnya untuk rollback.
