# Deployment

## Vercel + PostgreSQL Neon + Neon Object Storage

1. Hubungkan repository Git privat ke Vercel. Gunakan framework Next.js dan build command `npm run build`.
2. Isi `DATABASE_URL` dari branch production Neon dengan TLS. Gunakan `sslmode=verify-full` jika cocok dengan string koneksi Neon. Jalankan `npm run db:migrate`; cek dengan `npx prisma migrate status`. Jalankan `npm run db:seed` hanya jika konten awal belum ada. Tinjau efek seed sebelum mengulanginya di production yang sudah dikelola admin.
3. Siapkan bucket Neon Object Storage `mpu-public` (Public) dan `mpu-private` (Private) pada branch yang sama dengan database. Atur ENV Vercel: `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_PUBLIC=mpu-public`, `S3_BUCKET_PRIVATE=mpu-private`, dan `S3_FORCE_PATH_STYLE=true`. Ambil nilai `AWS_*` dari tombol Connect Neon. `S3_PUBLIC_BASE_URL` opsional karena URL publik dibentuk otomatis saat path-style aktif.
4. Isi `NEXTAUTH_URL` dan `NEXT_PUBLIC_SITE_URL` dengan origin HTTPS domain final, tanpa path atau trailing slash. Isi `NEXTAUTH_SECRET` dan `RATE_LIMIT_SECRET` dengan dua secret acak berbeda, masing-masing minimal 32 byte. Jika `S3_ENDPOINT` atau credential `S3_*` lama juga terisi, hapus karena nilainya diprioritaskan atas `AWS_*`.
5. Akun SUPER_ADMIN yang sudah ada tidak perlu dibootstrap ulang. Pada database baru, jalankan `npm run db:bootstrap-admin` dari lingkungan aman memakai `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, dan `BOOTSTRAP_ADMIN_PASSWORD` sementara; hapus ketiga nilai setelah berhasil.
6. Hubungkan domain HTTPS. Periksa `/api/health`, sitemap, robots, login/logout, ganti password, CRUD negara, upload media publik dan privat, serta formulir kontak dan pendaftaran pada deployment nyata. Pastikan file privat tidak dapat diakses dari URL publik.
7. Periksa UI pada 390/768/1440 px. Atur backup dan uji pemulihan PostgreSQL serta object storage, monitoring, dan catat versi Vercel terakhir untuk rollback. Selesaikan keputusan fakta dan izin media pada `docs/CONTENT_VERIFICATION.md` sebelum publikasi.

Email bersifat opsional. Bila provider belum dikonfigurasi, database tetap menyimpan pendaftaran/pesan dan kolom status notifikasi menunjukkan kondisi tersebut.
