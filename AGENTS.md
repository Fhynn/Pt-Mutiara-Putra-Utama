# MASTER PROMPT CODEX — PT. MUTIARA PUTRA UTAMA (MPU)

## Website Company Profile P3MI + CMS Admin Dashboard + Backend + Database + Deployment

> **PERINTAH EKSEKUSI**: Anda (Codex) bertindak sebagai Principal Full-Stack Engineer, Senior UI/UX Designer, Security Engineer, dan QA Engineer. BANGUN PRODUK YANG BERFUNGSI, bukan sekadar menjelaskan rencana, membuat wireframe, atau menuliskan pseudocode. Kerjakan implementasi end-to-end di repository yang tersedia, dengan kualitas production-ready. Gunakan bahasa Indonesia untuk seluruh UI dan dokumentasi pengguna.

---

## 0. HASIL AKHIR YANG WAJIB

Buat **satu aplikasi full-stack lengkap** untuk **PT. MUTIARA PUTRA UTAMA**, perusahaan penempatan pekerja migran Indonesia (P3MI). Website publik harus mengikuti **gambar referensi desain landing page MPU yang dilampirkan**, tetapi ditingkatkan menjadi UI/UX premium, rapi, dan realistis. Aplikasi juga wajib memiliki **admin dashboard CMS** yang benar-benar dapat menyunting isi website, mengunggah media, menambah negara, memublikasikan lowongan, memeriksa formulir pendaftaran, dan mengelola pesan masuk.

Selesaikan:

1. Website publik multi-halaman, responsive, cepat, dan SEO-friendly.
2. Landing page lengkap, dengan seluruh section seperti pada mockup.
3. Dashboard admin berbasis autentikasi dan role, dengan CRUD konten, bukan dashboard pajangan.
4. Backend/API/server actions, database PostgreSQL dengan schema dan migration, serta penyimpanan media persistent.
5. Formulir kontak dan pendaftaran CPMI yang tersimpan di database dan bisa dikelola admin.
6. Pengelolaan foto, album galeri, dokumen legal, video, lowongan, negara, artikel, FAQ, testimoni, dan pengaturan situs.
7. Dokumentasi setup, `.env.example`, seed data, skrip migration, akun admin bootstrap yang aman, dan panduan deploy.
8. Automated tests, pemeriksaan keamanan, verifikasi responsivitas, dan hasil build yang dapat dibuktikan.

**Jangan mengakhiri pekerjaan dengan UI statis**. Semua tombol penting harus menuju halaman nyata atau menjalankan aksi nyata. Jangan gunakan link kosong `#` untuk CTA. Jika dependensi eksternal belum tersedia, bangun implementasi/adapter lengkap dengan mode development lokal, dokumentasikan konfigurasi yang dibutuhkan, dan jangan berpura-pura fitur cloud sudah aktif.

---

## 1. INVENTARISASI REPOSITORY DAN BAHAN KLIEN (WAJIB PERTAMA)

Sebelum menulis kode:

- Periksa struktur repo, branch, package manager, framework, kode yang telah ada, serta file yang tersedia. **Jangan overwrite pekerjaan yang sudah ada tanpa alasan.**
- Baca secara menyeluruh PDF company profile `Compro_MPU_Client.pdf` dalam starter pack atau `Compro MPU (Eng Version) (edited)(1).pdf` dari lampiran, dan lihat gambar/foto/logo di dalamnya.
- Baca referensi landing page `MPU_LANDING_REFERENCE.png` bila disertakan. Jadikan referensi komposisi, branding, layout, dan konten — **jangan tempel gambar screenshot sebagai website**.
- Baca aset lain di folder proyek dan folder Google Drive klien jika memang dapat diakses dengan izin: `https://drive.google.com/drive/folders/1TXqb5TOCzvr6SLwLWIuLyzIsjZsEDxpf`.
- Jika Google Drive tidak dapat diakses, JANGAN mengklaim telah membacanya; gunakan PDF dan aset lokal, lalu catat file yang masih perlu diberikan klien dalam `CONTENT_VERIFICATION.md`.
- Prioritaskan foto nyata klien dan logo yang benar. Jangan membuat testimoni palsu, foto kantor palsu, sertifikat palsu, atau statistik keberhasilan palsu.
- Buat `docs/SOURCE_OF_TRUTH.md` yang mencatat setiap informasi penting, sumbernya, dan statusnya: `confirmed`, `needs-client-confirmation`, atau `sample-only`.
- Jika pekerjaan dilakukan di repo existing, pertahankan pola yang sudah benar. Jika proyek kosong, gunakan stack dalam bagian 3.

### Data klien dari materi dan sumber yang telah diketahui

- Nama hukum: **PT. MUTIARA PUTRA UTAMA**.
- Subidentitas merek: **EMPLOYMENT AGENCY**, logo **MPU** navy-merah. Pertahankan proporsi identitas merek asli.
- Bidang: layanan penempatan dan rekrutmen tenaga kerja Indonesia untuk kebutuhan internasional, sektor formal, semi-formal, informal.
- Tahun pendirian mengacu Akta Notaris No. 17 tanggal **1 Oktober 1998**, Notaris H. M. Afdal Gazall, S.H. (periksa ejaan dari berkas asli sebelum tayang).
- Company profile 2022 mencantumkan nomor **02201003618290002** sebagai **SIUP tahun 2021**. Dokumen penempatan lain menyebut nomor tersebut sebagai SIP3MI; jangan gabungkan kategori dokumen secara sembrono. Field `permitType`, `permitNumber`, `issuedYear`, `sourceUrl` dibuat terpisah, dan tampilkan label yang disetujui klien.
- Sumber PDF mencantumkan alamat `Jl. At Taqwa 02/05, Bojong Kulur, Gunung Putri, Kab. Bogor`, telepon `021-84903492`, email `mpu_setu@yahoo.com`.
- Sumber resmi pemerintah SISKOP2MI mencantumkan status **Aktif** saat pengecekan 5 November 2026, alamat `Jl. KH Sanip No. 42, Kp. Bubulak, Bojong Kulur, Gunung Putri, Kab. Bogor, Jawa Barat`, telepon `021-82740059`, email `mpu_setu@yahoo.com`, nama direktur `MARTUA RITONGA, SE`.
- Website publik perusahaan mencantumkan `info@ptmutiaraputrautama.com` dan `021-82740059`.
- Sumber rujukan resmi untuk halaman legalitas dan tombol **Verifikasi di SISKOP2MI**: `https://siskop2mi.bp2mi.go.id/profil/lembaga/detail/966/p3mi`.
- Website perusahaan saat riset: `https://www.ptmutiaraputrautama.com/`.
- Negara yang tersedia di halaman pendaftaran perusahaan: **Taiwan, Hong Kong, Singapura, Malaysia**. Buat empat ini sebagai seed negara, tetapi status program/lowongan aktual harus dapat ditentukan admin. Negara lain, termasuk Brunei, dapat ditambahkan dari CMS; jangan menandainya sedang dibuka tanpa konfirmasi.
- Direktur pada materi PDF halaman 4 ditulis `Martua Ritongga S.E`, tetapi sumber pemerintah menulis `MARTUA RITONGA, SE`. Prioritaskan verifikasi ejaan nama dengan klien, jangan mengumumkan dua ejaan sekaligus.
- Nilai perusahaan dalam PDF: **FAST, RELIABLE, EXPERIENCED**.
- Fokus visi: reputasi sebagai perusahaan penempatan, peningkatan kualitas pekerja Indonesia, pengelolaan berwawasan global, pelayanan dan pelindungan pekerja migran.
- Fokus misi: pusat informasi ketenagakerjaan terintegrasi; peningkatan peluang dan mekanisme penempatan lewat koordinasi; SDM profesional untuk calon pekerja berkualitas global.
- Layanan inti berdasarkan website perusahaan: **Sosialisasi, Rekrutmen, Pelatihan, Penempatan**.
- Materi PDF juga memuat **Sambutan Direktur/CEO, Visi dan Misi, Tim, Portofolio, serta Rencana Pengembangan Perusahaan**. Pastikan konten ini diakomodasi di halaman `Tentang Kami`/halaman terkait, bukan dihilangkan karena tidak tampak pada mockup.

