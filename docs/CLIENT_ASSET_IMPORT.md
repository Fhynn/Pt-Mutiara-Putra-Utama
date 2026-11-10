# Impor Aset Klien

Seluruh 55 media pada folder `drive-download-20261105T084821Z-1-001` diinventarisasi dan dicatat di Media Library.

- Foto kegiatan yang tidak memperlihatkan dokumen pribadi dioptimalkan ke WebP, dibersihkan dari metadata EXIF, dan dikelompokkan ke album berdasarkan kantor/cabang.
- Foto yang memperlihatkan paspor, tiket, atau dokumen kandidat disimpan sebagai metadata media `PRIVATE` dan tidak memiliki URL publik.
- Video MP4 disimpan sebagai `PRIVATE` sampai konteks, audio, dan izin subjek ditinjau.
- File HEIC dicatat sebagai `PRIVATE` karena decoder HEVC tidak tersedia di lingkungan build.
- Sembilan foto pilihan lama tetap digunakan dengan URL semantik agar tautan homepage tidak berubah.

Jalankan impor idempoten dengan:

```bash
npm run assets:import-all
```

Script membutuhkan `DATABASE_URL`. Media publik lokal disimpan di `public/client/library`; deployment produksi tetap disarankan memindahkan media ke R2/S3 melalui Media Library.
