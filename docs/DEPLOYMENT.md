# Deployment

## Vercel + PostgreSQL Neon + Neon Object Storage

1. Hubungkan repository Git privat ke Vercel. Gunakan framework Next.js dan build command `npm run build`.
2. Isi `DATABASE_URL` dari branch production Neon dengan TLS. Gunakan `sslmode=verify-full` jika cocok dengan string koneksi Neon. Jalankan `npm run db:migrate`; cek dengan `npx prisma migrate status`. Jalankan `npm run db:seed` hanya jika konten awal belum ada. Tinjau efek seed sebelum mengulanginya di production yang sudah dikelola admin.
3. Siapkan bucket Neon Object Storage `mpu-public` (Public) dan `mpu-private` (Private) pada branch yang sama dengan database. Atur ENV Vercel: `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_PUBLIC=mpu-public`, `S3_BUCKET_PRIVATE=mpu-private`, dan `S3_FORCE_PATH_STYLE=true`. Ambil nilai `AWS_*` dari tombol Connect Neon. `S3_PUBLIC_BASE_URL` opsional karena URL publik dibentuk otomatis saat path-style aktif.
4. Isi `NEXTAUTH_URL` dan `NEXT_PUBLIC_SITE_URL` dengan origin HTTPS domain final, tanpa path atau trailing slash. Isi `NEXTAUTH_SECRET` dan `RATE_LIMIT_SECRET` dengan dua secret acak berbeda, masing-masing minimal 32 byte. Jika `S3_ENDPOINT` atau credential `S3_*` lama juga terisi, hapus karena nilainya diprioritaskan atas `AWS_*`.
   Set `CRON_SECRET` dengan secret acak ketiga minimal 32 karakter. Vercel Cron memanggil `/api/cron/application-retention` setiap hari pukul 02.00 UTC untuk menghapus data pribadi pendaftaran tidak aktif setelah 12 bulan. Tanpa secret ini tugas terjadwal ditolak (401), sementara penghapusan manual di dashboard tetap tersedia.
   NIK dienkripsi dengan kunci turunan dari `NEXTAUTH_SECRET`. Jangan mengganti secret itu setelah ada pendaftar baru tanpa migrasi ulang NIK terenkripsi. Lingkungan yang mengakses database production dan perlu membaca NIK harus memakai secret yang sama.
5. Akun SUPER_ADMIN yang sudah ada tidak perlu dibootstrap ulang. Pada database baru, jalankan `npm run db:bootstrap-admin` dari lingkungan aman memakai `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, dan `BOOTSTRAP_ADMIN_PASSWORD` sementara; hapus ketiga nilai setelah berhasil.
6. Hubungkan domain HTTPS. Periksa `/api/health`, sitemap, robots, login/logout, ganti password, CRUD negara, upload media publik dan privat, serta formulir kontak dan pendaftaran pada deployment nyata. Pastikan file privat tidak dapat diakses dari URL publik.
7. Periksa UI pada 390/768/1440 px. Atur backup dan uji pemulihan PostgreSQL serta object storage, monitoring, dan catat versi Vercel terakhir untuk rollback. Periksa ulang data operasional pada `docs/CONTENT_VERIFICATION.md` sebelum publikasi; izin penggunaan materi klien telah dikonfirmasi oleh pemilik proyek.

## Pendaftaran dan pesan

Pendaftaran dari `/daftar` dan pesan dari `/kontak` tersimpan langsung ke database. Foto pendaftar hanya masuk bucket privat dan tidak muncul di Foto & Video website. Staf membaca dan mengubah statusnya melalui menu **Pendaftar** dan **Pesan Masuk** di dashboard admin. Tidak ada konfigurasi layanan email yang diperlukan. Setelah deploy, kirim satu pendaftaran dan satu pesan uji lalu pastikan keduanya muncul di dashboard; hapus data uji melalui admin.

Kredensial database, Auth.js, dan Neon Object Storage tetap harus diset pada deployment Vercel; nilai yang tersedia di terminal lokal tidak otomatis ikut ke Vercel.