**Aturan fakta:** Tanggal, nomor, status izin, alamat, personel, fasilitas pelatihan, mitra luar negeri, kuota, biaya, lowongan, jumlah pekerja berangkat, dan testimoni tidak boleh ditebak. Sumber publik bukan berarti data selalu mutakhir. Tampilkan sumber dan tanggal verifikasi untuk status izin; sediakan mekanisme pembaruan manual di CMS. Statistik SISKOP2MI bukan otomatis angka alumni/penempatan perusahaan; jangan diperlakukan sama.

---

## 2. RISET DAN ARAH DESAIN (WAJIB SEBELUM CODING UI)

Pelajari struktur informasi dan visual dari situs nyata berikut, kemudian ambil prinsip desainnya (jangan menyalin aset, logo, atau layout persis):

- `https://jobstacular.id/` — perusahaan rekrutmen/P3MI, penekanan peluang kerja internasional, program, dan kredibilitas.
- `https://www.lpk-brata.com/` — pelatihan, negara tujuan, keunggulan, dan tahapan proses.
- `https://www.placedintl.com/` — editorial recruitment landing page, hirarki headline besar, CTA berbeda untuk kandidat dan employer.
- `https://intora.eu/` — layanan rekrutmen, bantuan legalitas/relokasi, dan pengenalan perusahaan.
- `https://www.ptmutiaraputrautama.com/` — situs perusahaan existing, sumber struktur dan fitur yang sudah digunakan.

Lihat dan dokumentasikan secara ringkas insight layout/navigation/hero/trust/country/services/CTA di `docs/DESIGN_RATIONALE.md`. Jika sebuah situs tak bisa diakses dari lingkungan Codex, nyatakan keterbatasannya; jangan mengaku sudah melakukan inspeksi visual. Utamakan juga **gambar mockup MPU** yang dilampirkan sebagai design reference, sambil memperbaiki kekurangan seperti keterbacaan teks, kepadatan kartu, konsistensi jarak, dan potensi teks AI yang salah.

### Design system wajib

- Karakter: **premium corporate, kredibel, human-centered, rapi, editorial, tidak generik AI**.
- Palet awal (boleh dikalibrasi dari logo asli, gunakan CSS variables/design tokens): deep navy `#111C52`, blue `#1A4D86`, red `#C4192D` untuk CTA dan penanda, white `#FFFFFF`, cool-offwhite `#F6F8FC`, text charcoal `#1D2940`, border `#E3E9F2`.
- Jangan gunakan neon, gradient ungu/biru bawaan AI, glassmorphism berlebihan, glow, emoji sebagai ikon, floating blob, kartun, atau semua blok seragam.
- Gunakan font berlisensi web yang bukan kombinasi generik Inter/Poppins. Preferensi: **Archivo** untuk display/headline dan **Source Sans 3** untuk body; optimalkan via `next/font`. Buat kelas typography dan scale responsif.
- Desktop canonical 1440px; container sekitar 1200–1280px, grid 12 kolom, whitespace yang disengaja, ritme antar section, dan hierarchy headline jelas.
- Hero dengan tipografi besar di kiri dan visual konsultasi/pekerja/pelatihan di kanan. Gunakan foto nyata berizin, bukan figur AI yang diklaim pegawai asli.
- Navigation jelas, sticky hanya bila tidak mengganggu, logo kiri, menu tengah, CTA kanan.
- Variasikan komposisi: split image + text; card grid; horizontal timeline; full-bleed CTA; galeri masonry/grid. Jangan semua section berupa empat kartu yang sama.
- Motion ringan dan fungsional (hover, accordion, modal, fade halus) dengan `prefers-reduced-motion`.
- Semua ikon dari satu pustaka konsisten, misalnya Lucide. Gunakan accent red secukupnya.
- Foto di-crop dengan fokus wajah, alt text bermakna, tanpa distorsi atau stretching. Jangan menggunakan screenshot mockup sebagai konten background.
- Buat homepage versi desktop 1440px, tablet 768px, mobile 390px dengan QA visual. Menu mobile harus bekerja, galeri nyaman disentuh, timeline berubah menjadi vertikal di mobile, dan tabel admin punya fallback mobile.

---

## 3. ARSITEKTUR TEKNIS

Jika repo kosong atau tidak punya stack mengikat, gunakan:

- **Next.js App Router** stable terbaru yang kompatibel, **React**, **TypeScript strict**, **Tailwind CSS**, CSS variables, komponen semantik reusable.
- **PostgreSQL + Prisma ORM** dengan migrations dan relasi yang benar.
- **Auth.js / authentication library yang dipelihara**, server-side session, password hashing kuat (Argon2id diutamakan), login via email/password untuk staf, role-based access control (RBAC).
- **Zod** untuk semua input, **React Hook Form** untuk form admin/public yang kompleks.
- **S3-compatible object storage** untuk media persistent, misalnya Cloudflare R2 di production dan MinIO di lokal; jangan menyimpan upload production di filesystem ephemeral Vercel.
- **Sharp** atau pipeline server untuk optimasi gambar dan auto-orientation, AVIF/WebP bila sesuai.
- **Resend/SMTP adapter** untuk email notifikasi sebagai opsional yang benar-benar terhubung jika env tersedia; data inquiry tetap disimpan walau email gagal.
- **Vitest** untuk unit/integration dan **Playwright** untuk end-to-end. ESLint + Prettier + typecheck.
- Gunakan shadcn/ui atau komponen Radix khusus bagian admin/form kompleks; website publik harus tetap punya desain kustom.
- Paket pendukung seminimal mungkin, dipin ke versi stabil kompatibel, dan **ikuti dokumentasi resmi sesuai versi terpasang**, bukan API usang.

Arsitektur: aplikasi tunggal Next.js dengan area `(public)` dan `/admin`. Server Components untuk data fetch SEO, Client Components hanya untuk fitur interaktif; Route Handlers/Server Actions dengan auth & permission server-side. Semua operasi database privat di server.

Deployment referensi: Vercel (app), PostgreSQL managed (misalnya Neon/Supabase database), Cloudflare R2 (upload), domain klien, TLS/HTTPS. Buat juga `docker-compose.yml` untuk PostgreSQL dan MinIO development. Jangan hard-code API key/password.

---

## 4. STRUKTUR PUBLIC WEBSITE — HALAMAN DAN ROUTING

Wajib implementasi route navigable:

