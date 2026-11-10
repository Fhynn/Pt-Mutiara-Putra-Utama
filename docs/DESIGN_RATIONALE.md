# Design Rationale

Mockup MPU menjadi acuan utama untuk urutan hero, trust facts, profil, layanan, legalitas, negara, alur, pelatihan, testimoni, CTA, dan footer. Implementasi mempertahankan navy-merah MPU, tetapi mengurangi kepadatan kartu, memperbesar whitespace, memakai grid editorial, dan menambahkan empty state agar data yang belum terverifikasi tidak diganti konten fiktif.

Riset 5 November 2026:

- Jobstacular: penekanan cepat pada peluang internasional dan kredibilitas; diterapkan sebagai hero + trust facts + CTA terpisah.
- LPK Brata: negara tujuan, benefit program, dan tahapan proses mudah dipindai; diterapkan pada kartu negara dan timeline responsif.
- Placed International: headline editorial dan pemisahan jalur kandidat/pemberi kerja; diterapkan pada hierarki hero dan CTA.
- Intora: situs tidak dapat dimuat konsisten dari lingkungan riset, sehingga tidak diklaim telah diinspeksi visual.
- Website MPU existing: sumber struktur layanan, negara, dan kanal kontak; fakta sensitif tetap diperiksa silang.

Design system memakai Archivo untuk headline, Source Sans 3 untuk body, deep navy `#111C52`, blue `#1A4D86`, red `#C4192D`, off-white, serta Lucide untuk ikon. Motion dibatasi dan menghormati `prefers-reduced-motion`. Desktop memakai container maksimum sekitar 1240px; timeline, grid galeri, navigasi, dan tabel admin memiliki fallback tablet/mobile.
