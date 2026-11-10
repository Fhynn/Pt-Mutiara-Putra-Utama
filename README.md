# Website & CMS PT. Mutiara Putra Utama

Aplikasi full-stack Next.js untuk website publik P3MI dan CMS admin MPU. Konten publik bersumber dari materi klien, sementara status program, lowongan, testimoni, dan data yang belum terverifikasi tidak dibuat-buat.

## Menjalankan lokal

Prasyarat: Node.js 22+, npm, Docker Desktop (untuk PostgreSQL dan MinIO).

1. Salin `.env.example` menjadi `.env`, lalu ganti seluruh secret dan password contoh.
2. Jalankan `docker compose up -d`.
3. Jalankan `npm install`.
4. Jalankan `npm run db:migrate` dan `npm run db:seed`.
5. Isi `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, dan `BOOTSTRAP_ADMIN_PASSWORD` sementara, lalu jalankan `npm run db:bootstrap-admin`. Hapus nilai tersebut dari environment setelah akun dibuat.
6. Jalankan `npm run dev`, buka `http://localhost:3000` dan `http://localhost:3000/admin`.

Bootstrap ditolak bila sudah ada SUPER_ADMIN aktif. Password awal minimal 14 karakter dan pengguna diwajibkan menggantinya setelah login.

## Pemeriksaan kualitas

```text
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

E2E memerlukan browser Playwright (`npx playwright install chromium`) dan database lokal yang sudah dimigrasikan/di-seed.

## Storage dan data formulir

Upload memakai S3-compatible storage. MinIO disediakan untuk lokal; produksi menggunakan Neon Object Storage dengan bucket `mpu-public` dan `mpu-private`. Adapter menerima ENV `AWS_*` dari Neon Connect atau nama `S3_*` dalam `.env.example`. Pendaftaran dan pesan kontak langsung tersimpan di database dan dibaca melalui dashboard admin. Website tidak mengirim notifikasi email otomatis.

## Deployment ringkas

- App: Vercel/Node runtime dengan `npm run build` dan output standalone.
- Database: PostgreSQL managed, jalankan `npm run db:migrate` pada proses release.
- Media: Neon Object Storage dengan bucket publik dan privat pada branch production.
- Environment: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `RATE_LIMIT_SECRET`, konfigurasi S3, dan `NEXT_PUBLIC_SITE_URL` wajib diisi.
- TLS/HTTPS wajib; jangan menaruh kredensial bootstrap pada environment setelah penggunaan pertama.

Dokumentasi keputusan dan verifikasi konten tersedia di folder `docs/`.