| URL                     | Isi minimum                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| `/`                     | Landing page lengkap seluruh section bagian 5                            |
| `/tentang-kami`         | Sejarah, profil, CEO, visi & misi, nilai, tim, rencana pengembangan      |
| `/layanan`              | Empat layanan utama dan detail/alur layanan                              |
| `/negara-tujuan`        | Daftar negara, filter status program, kartu negara                       |
| `/negara-tujuan/[slug]` | Detail negara, sektor, persyaratan umum, lowongan relevan, disclaimer    |
| `/lowongan`             | List lowongan real dari database dengan cari, filter, sort, pagination   |
| `/lowongan/[slug]`      | Detail lowongan, syarat, status, tujuan, CTA daftar                      |
| `/program-pelatihan`    | Program dan informasi pelatihan dari CMS                                 |
| `/legalitas`            | Akta/izin/berkas resmi yang disetujui, sumber verifikasi, tanggal update |
| `/galeri`               | Album dan foto kegiatan, kategori, filter, lightbox                      |
| `/galeri/[slug]`        | Detail album dengan foto/video dan caption                               |
| `/testimoni`            | Testimoni benar-benar disetujui/terverifikasi, tanpa fake                |
| `/berita`               | Artikel/berita/kegiatan, pencarian dan pagination                        |
| `/berita/[slug]`        | Detail artikel dengan SEO metadata dan related posts                     |
| `/faq`                  | Tanya-jawab berdasarkan kategori, accordion accessible                   |
| `/kontak`               | Informasi kantor, peta, jam kerja jika diketahui, formulir dan CTA       |
| `/daftar`               | Formulir minat/pendaftaran awal CPMI yang aman                           |
| `/kebijakan-privasi`    | Kebijakan data pribadi terpublikasi, editable CMS                        |
| `/syarat-ketentuan`     | Ketentuan penggunaan/pendaftaran, editable CMS                           |
| `not-found`/`error`     | 404/500 yang beridentitas brand dengan aksi kembali                      |

Breadcrumb di halaman detail, canonical URL dan metadata unik, navigasi utama/footer konsisten. Jika halaman belum ada konten, tampilkan empty state elegan dan CTA kontak — **bukan lorem ipsum**, dan jangan memublikasikan dummy lowongan/testimoni.

---

## 5. HOMEPAGE — IMPLEMENTASI SECTION-BY-SECTION WAJIB

Susunan tidak boleh ada yang terlewat. Pastikan seluruh heading, deskripsi, CTA, dan media untuk section-section ini bisa dikelola dari admin melalui model yang sesuai.

### 5.1 Header

- Logo MPU asli, nama perusahaan, link `Beranda`, `Tentang`, `Layanan`, `Negara Tujuan`, `Lowongan`, `Legalitas`, `Galeri`, `Kontak` (menu tambahan bisa di submenu agar tetap rapi).
- CTA utama `Daftar Online` menuju `/daftar`.
- Desktop navigation + mobile drawer accessible; active state, keyboard, focus style, tidak overflow.

### 5.2 Hero

- Eyebrow: `PT. MUTIARA PUTRA UTAMA — EMPLOYMENT AGENCY` atau label P3MI yang telah diverifikasi.
- Heading utama: `Penempatan Pekerja Migran Indonesia yang Legal, Aman, dan Profesional`.
- Body: penjelasan manfaat pendampingan penempatan, tanpa jaminan berangkat atau klaim yang tidak terverifikasi.
- CTA primary `Konsultasi Sekarang` menuju WhatsApp/halaman kontak dengan nomor terkonfigurasi; CTA secondary `Lihat Lowongan` menuju `/lowongan`.
- Foto hero dengan visual konsultasi, pekerja profesional, pelatihan (aset klien bila ada). Layout hero dua kolom premium.
- Trust items: `Terdaftar di SISKOP2MI` (link sumber), `Berdiri Sejak 1998`, `Proses Transparan` (hanya jika wording disetujui).

### 5.3 Trust metrics / quick facts

- Empat elemen: `Sejak 1998`, `Nomor Izin (sesuai label valid)`, `Lokasi kantor Bogor`, `Pendampingan proses penempatan`.
- Jangan tampilkan angka pekerja berangkat atau persen keberhasilan yang belum disetujui.
- Sumber izin harus bisa diklik; nomor dibaca jelas.

### 5.4 Tentang Kami

- Layout split image dan text: foto kantor asli dari PDF/client asset jika memadai, atau placeholder jelas nonpublik sampai admin upload.
- Ringkas profil perusahaan, area formal/semi-formal/informal, pendekatan layanan.
- Tombol `Selengkapnya Tentang Kami` menuju `/tentang-kami`.
- Sertakan tautan ke visi-misi dan sambutan direktur.

### 5.5 Layanan Kami

- Empat card berbeda dan mudah discan: **Sosialisasi, Rekrutmen, Pelatihan, Penempatan**.
- Masing-masing punya nama, ikon, deskripsi, urutan, `isPublished`, URL detail.
- Di bawah: nilai perusahaan **Fast · Reliable · Experienced** dengan deskripsi singkat (editable).

### 5.6 Legalitas & Izin Resmi

- Visual dokumen/notaris dan kartu perizinan yang tidak menyesatkan.
- Akta No. 17 / 1 Oktober 1998; data nomor izin dari materi dan sumber pemerintah melalui model legal document yang terpisah.
- Tampilkan kategori dokumen dan tanggal verifikasi. Tautan `Cek Status di SISKOP2MI` menuju laman resmi.
- Jika ada scan izin, hanya publikasikan yang disetujui admin; data pribadi, tanda tangan, dan identitas pihak ketiga disensor bila perlu.

### 5.7 Negara Tujuan

- Empat featured cards awal: **Taiwan, Hong Kong, Singapura, Malaysia**.
- Foto kota/negara, bendera, ringkasan peluang, kategori sektor/pekerjaan yang telah diverifikasi, status program `Tersedia` / `Belum dibuka` / `Informasi lebih lanjut`.
- CTA `Lihat Detail Negara` dan `Lihat Semua Negara`.
- Jangan menampilkan pekerjaan spesifik sebagai aktif tanpa data lowongan valid.

### 5.8 Alur Penempatan

Timeline enam tahap, mudah dibaca desktop & mobile:

1. `Konsultasi & Sosialisasi`
2. `Registrasi & Verifikasi Dokumen`
3. `Seleksi & Rekrutmen`
4. `Pelatihan & Persiapan`
5. `Wawancara, Pemeriksaan Kesehatan & Administrasi`
6. `Keberangkatan & Pendampingan`

Alur ini adalah ilustrasi tahap umum dan bisa disesuaikan admin per ketentuan. Jangan menyatakan semua kandidat pasti melewati tahapan identik atau pasti ditempatkan.

### 5.9 Program Pelatihan

- Layout foto kelas/pelatihan + daftar fitur: `Bahasa`, `Keterampilan kerja`, `Etika & budaya kerja`, `Kesiapan dokumen`, `Pembekalan prakeberangkatan`.
- Hanya tampilkan jenis pelatihan yang benar-benar disediakan/diikuti melalui lembaga terkait; jangan mengklaim MPU memiliki LPK atau sertifikasi tertentu tanpa bukti.
- CTA `/program-pelatihan`.

### 5.10 Cerita Alumni / Testimoni

- Card dengan nama/alias yang disetujui, foto izin publikasi, negara, kutipan testimoni, tanggal.
- Filter `approved` + `published` + `consentToPublish`.
- **Nama Siti Rahayu, Novi Lestari, Agus Pratama pada mockup adalah contoh visual, bukan data klien terverifikasi. JANGAN publikasikan sebagai alumni nyata.** Jika tidak ada testimoni asli, sembunyikan section secara elegan atau tampilkan CTA konsultasi; jangan buat review fiktif/5 bintang palsu.

### 5.11 Galeri kegiatan (tambahan penting dari PDF dan website existing)

