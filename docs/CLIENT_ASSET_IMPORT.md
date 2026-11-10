# Impor Aset Klien

Seluruh 55 media pada folder `drive-download-20261105T084821Z-1-001` diinventarisasi dan dicatat di Media Library.

- Foto kegiatan yang tidak memperlihatkan dokumen pribadi dioptimalkan ke WebP, dibersihkan dari metadata EXIF, dan dikelompokkan ke album berdasarkan kantor/cabang.
- Foto yang memperlihatkan paspor, tiket, atau dokumen kandidat disimpan di bucket privat Neon dan tidak memiliki URL publik.
- Video MP4 disimpan sebagai `PRIVATE` sampai konteks, audio, dan izin subjek ditinjau.
- File HEIC dicatat sebagai `PRIVATE` karena decoder HEVC tidak tersedia di lingkungan build.
- Sembilan foto pilihan lama tetap digunakan dengan URL semantik agar tautan homepage tidak berubah.

Jalankan impor idempoten dengan:

```bash
npm run assets:import-all
```

Setelah impor, sinkronkan berkas privat ke bucket privat Neon dengan:

```bash
npm run assets:sync-private
```

Script membutuhkan `DATABASE_URL` dan konfigurasi penyimpanan objek. Media publik yang sudah dipilih tetap berada di `public/client/library`. Berkas privat dapat diperiksa di dashboard admin, lalu dijadikan publik satu per satu jika memang layak dan diizinkan.
