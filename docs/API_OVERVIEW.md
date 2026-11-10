# API Overview

| Route                                    | Metode          | Akses                | Fungsi                                                                                |
| ---------------------------------------- | --------------- | -------------------- | ------------------------------------------------------------------------------------- |
| `/api/applications`                      | POST multipart  | Publik + rate limit  | Validasi data CPMI dan foto, enkripsi NIK, simpan foto privat, nomor referensi atomik |
| `/api/admin/applications/[id]/identity`  | GET             | `applications:write` | Buka NIK pendaftar dengan audit akses                                                 |
| `/api/admin/applications/[id]/photo`     | GET             | `applications:write` | Tautan foto privat berlaku 60 detik dan audit akses                                   |
| `/api/admin/applications/[id]/anonymize` | POST            | `applications:write` | Hapus data pribadi dan foto pendaftar, simpan referensi tanpa identitas               |
| `/api/cron/application-retention`        | GET             | `CRON_SECRET`        | Bersihkan pendaftaran tidak aktif setelah 12 bulan                                    |
| `/api/contact`                           | POST            | Publik + rate limit  | Validasi dan simpan pesan kontak, notifikasi opsional                                 |
| `/api/auth/[...nextauth]`                | GET/POST        | Publik/login         | Session Auth.js credentials, rate limit, lockout, audit login/logout                  |
| `/api/admin/[resource]`                  | GET/POST/DELETE | Session + RBAC       | List dan mutasi resource CMS yang di-allowlist                                        |
| `/api/admin/media`                       | GET/POST/DELETE | `media:write`        | Upload tervalidasi, embed, list, soft-delete dengan pemeriksaan relasi                |
| `/api/admin/users`                       | GET/POST        | `users:manage`       | Buat/edit/disable akun dan role; lindungi super-admin terakhir                        |
| `/api/admin/profile`                     | POST            | Session aktif        | Ganti password dengan Argon2id                                                        |
| `/api/health`                            | GET             | Publik               | Status koneksi database tanpa membocorkan detail internal                             |

Mutasi admin memeriksa akun masih aktif di database, permission server-side, sanitasi rich text, dan menulis `AuditLog`. Input publik dan login divalidasi Zod. Form publik tidak gagal hanya karena provider email belum tersedia.