- Preview 6–8 media asli dengan filter singkat dan CTA `Lihat Galeri`.
- Kategori: kantor, sosialisasi, rekrutmen, pelatihan, kegiatan, pemberangkatan, lainnya.
- Hanya media berizin dan dapat dikelola dari CMS.

### 5.12 FAQ singkat

- Tampilkan 4–6 FAQ: cara mendaftar, berkas umum, tahapan, negara tersedia, biaya, cara verifikasi status P3MI.
- Hindari jawaban biaya mutlak tanpa kebijakan/program terbaru. Sediakan link ke FAQ penuh.

### 5.13 Final CTA

- Banner full-width khas MPU: `Siap Memulai Karier ke Luar Negeri?`
- Deskripsi tegas tetapi tidak membuat janji penempatan pasti.
- Button `Hubungi Kami` dan `Daftar Online` dengan tujuan valid.

### 5.14 Footer

- Logo identitas perusahaan, deskripsi pendek, kontak resmi, jam operasional jika diketahui, alamat kantor, daftar link, link SISKOP2MI, sosial media (hanya akun benar), hak cipta tahun dinamis.
- Email dari setting; WhatsApp ke nomor yang sudah diformat E.164, tanpa mengarang nomor WhatsApp dari telepon fixed line.

---

## 6. HALAMAN TENTANG KAMI LENGKAP

Halaman `/tentang-kami` harus lebih lengkap daripada landing page dan memasukkan informasi PDF:

- Sejarah pendirian 1998 dan profil resmi.
- **Sambutan Direktur**: foto dan pesan dari halaman 4 PDF, nama yang telah diverifikasi. Sediakan CMS edit semua teks dan foto.
- **Visi dan Misi**: translasi Indonesia yang setia dari materi PDF, dengan poin yang mudah dibaca. Jangan mengubah makna asal.
- **Nilai perusahaan:** Fast, Reliable, Experienced.
- **Tim Kami:** deskripsi pengalaman tim dari PDF dan foto tim yang diizinkan; nama/jabatan individual hanya bila ada sumber.
- **Portofolio/Bidang Pekerjaan:** pertanian, industri, konstruksi, jasa, perhotelan, dll sebagai contoh bidang dalam PDF; jangan mengklaim lokasi proyek khusus tanpa bukti.
- **Rencana Pengembangan:** peningkatan profesionalisme SDM, jaringan pemasaran, mitra luar negeri, relasi pengguna, promosi, kualitas calon pekerja, konseling/informasi. Cantumkan sebagai rencana, bukan realisasi.
- Bagian trust & CTA di akhir.

---

## 7. ADMIN DASHBOARD / CMS — WAJIB BENAR-BENAR BERFUNGSI

Area admin private `/admin` bukan sekadar UI template. Bangun sistem pengelolaan konten lengkap. Tampilan: sidebar navigasi di kiri, topbar (akun, search, notifikasi bila diimplementasikan), breadcrumb, statistik utama, tabel/list, modal konfirmasi, toast sukses/gagal, skeleton/loading, form validasi, pagination. Desain admin modern, profesional, terstruktur, berbrand MPU tetapi lebih utilitarian daripada website publik.

### 7.1 Autentikasi dan hak akses

