# QA Report — 5 November 2026

## Formulir CPMI lengkap — 11 November 2026

- Migration `202611110001_application_full_form` berhasil diterapkan ke Neon. Kolom baru nullable agar pendaftar lama tetap terbaca.
- Pendaftaran uji sementara berhasil lewat API nyata: biodata tersimpan di Neon, NIK terenkripsi, dan foto tersimpan di bucket privat serta dapat diakses dengan tautan singkat. Data uji dan foto telah dihapus setelah pemeriksaan.
- Uji penghapusan data pribadi berhasil: NIK, biodata, catatan, dan foto hilang; referensi tanpa identitas tersisa. Data uji retensi juga telah dibersihkan.
- Route NIK/foto tanpa login memberi 403; route retensi tanpa secret memberi 401.
- Setelah deploy `b7bf8ea`, halaman daftar live menampilkan form baru, kebijakan privasi live menampilkan retensi 12 bulan, dan pendaftaran uji melalui API Vercel berhasil tersimpan di Neon dengan NIK terenkripsi serta foto bucket privat. Data dan foto uji live telah dihapus. Endpoint NIK, foto, dan penghapusan menolak akses anonim (403).
- Uji browser formulir desktop/tablet/mobile dengan API yang dimock lulus (3/3). Suite halaman publik dan persyaratan negara lulus (24/24). Screenshot formulir mobile diperiksa.
- `CRON_SECRET` sudah dibuat di `.env.local` tetapi belum dapat diverifikasi di pengaturan Vercel dari repo lokal. Penghapusan otomatis production bergantung pada secret ini.

## Revisi negara dan foto direktur — 10 November 2026

- Data Neon diperbarui: Brunei Darussalam ditambahkan sebagai informasi sektor formal, Taiwan ditambah ABK, Malaysia ditambah konstruksi dan pekerjaan kebun sawit/karet. Status program tetap `Informasi lebih lanjut`; tidak ada lowongan baru yang dibuat.
- Foto direktur baru dan bendera Brunei tersedia di bucket publik Neon serta aset lokal. Foto direktur didaftarkan ke koleksi media dan dipakai pada profil perusahaan.
- `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check`, dan 10 unit test lulus. Dua belas tes browser khusus negara lulus pada desktop, tablet, dan mobile.
- Screenshot lima kartu negara dan foto direktur diperiksa pada desktop dan mobile. Tidak ada overflow horizontal; bendera Brunei dan subjek foto direktur tampak utuh di area penting.

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
