# QA Report — 5 November 2026

## Pemeriksaan ulang — 10 November 2026

- `npm run lint`, `npm run typecheck`, dan `npm run format:check` lulus.
- Build production lulus pada audit 10 November. Schema Neon memiliki dua migration yang sudah terpasang; satu SUPER_ADMIN aktif. Password akun tersebut direset pada 10 November dan wajib diganti setelah login berikutnya.
- Seluruh suite browser saat dijalankan ulang: 27 lulus, 3 tes admin dilewati karena `QA_ADMIN_EMAIL` dan `QA_ADMIN_PASSWORD` tidak diatur. Tes visual desktop/tablet/mobile lulus (3/3); screenshot tersedia pada `artifacts/screenshots/`.
- `npm audit --omit=dev --audit-level=high`: 0 kerentanan production.
- Koneksi bucket publik dan privat Neon Object Storage, upload privat, serta penyalinan privat ke publik berhasil diperiksa pada 10 November. Deployment Vercel dan domain production belum diverifikasi dari repo lokal.

Catatan: hasil di bawah adalah arsip pemeriksaan awal pada 5 November; bagian batas verifikasi database lokal tidak lagi menggambarkan kondisi Neon yang telah dimigrasikan.

## Penyederhanaan dashboard admin — 10 November 2026

- Formulir pendaftaran dan kontak hanya menyimpan data ke database. Pengiriman email otomatis dan konfigurasi SMTP dihapus.
- Dashboard menampilkan tiga angka utama dan daftar pendaftar/pesan terbaru. Daftar lengkap memiliki pencarian, filter status, detail, dan pembagian halaman 30 data.
- Editor konten menyembunyikan kolom teknis yang tidak diperlukan operator. Media memakai label tindakan yang mudah dipahami.
- Setelah perubahan ini, 9 unit test lulus; lint, format, typecheck, dan build production lulus. Suite browser diulang dengan 4 pekerja: 27 lulus, 3 tes admin dilewati karena kredensial QA tidak disetel. Audit 16 halaman sempat mencapai batas waktu 30 detik saat 14 pekerja berjalan serentak; setelah batas tes disesuaikan, audit desktop/tablet/mobile lulus. Tampilan dashboard desktop dan inbox mobile diperiksa melalui screenshot lokal sebelum penambahan pembagian halaman.

### Kejelasan akses Foto & Video

- Upload biasa memakai akses publik; opsi berkas internal ditempatkan di bagian tambahan dengan penjelasan. File privat dapat dilihat oleh admin dan dijadikan publik melalui tindakan yang meminta konfirmasi.
- Sembilan belas media impor privat disinkronkan ke bucket privat Neon. Verifikasi `HeadObject` dan tautan unduh bertanda tangan berhasil; akses pratinjau anonim ditolak (`403`).
- Alur API privat → publik diuji dengan file sementara: penyalinan bucket, pembaruan database, dan URL publik berhasil. File uji dan baris database dibersihkan; tidak ada media privat klien yang dipublikasikan saat tes.
- Komponen media memiliki tes interaksi baru; 10 tes unit lulus. Tampilan admin media dicek pada desktop dan mobile tanpa overflow horizontal.

## Hasil yang dijalankan

| Pemeriksaan            | Hasil                                         |
| ---------------------- | --------------------------------------------- |
| `npm run lint`         | Lolos, 0 error/warning                        |
| `npm run typecheck`    | Lolos                                         |
| `npm run format:check` | Lolos                                         |
| `npm test`             | 4/4 unit tests lolos                          |
| `npm run test:e2e`     | 12/12 browser tests lolos pada 1440, 768, 390 |
| `npm run build`        | Lolos, seluruh route terkompilasi             |
| `npm run db:validate`  | Schema Prisma valid                           |
| Migration SQL          | Dibuat, 26.600 byte, PostgreSQL               |
| `npm audit`            | 0 vulnerability production maupun development |

Playwright memeriksa homepage, form pendaftaran, redirect admin tanpa session, overflow horizontal, dan menghasilkan screenshot homepage, lowongan, kontak, serta login admin pada desktop/tablet/mobile di `artifacts/screenshots/`.

## Batas verifikasi lingkungan

Docker dan `psql` tidak tersedia di mesin ini, sehingga migration/seed serta alur integration dengan PostgreSQL/MinIO nyata tidak dijalankan. Schema, generated client, migration SQL, build, API typing, dan fallback publik telah diperiksa. Sebelum go-live wajib menjalankan `docker compose up -d`, migration, seed, bootstrap admin, lalu uji login, CRUD, upload, form database, dan health check pada environment yang memiliki layanan tersebut.

Screenshot dashboard terautentikasi dan media upload tidak dibuat karena tidak ada database/admin bootstrap lokal. Screenshot login admin tersedia dan flow redirect tanpa session telah lolos E2E.