- `/admin/login`: email + password, rate limit, lockout sementara, error generik, session httpOnly/secure/sameSite.
- Logout nyata, invalidasi session, proteksi semua route/API/admin server action.
- Role: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`.
- SUPER_ADMIN: semua + pengguna + pengaturan keamanan.
- ADMIN: kelola seluruh konten, negara, lowongan, pendaftar, pesan, tanpa mengelola super-admin.
- EDITOR: edit media, draft, konten, artikel; publish hanya jika permission ditetapkan.
- VIEWER: read-only.
- Semua permission dicek di server, bukan hanya hide tombol di UI.
- Tidak ada public signup admin. Bootstrap akun awal melalui skrip CLI yang membaca env/terminal, dengan kewajiban mengganti password. Tidak ada kredensial default yang dipublikasikan.

### 7.2 Dashboard utama `/admin`

Stat cards menghitung **data riil dari database**:

- Total pendaftar masuk, pendaftar baru, pesan belum dibaca, lowongan aktif, total negara/program terpublikasi, total media.
- Grafik tren pendaftar atau kontak 30 hari terakhir, bukan angka dummy.
- Tabel pendaftar terakhir, pesan terbaru, lowongan akan kedaluwarsa, aktivitas edit terbaru.
- Shortcut `Tambah Lowongan`, `Upload Foto`, `Buat Artikel`, `Lihat Pendaftar`.
- Empty state jika dataset kosong; setiap widget harus query data nyata.

### 7.3 CMS Halaman / Section `/admin/halaman`

- Daftar halaman publik dengan status, SEO status, tanggal update, tindakan edit/preview.
- Editor untuk home sections: hero headline/body/CTA/image, quick facts, about, layanan, legalitas, countries featured, alur, pelatihan, testimonial visibility, galeri preview, FAQ, final CTA, footer.
- Form section: field validasi, preview media, `Save Draft`, `Publish`, `Unpublish`, `Preview`, `Discard Changes`, dan urutan tampil yang terkendali.
- Rich text aman (HTML disanitasi) untuk About/visi/misi/deskripsi panjang; hindari script injection. Untuk section terstruktur, gunakan field schema yang jelas, bukan satu blob HTML.
- Edit slug, meta title/description, OG image, visibility, tombol/link.
- Preview sebaiknya membedakan draft dan published, dengan token preview aman.

### 7.4 Media Library `/admin/media`

**Ini fitur yang sangat penting**:

- Drag & drop **multi-file upload** (progress per file), tombol file picker, preview thumbnail dan metadata.
- Mendukung JPG/JPEG, PNG, WebP, AVIF; PDF untuk dokumen legal dengan alur khusus. **Video juga dapat diunggah langsung** (misalnya MP4/WebM dengan batas awal 150 MB yang configurable) ke object storage melalui signed/multipart upload yang aman, dengan progress dan validasi server; tersedia pula opsi embed YouTube/Vimeo dengan URL yang divalidasi. Tampilkan pesan jelas jika provider storage video belum dikonfigurasi; jangan berpura-pura upload berhasil.
- Validasi ukuran awal: gambar maks. 10 MB per file (configurable), PDF maks. 20 MB (configurable), video maks. 150 MB (configurable), jumlah batch dibatasi. Verifikasi **file signature** dan MIME di server, bukan ekstensi semata.
- Tolak SVG untrusted dan file executable. Strip metadata EXIF yang tidak diperlukan. Generate variants thumbnail dan optimized image. Simpan width/height, size, type, alt text, title, caption, photographer/source, license/permission, uploadedBy, uploadedAt, tags, folder/album, focal point.
- Grid dan list view, search/filter/sort, pagination, bulk select/bulk delete dengan konfirmasi, edit metadata, preview modal, copy public URL hanya untuk aset public, replace media, crop/focal point setting.
- Periksa relasi sebelum delete: jika digunakan di hero/galeri/artikel, tampilkan daftar penggunaan dan cegah penghapusan mendadak. Hapus storage object setelah database transaction sukses melalui proses yang tahan gagal (atau soft delete + cleanup).
- Gambar untuk artikel, hero, negara, lowongan, tim, testimoni, profil, galeri dapat **dipilih dari media library**, tanpa perlu upload ulang.
- Storage object path UUID/unpredictable, sanitize filename, bucket/ACL privat sesuai kategori; dokumen pribadi kandidat **jangan pernah berada di bucket publik**.
- Buat form media yang enak dipakai admin non-teknis.

### 7.5 Galeri dan album `/admin/galeri`

- CRUD album: judul, slug, deskripsi, cover, kategori, tanggal kegiatan, lokasi bila diketahui, status draft/published, featured, order.
- Tambah beberapa foto/video dari media library; reorder drag-drop; caption per foto; tandai cover; preview dan publish.
- Publik `/galeri` dan `/galeri/[slug]` sinkron otomatis dengan CMS, lightbox keyboard-friendly.

### 7.6 Negara tujuan `/admin/negara`

- CRUD: nama, slug, bendera, hero/cover, ringkasan, rincian program, syarat umum, sektor pekerjaan terkait, status program, SEO, urutan, featured, publish.
- Negara default Taiwan, Hong Kong, Singapura, Malaysia.
- Relasi otomatis ke lowongan, CTA negara mengarah ke form pendaftaran dengan preselected country.
- Jika negara dihapus dan punya lowongan, soft delete atau blokir dengan pesan yang jelas.

### 7.7 Lowongan pekerjaan `/admin/lowongan`

- CRUD dengan form: judul, slug, negara, sektor, jenis pekerjaan, ringkasan, deskripsi, tanggung jawab, persyaratan, kualifikasi, jenis kontrak, kompensasi (hanya data terverifikasi), mata uang, fasilitas, jumlah posisi jika disetujui, batas pendaftaran, tanggal publikasi, sumber/job order yang sesuai, status `DRAFT`, `OPEN`, `CLOSED`, `EXPIRED`, `ARCHIVED`, featured.
- Tanggal yang lewat otomatis menghentikan status aktif pada sisi publik; filter lowongan tidak menampilkan draft/expired sebagai terbuka.
- Preview, duplicate lowongan, publish/unpublish, pagination, filter status/country, pencarian, peringatan jika data wajib kurang.
- Hubungkan detail lowongan ke formulir `/daftar?job=slug`; pastikan aplikasi tertaut ke job ID.
- Tidak menampilkan fake job positions dari mockup.
- Tambahkan catatan perincian biaya dan kondisi sesuai aturan/program, dikelola admin dan tidak dibuat-buat.

### 7.8 Manajemen pendaftar `/admin/pendaftar`

- Form publik `/daftar` menyimpan data yang **minimal dan relevan**: nama, email opsional, nomor telepon/WhatsApp, domisili (kabupaten/kota), negara diminati, lowongan (opsional), pengalaman kerja singkat (opsional), pesan, consent kebijakan privasi, timestamp. Jangan meminta NIK, paspor, hasil medis, foto KTP pada formulir publik awal tanpa dasar hukum dan kebutuhan yang sudah ditinjau.
- Validasi client/server Zod; CSRF protection sesuai mekanisme auth; anti-spam honeypot + rate limiting + CAPTCHA jika tersedia; konfirmasi sukses yang benar dan privacy notice.
- Nomor registrasi internal unik non-bermakna mis. `MPU-2026-00001`, bukan menggantikan nomor registrasi pemerintah.
- Admin: tabel dengan search, filter, sort, pagination; detail pendaftar; status `NEW`, `CONTACTED`, `SCREENING`, `IN_PROCESS`, `COMPLETED`, `REJECTED`, `WITHDRAWN`; catatan internal dengan audit log; assignment ke admin; ekspor CSV terbatas role, aman dari CSV formula injection.
- Pendaftar tidak boleh bisa melihat pendaftar lain. Admin boleh menghapus/menganonimkan data sesuai kebijakan retensi.
- Jika suatu saat dibutuhkan upload dokumen kandidat, buat **modul privat terpisah** dengan storage privat, izin akses granular, signed short-lived download, audit, retensi; jangan campur media umum.
- **Jangan menjanjikan penempatan/visa atau notifikasi email terkirim jika provider belum dikonfigurasi.**

### 7.9 Pesan kontak `/admin/pesan`

- Form publik `/kontak`: nama, email/telepon, subjek, pesan, consent.
- Simpan database; admin inbox list/detail/search/filter `UNREAD`, `READ`, `FOLLOW_UP`, `RESOLVED`, `SPAM`; assign admin, internal notes, mark read, archive/delete sesuai retention.
- Opsional email notifikasi admin dengan provider aktif. Pengiriman gagal tidak menggagalkan penyimpanan kontak.

### 7.10 Artikel/berita `/admin/berita`

- CRUD title/slug/excerpt/body/editor, category, tag, cover, status, featured, SEO, publishedAt, author.
- Rich text editor aman, preview, draft/publish, artikel related, sitemap otomatis.
- Konten dari website lama boleh ditransfer HANYA jika hak penggunaan dan kualitas terkonfirmasi.

### 7.11 Testimoni `/admin/testimoni`

- CRUD foto, nama/alias, negara, pekerjaan opsional, kutipan, consent, approval status, published/featured, order.
- Upload bukti persetujuan secara private apabila klien memerlukannya.
- Jangan seed nama/foto/review rekaan ke mode production.

### 7.12 Program pelatihan `/admin/pelatihan`

- CRUD jenis pelatihan, penjelasan, materi, foto, status, urutan dan featured.
- Kembangkan dari pelatihan umum pada mockup, tetapi setiap klaim fasilitas/sertifikat harus disetujui.

### 7.13 Layanan, tim, CEO, alur, FAQ, dan legalitas

- `/admin/layanan`: CRUD empat layanan; ikon, deskripsi, urutan.
- `/admin/tim`: CRUD anggota tim, jabatan, foto, bio, order, publish.
- `/admin/profil`: CEO message, visi, misi, sejarah, rencana pengembangan.
- `/admin/alur`: CRUD/reorder tahapan proses.
- `/admin/faq`: kategori, question, answer, order, visibility.
- `/admin/legalitas`: jenis dokumen, nomor, tanggal, keterangan, sumber URL, tanggal verifikasi, masa berlaku bila berlaku, dokumen terlampir, published. Tampilkan alert jika informasi perlu verifikasi ulang.

### 7.14 Pengaturan website `/admin/pengaturan`

- Nama, tagline, logo header/footer, favicon, warna/brand tokens jika dibutuhkan, alamat, email utama, email lain, telepon, WhatsApp resmi, Google Maps URL, social link, jam operasional, CTA link, footnote, pengumuman banner, maintenance mode, analytics IDs, default SEO, default OG image.
- Semua settings punya validasi URL/email/nomor; tombol `Simpan` dan preview.
- Privacy policy dan terms harus dapat diedit dengan log perubahan.

### 7.15 Pengguna `/admin/pengguna` dan riwayat

- SUPER_ADMIN CRUD akun internal, assign role, disable account, reset credentials aman, prevent last super-admin deletion.
- `/admin/aktivitas`: audit log login, publish, update, delete, export, akses dokumen sensitif. Log tanpa password/token/PII mentah.
- Panel profil admin untuk ganti password dan lihat session aktif bila feasible.

---

## 8. DATABASE / PRISMA SCHEMA WAJIB

Buat schema relasional normalisasi yang sesuai dengan fitur. Minimal models atau padanan jelas:

- `User`, `Account`/`Session`/`VerificationToken` jika diperlukan Auth.js; enum `Role`.
- `SiteSetting`, `Page`, `PageSection` (untuk struktur modular terkendali), `NavigationItem` bila diperlukan.
- `MediaAsset` (objectKey, visibility, mime, size, width, height, alt, owner, caption, metadata), `MediaUsage` atau relasi kuat yang ekuivalen.
- `GalleryAlbum`, `GalleryItem`.
- `Country`.
- `Job`, `JobCategory`/`Sector` bila perlu; relasi `Job -> Country`.
- `TrainingProgram`, `Service`, `PlacementStep`, `TeamMember`, `CompanyProfile`/`CEOStatement`/`CompanyValue`.
- `LegalDocument`.
- `Testimonial` (approval, consent).
- `Article`, `ArticleCategory`, `Faq`.
- `Application`, `ApplicationNote`, `ContactMessage`, `ContactNote`.
- `AuditLog`.
- `SeoMetadata` embedded atau fields per entitas.

Wajib:

- ID stabil (cuid/UUID), index untuk status/slug/country/createdAt, unique slug, createdAt/updatedAt, status enum, publishedAt, author/updateBy, foreign keys, delete strategy jelas, pagination query.
- Gunakan transaksi untuk operasi multitable, cegah orphan media/reference. Hindari race condition registrasi nomor urut.
- Buat migration sungguhan dan seed idempotent. Seed perusahaan, nilai, 4 negara, 4 layanan, 6 alur, profil dasar yang sumbernya jelas. Tidak seed pendaftar palsu atau testimoni palsu di production.
- Semua list content publik hanya menampilkan `published`/`approved` yang memenuhi kriteria.

---

## 9. UI / UX ADMIN TERPERINCI

Dashboard admin harus terasa seperti SaaS internal profesional yang digunakan staf perusahaan:

- Sidebar permanen desktop, collapsible di layar sempit; grup `Ringkasan`, `Konten Website`, `Rekrutmen`, `Komunikasi`, `Sistem`.
- Header dengan breadcrumb, global search fungsional minimal untuk menu dan konten penting, menu profil.
- DataTable dengan pencarian, filter, sort, pagination, multiselect jika bermanfaat, loading/skeleton, empty state, error state.
- Semua form: label, helper text, required indicator, pesan error spesifik, autosave draft hanya jika aman (jangan klaim tersimpan bila gagal), konfirmasi unsaved changes.
- Editor media dengan preview asli, progress upload, error retry, alt text wajib untuk foto informatif.
- Toast setelah operasi berhasil, konfirmasi untuk destructive actions, skeleton/loading untuk data lambat.
- Hanya gunakan komponen interactive yang benar-benar wired ke DB/server actions.
- Locale Indonesia, format tanggal dan nomor lokal, zona waktu Asia/Jakarta untuk tampilan, waktu disimpan UTC.
- Admin tablet dan mobile tetap usable; tabel boleh scroll horizontal dengan affordance, form satu kolom.
- Tampilan status konsisten, hindari merah untuk status positif, gunakan warna brand sebagai aksen saja.

---

## 10. KEAMANAN, PRIVASI, DAN KEPATUHAN

Wajib implementasi dan dokumentasi:

- Semua password hash kuat; jangan simpan plaintext; cookie session aman; otorisasi server-side per route/action.
- Validasi dan sanitasi seluruh input; cegah XSS/CSRF/SQL injection, IDOR, mass assignment, path traversal, SSRF pada URL remote.
- Rate limiting login, contact, application, upload; bot mitigation & honeypot.
- Content Security Policy/security headers realistis, HTTPS produksi, no open redirects, safe external links.
- File upload: type verification magic bytes, allowlist, size limit, sanitize filename, random object keys, safe image re-encoding, private vs public bucket policy, no script execution, no presigned URLs permanen untuk dokumen private.
- Hanya server menggunakan database/storage credentials; jangan expose secrets melalui `NEXT_PUBLIC_*`.
- Form pendaftaran mematuhi prinsip minimisasi data, persetujuan eksplisit, pemberitahuan tujuan penggunaan, batas akses, retensi, mekanisme permintaan hapus, dan log ekspor.
- Jangan simpan data kesehatan, paspor, NIK, KTP untuk kebutuhan awal tanpa desain keamanan/hukum khusus.
- Batasi upaya login dan ungkap pesan error login generik tanpa account enumeration.
- Tidak boleh memakai data pengunjung untuk analytics pihak ketiga tanpa pengungkapan/konfigurasi persetujuan yang sesuai.
- Publikasi dokumen izin/identitas perlu review konten. Cek izin, biaya, lowongan sesuai persyaratan peraturan terbaru; jangan membuat klaim sertifikasi, mitra kementerian, kerja sama resmi, atau jaminan kerja tanpa sumber yang dapat diverifikasi.
- Buat `SECURITY.md` berisi threat model sederhana, pemeriksaan, rekomendasi operational security, backup, dan prosedur pemulihan.

---

## 11. UX FORM PENDAFTARAN DAN KONTAK

Untuk `/daftar`:

- Heading `Pendaftaran Awal Calon Pekerja Migran Indonesia`.
- Jelaskan formulir ini adalah **pendaftaran minat awal** di website perusahaan, bukan pendaftaran/izin pemerintah dan bukan jaminan diterima/berangkat.
- Field minimal: nama, nomor HP/WhatsApp, email opsional, wilayah domisili, negara pilihan, pekerjaan/lowongan pilihan bila ada, pengalaman singkat opsional, pesan opsional, checkbox persetujuan kebijakan privasi wajib.
- Jika berasal dari detail lowongan/negara, country/job dipilih otomatis tetapi bisa dikoreksi jika valid.
- Submit via server ke DB, transaction, idempotency/rate-limit; response sukses berisi nomor referensi internal yang unik. Data tidak bocor di querystring/analytics.
- Setelah submit, tampilkan `Terima kasih, pendaftaran awal Anda sudah kami terima` dan langkah selanjutnya tanpa janji pasti.

Untuk `/kontak`:

- Nama, email/telepon, subjek, pesan, persetujuan.
- Kontak tersimpan di DB dan tampil di admin inbox. Nomor WhatsApp di footer hanya dipasang jika klien menyediakan nomor yang benar.

---

## 12. SEO, PERFORMANCE, AKSESIBILITAS

- Semantic HTML, heading H1 tunggal per halaman, landmark main/nav/footer, label form, proper focus rings, keyboard navigation, aria hanya bila perlu, accessible dialog/lightbox, kontras WCAG AA target.
- Responsive dan no horizontal overflow pada 390/768/1440.
- Gunakan `next/image`, image sizes, lazy load below fold, compression, CDN caching, preloading hero sesuai prioritas.
- Metadata per-page, OpenGraph/Twitter cards, structured data `Organization`/`LocalBusiness` hanya faktual; `JobPosting` hanya pada lowongan benar-benar aktif dan memenuhi properti diwajibkan oleh search engine.
- Sitemap dinamis (published pages/jobs/articles), robots.txt, canonical, proper 404, redirect slug update jika perlu.
- Hindari giant client bundles dan animasi berat, font optimization, ISR/revalidation cache setelah publish di CMS.
- Target praktis Lighthouse desktop/mobile yang baik; prioritaskan pengalaman perangkat jaringan sedang. Laporkan skor hasil pengujian sebenarnya, bukan klaim.
- Analytics hanya diaktifkan jika konfigurasi dan izin tersedia.

---

## 13. ROUTE ADMIN YANG WAJIB ADA

Minimal route berikut boleh dibangun dengan nested routes:

`/admin/login`, `/admin`, `/admin/halaman`, `/admin/halaman/[slug]`, `/admin/media`, `/admin/galeri`, `/admin/galeri/[id]`, `/admin/negara`, `/admin/negara/[id]`, `/admin/lowongan`, `/admin/lowongan/[id]`, `/admin/pendaftar`, `/admin/pendaftar/[id]`, `/admin/pesan`, `/admin/pesan/[id]`, `/admin/berita`, `/admin/berita/[id]`, `/admin/testimoni`, `/admin/pelatihan`, `/admin/layanan`, `/admin/tim`, `/admin/profil`, `/admin/alur`, `/admin/faq`, `/admin/legalitas`, `/admin/pengaturan`, `/admin/pengguna`, `/admin/aktivitas`, `/admin/profil-akun`.

Setiap halaman harus mempunyai fungsi yang sesuai. Jangan buat menu yang route-nya 404 atau tautan dummy. CRUD boleh menggunakan halaman/modal sesuai UX terbaik; daftar dan detail harus bisa diakses.

---

## 14. STRUKTUR FOLDER TARGET (SESUAIKAN DENGAN REPO)

```text
src/
  app/
    (public)/
      page.tsx
      tentang-kami/page.tsx
      layanan/page.tsx
      negara-tujuan/page.tsx
      negara-tujuan/[slug]/page.tsx
      lowongan/page.tsx
      lowongan/[slug]/page.tsx
      program-pelatihan/page.tsx
      legalitas/page.tsx
      galeri/page.tsx
      galeri/[slug]/page.tsx
      testimoni/page.tsx
      berita/page.tsx
      berita/[slug]/page.tsx
      faq/page.tsx
      kontak/page.tsx
      daftar/page.tsx
      kebijakan-privasi/page.tsx
      syarat-ketentuan/page.tsx
    admin/
      login/page.tsx
      (protected)/...
    api/
      contact/route.ts
      applications/route.ts
      admin/media/...
      health/route.ts
  components/
    public/ admin/ forms/ media/ ui/
  lib/
    auth/ db/ storage/ email/ validation/ permissions/ seo/
  server/
    actions/ queries/ services/
  styles/
