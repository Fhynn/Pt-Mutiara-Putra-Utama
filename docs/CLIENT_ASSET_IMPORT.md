# Impor Aset Klien

Seluruh 55 media pada folder `drive-download-20261105T084821Z-1-001` diinventarisasi dan dicatat di Media Library. File foto publik kini juga tersimpan di bucket publik Neon; database menyimpan alamat dan keterkaitannya dengan album/halaman.

- Foto kegiatan yang tidak memperlihatkan dokumen pribadi dioptimalkan ke WebP, dibersihkan dari metadata EXIF, dan dikelompokkan ke album berdasarkan kantor/cabang.
- Foto yang memperlihatkan paspor, tiket, atau dokumen kandidat disimpan di bucket privat Neon dan tidak memiliki URL publik.
- Video MP4 disimpan sebagai `PRIVATE` sampai konteks, audio, dan izin subjek ditinjau.
- File HEIC dicatat sebagai `PRIVATE` karena decoder HEVC tidak tersedia di lingkungan build.
- Foto pilihan yang dipakai Beranda, Tentang, dan Pelatihan dibaca melalui URL yang tercatat di database.

Jalankan impor idempoten dengan:

```bash
npm run assets:import-all
```

Setelah impor, pindahkan berkas publik yang masih dilayani dari folder website ke bucket publik Neon dengan `npm run assets:migrate-public`, lalu sinkronkan berkas privat ke bucket privat Neon dengan:

```bash
npm run assets:sync-private
```

Script membutuhkan `DATABASE_URL` dan konfigurasi penyimpanan objek. Salinan di `public/client/library` tetap tersedia sebagai cadangan build; sumber utama foto yang tercatat di Media Library adalah Neon Object Storage. Berkas privat dapat diperiksa di dashboard admin, lalu dijadikan publik satu per satu jika memang layak dan diizinkan.
