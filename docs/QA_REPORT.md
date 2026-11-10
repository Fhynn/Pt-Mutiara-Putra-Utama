# QA Report — 5 November 2026

## Pemeriksaan ulang — 10 November 2026

- `npm run lint`, `npm run typecheck`, dan `npm run format:check` lulus.
- Build production lulus pada audit 10 November. Schema Neon memiliki dua migration yang sudah terpasang; satu SUPER_ADMIN aktif sudah login dan mengganti password awal.
- Seluruh suite browser saat dijalankan ulang: 27 lulus, 3 tes admin dilewati karena `QA_ADMIN_EMAIL` dan `QA_ADMIN_PASSWORD` tidak diatur. Tes visual desktop/tablet/mobile lulus (3/3); screenshot tersedia pada `artifacts/screenshots/`.
- `npm audit --omit=dev --audit-level=high`: 0 kerentanan production.
- Neon Object Storage belum diuji dengan upload nyata karena ENV storage belum tersedia pada lingkungan ini. Deployment Vercel dan domain production juga belum terhubung.

Catatan: hasil di bawah adalah arsip pemeriksaan awal pada 5 November; bagian batas verifikasi database lokal tidak lagi menggambarkan kondisi Neon yang telah dimigrasikan.

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
