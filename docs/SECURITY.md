# Security Notes

- Password di-hash Argon2id; tidak ada public signup atau kredensial default.
- Semua route admin memerlukan session server-side. Mutasi CMS memeriksa permission server; role EDITOR tidak dapat publish.
- Login memakai rate limit database dan lockout sementara setelah kegagalan berulang.
- Form publik divalidasi Zod, dilindungi honeypot, rate limit, consent, dan idempotency key pendaftaran.
- Upload memverifikasi file signature dan MIME, menolak SVG/executable, mengoptimalkan gambar dengan Sharp, memakai object key UUID, dan membatasi ukuran/batch.
- Media yang masih direferensikan tidak dapat dihapus. Penghapusan memakai soft-delete sebelum cleanup object storage.
- Foto kandidat berada di bucket privat. Formulir meminta nomor NIK, tetapi tidak menerima unggahan KTP, paspor, atau hasil medis.
- Rich text disanitasi; CSP, `nosniff`, frame denial, referrer policy, dan permissions policy diaktifkan.
- Export CSV kandidat belum diekspos pada UI sampai kebijakan akses/retensi klien disetujui.
- Formulir CPMI baru menyimpan NIK dengan AES-256-GCM dan kunci turunan dari `NEXTAUTH_SECRET`; jangan mengganti secret tersebut tanpa migrasi ulang NIK. Foto diri dioptimasi menjadi WebP dan hanya disimpan di bucket privat, terpisah dari media website. NIK dan foto hanya dapat dibuka staf dengan `applications:write`, dan setiap akses diaudit.
- Data pendaftaran tidak aktif pada status baru, sudah dihubungi, ditolak, atau mengundurkan diri dianonimkan setelah 12 bulan tanpa perubahan. Penghapusan manual tersedia untuk permintaan pemilik data. Tugas harian memerlukan `CRON_SECRET` di Vercel.

Untuk produksi, pindahkan rate limiting ke Redis/managed store bila deployment menjalankan banyak region, rotasi secret, aktifkan monitoring, backup PostgreSQL, object versioning, dan pemindaian malware untuk dokumen/video berisiko.