prisma/
  schema.prisma
  migrations/
  seed.ts
public/
  brand/
  placeholders/
tests/
  unit/ integration/ e2e/
docs/
  SOURCE_OF_TRUTH.md
  DESIGN_RATIONALE.md
  CONTENT_VERIFICATION.md
  DEPLOYMENT.md
  ADMIN_GUIDE.md
  API_OVERVIEW.md
.env.example
README.md
docker-compose.yml
```

Tidak harus 100% sama jika pola repo lebih baik, tetapi separation of concerns dan keamanan harus dipertahankan.

---

## 15. MEDIA ASSET DAN BRANDING

- Ekstrak logo original dari PDF jika format layak; crop ulang/rasterize jika perlu, jangan salah menggambar ulang logo. Simpan juga original untouched.
- Foto kantor di PDF halaman 5, foto CEO halaman 4, foto tim halaman 8, dan portofolio halaman 9 dapat dijadikan aset **dengan izin klien**, setelah evaluasi resolusi dan sensitivitas. Jika resolusi jelek, jangan upscale berlebihan atau membuat ulang orang sebagai pegawai asli.
- Negara/bendera bisa memakai aset berlisensi yang dicatat asalnya; hindari hotlink acak. Jika belum ada foto asli, gunakan placeholder visual yang jelas dan admin dapat menggantinya.
- Pikirkan foto utama hero, thumbnail negara, cover galeri, artikel, logo/favicons/OG. Semua dari CMS kecuali identitas inti default.
- Jangan isi testimoni dan alumni dari nama atau gambar buatan pada screenshot AI.
- Pastikan tidak ada watermark, logo pihak ketiga yang tidak diizinkan, atau teks image generation gibberish pada halaman produksi.

---

## 16. MODE DEV, EMAIL, DAN STORAGE

- `docker compose up -d` menjalankan PostgreSQL + MinIO development.
- `.env.example` lengkap dengan komentar tanpa secret asli: `DATABASE_URL`, `AUTH_SECRET`, base URL, SMTP/Resend jika dipakai, S3 endpoint/bucket/credentials/public base, optional analytics, bootstrap variables.
- Seed idempotent, migration dijalankan dengan command documented, admin bootstrap one-time command.
- Media upload dev menggunakan MinIO, production S3-compatible provider, kedua mode semantik identik.
- Form contact/application tetap tersimpan jika SMTP belum diisi; di admin ada status `notificationNotConfigured` atau message yang tidak menyesatkan.
- Validasi env saat start dan pesan error konfigurasi yang actionable. Tidak perlu expose detail internal kepada pengunjung.
- Jangan implement fitur pura-pura bekerja melalui `alert()`, static arrays setelah seed, atau localStorage sebagai database utama.

---

## 17. KOMPONEN REUSABLE YANG PERLU DIBANGUN

Website publik: `SiteHeader`, `MobileNav`, `Hero`, `TrustStrip`, `SectionHeading`, `AboutPreview`, `ServiceCard`, `LegalityCard`, `DestinationCard`, `PlacementTimeline`, `TrainingPreview`, `TestimonialCard`, `GalleryPreview`, `FaqAccordion`, `ContactCTA`, `SiteFooter`, `JobCard`, `JobFilter`, `ApplicationForm`, `ContactForm`, `Breadcrumb`.

Admin: `AdminShell`, `Sidebar`, `Topbar`, `DashboardStat`, `DataTable`, `FilterBar`, `Pagination`, `MediaUploader`, `MediaPicker`, `MediaGrid`, `ImageCrop/FocalPoint`, `RichTextEditor`, `SlugField`, `SEOFields`, `StatusBadge`, `ConfirmDialog`, `PublicationControls`, `AuditTable`, `EmptyState`, `FormError`, `Toast`, `PermissionGuard` (tetap periksa permission server-side).

Prioritaskan refactor reusable yang tidak mengorbankan desain khusus public site. TypeScript types dan validasi harus konsisten.

---

## 18. TESTING WAJIB — JANGAN HANYA BERKATA 'SUDAH JALAN'

Buat tes minimal untuk:

1. Public homepage render semua section utama tanpa console errors.
2. Semua route publik valid, CTA header/footer menuju route benar.
3. Redirect `/admin` ke login tanpa session.
4. Login admin valid dan gagal, permission role, admin-only API.
5. Upload gambar valid sukses, file salah format/oversize ditolak.
6. Media library metadata CRUD dan relasi penghapusan aman.
7. Admin membuat/mengedit/memublikasikan negara; publik berubah sesuai publish.
8. Admin membuat lowongan draft (tidak muncul publik), publish (muncul), close/expire (tidak bisa daftar sebagai lowongan aktif).
9. Pendaftaran valid masuk database; spam/invalid ditolak; muncul pada admin.
10. Pesan kontak masuk DB, status berubah di admin.
11. Testimoni belum approved tidak ditampilkan publik.
12. Search/filter/pagination artikel, lowongan, media bekerja.
13. SEO metadata/sitemap hanya konten published.
14. Build, lint, typecheck, migration, seed idempotent tidak error.
15. Screenshot per viewport 1440, 768, 390 untuk homepage, lowongan, contact, admin dashboard, media upload. Periksa overflow, tap targets, typo, clipping.
16. A11y keyboard navigation dan focus untuk menu mobile, modal, lightbox, form.

Gunakan real browser tests (Playwright) bila environment mendukung. Bila browser tidak tersedia, lakukan tes maksimal dan tandai dengan jujur tes yang belum dijalankan.

---

## 19. KUALITAS INTERAKSI DAN ERROR HANDLING

- Loading, error, success, empty, no-data, no-search-result, and offline/timeout states dibuat nyata untuk setiap CRUD penting.
- Optimistic updates hanya bila ada rollback saat gagal.
- Pagination tidak meng-fetch seluruh dataset untuk setiap halaman.
- Semua form punya double-submit prevention; toast hanya setelah server confirmed.
- Server logs informatif tetapi tidak mengandung password, session token, atau konten PII mentah.
- Batasi jumlah upload concurrent, tampilkan retry yang aman.
- Persist admin upload dan published state setelah server restart/redeploy.
- URL shareable untuk lowongan/negara/artikel, slugs stabil, canonical dan redirect sesuai kebutuhan.
- Dekorasi tidak mengurangi keterbacaan, jangan membuat teks di atas foto tanpa overlay kontras yang cukup.

---

## 20. DOKUMENTASI DAN HANDOFF

Wajib buat:

- `README.md` dengan deskripsi fitur, command install, env, database, storage, seed, dev server, test, build, dan troubleshooting.
- `docs/ADMIN_GUIDE.md`: cara login, ganti password, upload foto, mengatur hero, membuat album, memasukkan lowongan, menonaktifkan lowongan, memeriksa pendaftar, membaca pesan, memperbarui legalitas, publish artikel, mengubah kontak, serta backup.
- `docs/DEPLOYMENT.md`: prosedur production setup, DNS, SSL, database migration, object storage CORS/access, env vars, bootstrap admin, health checks, monitoring, backup/restore, rollback.
- `docs/SOURCE_OF_TRUTH.md`: data dan sumber verifikasi.
- `docs/CONTENT_VERIFICATION.md`: konten yang belum disetujui klien (nama direktur/ejaan, dokumen perizinan, alamat prioritas, WhatsApp, foto kantor/resolusi, testimoni, lowongan/biaya).
- `docs/DESIGN_RATIONALE.md`: bagaimana referensi nyata dan gambar mockup diadaptasi.
- `SECURITY.md`: kontrol keamanan yang sudah diimplementasikan dan batasannya.
- `docs/API_OVERVIEW.md`: daftar route handlers/server actions penting dan otorisasi.
- Contoh tangkapan layar hasil nyata di folder `artifacts/screenshots/` bila bisa dibuat.

---

## 21. LANGKAH EKSEKUSI CODING (KERJAKAN BERURUTAN)

**Fase A — Inspect dan fondasi**: periksa repo dan aset, tentukan rancangan final, tulis catatan sumber, setup Next+TypeScript, database/storage, tokens, branding, layout responsif.

**Fase B — Schema dan keamanan**: implement Prisma models, migrations, seed, authentication, role-based authorization, validasi, storage adapter, audit helper.

**Fase C — Public pages**: implement homepage semua section, halaman profil lengkap, negara, lowongan, legalitas, galeri, pelatihan, berita, testimoni, FAQ, kontak, daftar, privasi dan syarat.

**Fase D — CMS admin**: admin shell, dashboard query riil, media uploader, CRUD page sections dan settings, CRUD negara/lowongan/galeri, artikel/tim/testimoni/pelatihan/legalitas, inbox pendaftar/pesan, roles.

**Fase E — Integrasi**: sambungkan semua halaman publik ke data CMS, alur submit nyata, image storage, cache revalidation, email adapter, SEO.

**Fase F — QA dan perbaikan**: jalankan lint/typecheck/unit/integration/e2e/build; inspeksi screenshot viewport; benahi semua error. Cek tidak ada menu palsu, teks placeholder, data demo di production.

**Fase G — Handoff**: dokumentasi lengkap dan laporan final berisi implementasi yang benar-benar selesai, file yang dibuat/diubah, test yang dijalankan beserta hasil, kebutuhan env, cara menjalankan, cara login admin melalui bootstrap aman, serta pekerjaan eksternal yang tersisa karena belum ada kredensial/aset.

Setiap fase harus menghasilkan kode working. **Jangan berhenti di fase A lalu meminta izin melanjutkan** bila tidak ada blocker sungguhan. Jangan menghabiskan waktu mengulang rencana tanpa implementasi.

---

## 22. KRITERIA PENERIMAAN FINAL (DEFINITION OF DONE)

Jangan sebut selesai sebelum **semua** ini benar:

- [ ] Landing page mengikuti mockup dan brand MPU, seluruh section 5.1–5.14 ada atau disembunyikan hanya karena data asli belum tersedia (dengan logika CMS yang tepat).
- [ ] Public site responsive desktop/tablet/mobile, bukan gambar statis atau device mockup.
- [ ] About memuat CEO/visi/misi/nilai/tim/portofolio/rencana pengembangan dari PDF.
- [ ] Semua halaman/routing bagian 4 bekerja dan punya tampilan premium konsisten.
- [ ] Admin bisa login secara aman; role dan session berjalan.
- [ ] Dashboard angka dari database nyata, tidak hardcoded.
- [ ] Admin benar-benar dapat upload foto/video/dokumen, preview, edit alt/caption, memilih, mengganti, dan menghapus media dengan aturan relasi.
- [ ] Galeri dan album tersimpan permanen dan tampil di situs publik.
- [ ] Admin dapat update hero, semua homepage section, teks profil, logo, kontak, SEO, footer.
- [ ] Negara dan lowongan CRUD + publish/draft/close + filter publik tersinkron.
- [ ] Pendaftaran calon PMI dan pesan kontak disimpan database dan muncul di admin.
- [ ] Privasi, izin, dan data kandidat tidak terekspos publik.
- [ ] Artikel/FAQ/testimoni/tim/pelatihan/legalitas memiliki CMS yang berfungsi.
- [ ] Data yang belum diverifikasi tidak ditampilkan sebagai fakta; tidak ada alumni, statistik, izin, atau lowongan fiktif.
- [ ] Test unit/integration/e2e berjalan sejauh lingkungan memungkinkan dan hasil dicantumkan secara jujur.
- [ ] Lint + typecheck + build lolos; migrations dan seed dapat dijalankan ulang.
- [ ] `.env.example`, README, Admin Guide, Deployment, Source of Truth, Content Verification lengkap.
- [ ] Seluruh CTA dan menu mempunyai tujuan/aksi nyata; tidak ada `href="#"`, dummy form submission, fake upload, atau `alert('success')`.
- [ ] Tidak ada secret di client, storage media production persistent, database bukan localStorage.

---

## 23. FORMAT LAPORAN FINAL DARI CODEX

Di akhir implementasi, jawab dalam bahasa Indonesia dengan format:

1. **Ringkasan**: apa saja yang dibangun.
2. **Website Publik**: daftar halaman dan section yang berfungsi.
3. **Admin Dashboard**: daftar fitur CRUD dan upload nyata.
4. **Tech Stack & Database**: library/framework/DB/storage yang benar-benar digunakan.
5. **Cara Menjalankan**: command persis dan env yang harus disiapkan.
6. **Akses Admin**: prosedur aman membuat akun admin; jangan cetak password di chat/log.
7. **Bukti QA**: command + hasil lint/typecheck/build/tests/screenshots.
8. **Belum Tuntas / Membutuhkan Klien**: kredensial storage/email, foto asli, kontak WhatsApp, verifikasi nomor izin, testimoni nyata, lowongan aktif, dsb. Jangan sembunyikan blocker.

**Mulai sekarang. Audit repository dan materi yang tersedia, kemudian implementasikan aplikasi lengkap sampai semua kriteria selesai. Prioritaskan tindakan dan kode working.**

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
