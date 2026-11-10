import "dotenv/config";
import { stat } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL wajib diisi sebelum menjalankan seed.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const navigation = [
  ["Beranda", "/", 0],
  ["Tentang", "/tentang-kami", 1],
  ["Layanan", "/layanan", 2],
  ["Negara Tujuan", "/negara-tujuan", 3],
  ["Lowongan", "/lowongan", 4],
  ["Legalitas", "/legalitas", 5],
  ["Galeri", "/galeri", 6],
  ["Kontak", "/kontak", 7]
] as const;

const services = [
  [
    "Sosialisasi",
    "sosialisasi",
    "MessageCircle",
    "Informasi awal mengenai peluang, tahapan, hak, kewajiban, dan risiko penempatan ke luar negeri."
  ],
  [
    "Rekrutmen",
    "rekrutmen",
    "SearchCheck",
    "Penyaringan calon pekerja berdasarkan kebutuhan program dan ketentuan yang berlaku."
  ],
  [
    "Pelatihan",
    "pelatihan",
    "BookOpenCheck",
    "Persiapan bahasa, keterampilan kerja, etika, budaya, dan dokumen melalui program yang sesuai."
  ],
  [
    "Penempatan",
    "penempatan",
    "PlaneTakeoff",
    "Pendampingan proses penempatan yang legal, aman, dan mengikuti peraturan yang berlaku."
  ]
] as const;

const steps = [
  ["Konsultasi & Sosialisasi", "MessageCircle"],
  ["Registrasi & Verifikasi Dokumen", "ClipboardCheck"],
  ["Seleksi & Rekrutmen", "UsersRound"],
  ["Pelatihan & Persiapan", "BookOpenCheck"],
  ["Wawancara, Pemeriksaan Kesehatan & Administrasi", "Stethoscope"],
  ["Keberangkatan & Pendampingan", "PlaneTakeoff"]
] as const;

const sharedDocumentRequirements = [
  "Kartu Tanda Penduduk (KTP)",
  "Kartu Keluarga (KK)",
  "Akta kelahiran",
  "Ijazah",
  "Surat keterangan status pernikahan",
  "Surat izin keluarga yang diketahui Kepala Desa/Lurah",
  "Paspor lama, bagi yang sudah pernah memiliki paspor"
];

const countries = [
  {
    name: "Taiwan",
    slug: "taiwan",
    isoCode: "TW",
    summary:
      "Pilihan pekerjaan yang diinformasikan MPU meliputi perawatan lansia, asisten rumah tangga, pabrik, nelayan, serta ABK (anak buah kapal). Ketersediaan program perlu dikonfirmasi.",
    programDescription:
      "Rangkuman ini mengikuti informasi persyaratan Taiwan yang pernah dipublikasikan MPU. Konfirmasikan ketersediaan program, biaya, dan rincian kontrak kepada petugas sebelum memulai proses.",
    criteria: [
      "Warga Negara Indonesia (WNI)",
      "Pria atau wanita",
      "Usia 20–40 tahun",
      "Tinggi badan minimal 165 cm untuk pria dan 155 cm untuk wanita",
      "Berat badan proporsional/ideal",
      "Pendidikan minimal SD/sederajat"
    ],
    requirements: [
      ...sharedDocumentRequirements,
      "Surat Keterangan Catatan Kepolisian (dapat menyusul)"
    ],
    salaryDetails: [
      "NT$20.000 (sekitar Rp11.000.000) — sektor informal",
      "NT$25.000 (sekitar Rp14.000.000) — sektor formal"
    ],
    informalSectorInfo: "Penjaga jompo/lansia, orang sakit, dan asisten rumah tangga.",
    formalSectorInfo:
      "Pabrik, nelayan, dan ABK (anak buah kapal). Rincian pekerjaan di kapal mengikuti program terkait.",
    sectors: [
      "ABK (anak buah kapal)",
      "Perawatan lansia",
      "Asisten rumah tangga",
      "Pabrik",
      "Nelayan"
    ]
  },
  {
    name: "Hong Kong",
    slug: "hong-kong",
    isoCode: "HK",
    summary:
      "Informasi MPU mencantumkan sektor informal untuk penjaga anak/bayi dan asisten rumah tangga. Sektor formal belum tersedia pada sumber yang diperiksa.",
    programDescription:
      "Rangkuman ini mengikuti informasi persyaratan Hong Kong yang pernah dipublikasikan MPU. Konfirmasikan ketersediaan program, biaya, dan rincian kontrak kepada petugas sebelum memulai proses.",
    criteria: [
      "Warga Negara Indonesia (WNI)",
      "Wanita",
      "Usia 21–35 tahun",
      "Tinggi badan minimal 155 cm",
      "Berat badan proporsional/ideal",
      "Pendidikan minimal SD/sederajat",
      "Diutamakan memiliki pengalaman kerja luar negeri, seperti Taiwan, Singapura, atau Hong Kong"
    ],
    requirements: sharedDocumentRequirements,
    salaryDetails: ["HK$5.100 (sekitar Rp11.000.000) — sektor informal"],
    informalSectorInfo: "Penjaga anak/bayi dan asisten rumah tangga.",
    formalSectorInfo: "Belum tersedia pada informasi MPU yang diperiksa.",
    sectors: ["Penjaga anak/bayi", "Asisten rumah tangga"]
  },
  {
    name: "Singapura",
    slug: "singapura",
    isoCode: "SG",
    summary:
      "Informasi MPU mencantumkan sektor informal untuk penjaga anak/bayi dan asisten rumah tangga. Sektor formal belum tersedia pada sumber yang diperiksa.",
    programDescription:
      "Rangkuman ini mengikuti informasi persyaratan Singapura yang pernah dipublikasikan MPU. Konfirmasikan ketersediaan program, biaya, dan rincian kontrak kepada petugas sebelum memulai proses.",
    criteria: [
      "Warga Negara Indonesia (WNI)",
      "Wanita",
      "Usia 23–35 tahun",
      "Tinggi badan minimal 150 cm",
      "Berat badan proporsional/ideal",
      "Pendidikan minimal SMP/sederajat"
    ],
    requirements: sharedDocumentRequirements,
    salaryDetails: ["SGD550 (sekitar Rp8.000.000) — sektor informal"],
    informalSectorInfo: "Penjaga anak/bayi dan asisten rumah tangga.",
    formalSectorInfo: "Belum tersedia pada informasi MPU yang diperiksa.",
    sectors: ["Penjaga anak/bayi", "Asisten rumah tangga"]
  },
  {
    name: "Malaysia",
    slug: "malaysia",
    isoCode: "MY",
    summary:
      "Pilihan pekerjaan yang diinformasikan MPU meliputi penjaga anak/bayi, perawatan lansia, asisten rumah tangga, konstruksi, dan pekerja kebun sawit atau karet.",
    programDescription:
      "Rangkuman ini mengikuti informasi persyaratan Malaysia yang pernah dipublikasikan MPU. Konfirmasikan ketersediaan program, biaya, dan rincian kontrak kepada petugas sebelum memulai proses.",
    criteria: [
      "Warga Negara Indonesia (WNI)",
      "Wanita",
      "Usia 21–40 tahun",
      "Tinggi badan minimal 145 cm",
      "Berat badan proporsional/ideal",
      "Pendidikan minimal SD/sederajat"
    ],
    requirements: sharedDocumentRequirements,
    salaryDetails: ["RM1.500 (sekitar Rp7.000.000) — sektor informal"],
    informalSectorInfo: "Penjaga anak/bayi, perawatan lansia, dan asisten rumah tangga.",
    formalSectorInfo:
      "Konstruksi dan pekerjaan kebun sawit/karet diinformasikan klien. Klasifikasi sektor serta rincian kontrak mengikuti program terkait.",
    sectors: [
      "Konstruksi",
      "Pekerja kebun sawit/karet",
      "Penjaga anak/bayi",
      "Perawatan lansia",
      "Asisten rumah tangga"
    ]
  },
  {
    name: "Brunei Darussalam",
    slug: "brunei-darussalam",
    isoCode: "BN",
    summary:
      "MPU menginformasikan pilihan pekerjaan sektor formal di Brunei Darussalam, termasuk konstruksi dan pembuatan kue. Rincian program dan ketersediaan lowongan perlu dikonfirmasi kepada petugas.",
    programDescription:
      "Informasi awal dari revisi klien 10 November 2026. Kriteria, dokumen, gaji, biaya, dan kontrak akan dijelaskan sesuai program yang berlaku.",
    criteria: [],
    requirements: [],
    salaryDetails: [],
    informalSectorInfo: "Tidak disebutkan dalam informasi yang diberikan klien.",
    formalSectorInfo: "Konstruksi, pembuatan kue, dan bidang formal lain sesuai program.",
    sectors: ["Konstruksi", "Pembuat kue"]
  }
] as const;

const faqs = [
  [
    "Pendaftaran",
    "Bagaimana cara melakukan pendaftaran online?",
    "Isi formulir CPMI di website dengan data diri, pengalaman kerja, dan satu foto. Tim MPU akan memeriksa pendaftaran dan menghubungi Anda untuk informasi tahap berikutnya. Formulir ini bukan jaminan diterima atau diberangkatkan."
  ],
  [
    "Dokumen",
    "Dokumen apa yang perlu disiapkan?",
    "Daftar dokumen ditampilkan pada halaman masing-masing negara. Umumnya meliputi KTP, KK, akta kelahiran, ijazah, surat status pernikahan, surat izin keluarga, dan paspor lama bila pernah memiliki. Dokumen disiapkan untuk verifikasi tahap lanjutan dan diserahkan melalui petugas serta kanal resmi MPU setelah ada arahan."
  ],
  [
    "Proses",
    "Berapa lama proses penempatan?",
    "Durasi bergantung pada negara, pemberi kerja, kelengkapan dokumen, pelatihan, pemeriksaan, dan persetujuan instansi. MPU tidak menjanjikan tanggal keberangkatan sebelum seluruh persyaratan selesai."
  ],
  [
    "Negara",
    "Negara tujuan apa yang tersedia?",
    "Taiwan, Hong Kong, Singapura, Malaysia, dan Brunei Darussalam tersedia sebagai pilihan minat awal. Status program dan lowongan aktif harus dikonfirmasi pada halaman lowongan atau kepada petugas MPU."
  ],
  [
    "Biaya",
    "Berapa biaya proses penempatan?",
    "Rincian biaya harus mengacu pada program, negara, pemberi kerja, dan ketentuan terbaru. Mintalah rincian tertulis dari petugas dan jangan melakukan pembayaran ke rekening pribadi yang tidak terverifikasi."
  ],
  [
    "Legalitas",
    "Bagaimana memverifikasi status P3MI?",
    "Gunakan tautan resmi SISKOP2MI pada halaman Legalitas dan cocokkan nama, alamat, serta status perusahaan sebelum mendaftar."
  ]
] as const;

const mediaSeeds = [
  [
    "hero-training.webp",
    "Kegiatan kelas dan persiapan calon pekerja di kantor cabang MPU",
    "pelatihan"
  ],
  ["about-office.webp", "Tampak depan kantor cabang PT Mutiara Putra Utama", "kantor"],
  ["training-class.webp", "Kegiatan belajar di ruang kelas", "pelatihan"],
  ["gallery-team.webp", "Tim MPU dalam kegiatan internal", "tim"],
  ["gallery-office-sragen.webp", "Tampak depan kantor MPU cabang Sragen", "kantor"],
  ["gallery-training-sragen.webp", "Kegiatan pelatihan keterampilan di cabang Sragen", "pelatihan"],
  ["gallery-briefing.webp", "Kegiatan pengarahan di kantor cabang Sragen", "kegiatan"],
  ["gallery-training-legok.webp", "Kegiatan kelas di cabang Legok", "pelatihan"],
  ["gallery-partner.webp", "Pertemuan dengan perwakilan mitra", "kegiatan"]
] as const;

const privacyPolicy = `Data yang dikumpulkan
Formulir pendaftaran CPMI meminta negara tujuan, sektor, nama, NIK, tempat dan tanggal lahir, jenis kelamin, status pernikahan, agama, tinggi dan berat badan, alamat lengkap, kontak, pengalaman kerja, serta satu foto diri. Formulir kontak mengumpulkan data yang Anda isikan di sana.

Tujuan penggunaan
Data digunakan untuk memeriksa pendaftaran, menyesuaikan informasi program dan persyaratan, serta menghubungi Anda mengenai tahapan yang relevan. NIK disimpan terenkripsi dan foto berada di penyimpanan privat. Akses dibatasi kepada petugas berwenang.

Dokumen pribadi
Formulir hanya meminta nomor NIK dan foto diri, bukan unggahan foto KTP, KK, paspor, atau hasil medis. Jangan mengirim dokumen tersebut melalui kolom pesan. Penyerahan dokumen tahap lanjutan dilakukan melalui petugas dan saluran resmi MPU.

Masa simpan
Pendaftaran yang tidak dilanjutkan dan tidak mengalami aktivitas selama 12 bulan akan dihapus data pribadinya, termasuk NIK dan foto. Nomor referensi tanpa identitas dapat tetap disimpan sebagai catatan audit. Pendaftaran yang masih diproses disimpan selama diperlukan untuk tahapan tersebut.

Akses dan permintaan data
Akses data dibatasi kepada petugas berwenang. Permintaan koreksi atau penghapusan dapat diajukan melalui kontak resmi perusahaan.`;

const terms = `Pendaftaran melalui website
Pengisian formulir CPMI tidak menjamin diterima, memperoleh visa, ditempatkan, atau diberangkatkan.

Informasi program
Persyaratan negara, gaji, biaya, jadwal, kuota, dan sektor pekerjaan dapat berubah. Kontrak kerja serta dokumen resmi menjadi acuan utama.

Tanggung jawab pengguna
Berikan informasi yang benar dan jangan mengirim dokumen sensitif melalui kolom pesan atau kepada pihak yang tidak terverifikasi.

Lowongan dan pembayaran
Pastikan lowongan berstatus aktif, mintalah rincian biaya tertulis, dan lakukan pembayaran hanya melalui saluran resmi yang telah diverifikasi.`;

const galleryDescriptions = [
  ["profil-perusahaan", "Foto profil dan dokumentasi perusahaan."],
  ["agency-kerja-sama", "Dokumentasi pertemuan dan kegiatan bersama mitra."],
  ["cabang-kebumen", "Dokumentasi kantor PT Mutiara Putra Utama Cabang Kebumen."],
  ["cabang-legok", "Dokumentasi kegiatan PT Mutiara Putra Utama Cabang Legok."],
  ["cabang-sragen", "Dokumentasi kegiatan PT Mutiara Putra Utama Cabang Sragen."],
  ["kegiatan-pt-pusat", "Dokumentasi kegiatan di kantor pusat PT Mutiara Putra Utama."]
] as const;

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      primaryEmail: "mpu_setu@yahoo.com",
      alternateEmail: null,
      privacyPolicy,
      terms
    },
    create: {
      id: "default",
      legalName: "PT. MUTIARA PUTRA UTAMA",
      brandName: "MPU Employment Agency",
      tagline: "Penempatan Pekerja Migran Indonesia yang legal, aman, dan profesional",
      primaryEmail: "mpu_setu@yahoo.com",
      alternateEmail: null,
      phone: "021-82740059",
      address:
        "Jl. KH Sanip No. 42, Kp. Bubulak, Bojong Kulur, Gunung Putri, Kabupaten Bogor, Jawa Barat",
      logoUrl: "/brand/mpu-logo.png",
      defaultMetaTitle: "PT Mutiara Putra Utama | P3MI",
      defaultMetaDescription:
        "Informasi resmi layanan, negara tujuan, lowongan, legalitas, dan pendaftaran awal PT Mutiara Putra Utama.",
      privacyPolicy,
      terms
    }
  });

  for (const [label, href, order] of navigation) {
    const existing = await prisma.navigationItem.findFirst({ where: { href, location: "HEADER" } });
    if (existing) {
      await prisma.navigationItem.update({
        where: { id: existing.id },
        data: { label, displayOrder: order }
      });
    } else {
      await prisma.navigationItem.create({
        data: { label, href, displayOrder: order, location: "HEADER" }
      });
    }
  }

  const home = await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      title: "Beranda",
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "PT Mutiara Putra Utama | Penempatan PMI",
      metaDescription:
        "Pendampingan penempatan Pekerja Migran Indonesia dengan informasi legalitas, program, dan proses yang transparan."
    }
  });

  const sections = [
    [
      "hero",
      1,
      {
        eyebrow: "PT. MUTIARA PUTRA UTAMA — EMPLOYMENT AGENCY",
        title: "Penempatan Pekerja Migran Indonesia yang Legal, Aman, dan Profesional",
        body: "Kami mendampingi calon pekerja memahami proses, persyaratan, dan pilihan program secara jelas tanpa menjanjikan keberangkatan sebelum seluruh ketentuan dipenuhi.",
        primaryLabel: "Konsultasi Sekarang",
        primaryHref: "/kontak",
        secondaryLabel: "Lihat Lowongan",
        secondaryHref: "/lowongan",
        image: "/client/hero-training.webp"
      }
    ],
    [
      "quick-facts",
      2,
      {
        items: [
          "Berdiri sejak 1998",
          "Status aktif di SISKOP2MI",
          "Kantor pusat di Bogor",
          "Pendampingan proses penempatan"
        ]
      }
    ],
    [
      "about",
      3,
      {
        title: "Berpengalaman mendampingi proses penempatan sejak 1998",
        body: "PT Mutiara Putra Utama bergerak di bidang layanan penempatan dan rekrutmen tenaga kerja Indonesia untuk kebutuhan internasional pada sektor formal, semi-formal, dan informal.",
        image: "/client/about-office.webp"
      }
    ],
    [
      "final-cta",
      12,
      {
        title: "Siap Memulai Karier ke Luar Negeri?",
        body: "Mulai dengan konsultasi dan pahami program yang tersedia. Pendaftaran awal tidak menjamin penerimaan atau keberangkatan.",
        primaryLabel: "Hubungi Kami",
        primaryHref: "/kontak",
        secondaryLabel: "Daftar Online",
        secondaryHref: "/daftar"
      }
    ]
  ] as const;

  for (const [key, displayOrder, content] of sections) {
    await prisma.pageSection.upsert({
      where: { pageId_key: { pageId: home.id, key } },
      update: {},
      create: {
        pageId: home.id,
        key,
        displayOrder,
        content,
        status: "PUBLISHED",
        publishedAt: new Date()
      }
    });
  }

  for (const [title, slug, icon, description] of services) {
    await prisma.service.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        icon,
        description,
        href: `/layanan#${slug}`,
        status: "PUBLISHED",
        displayOrder: services.findIndex((item) => item[1] === slug)
      }
    });
  }

  for (const [title, icon] of steps) {
    const existing = await prisma.placementStep.findFirst({ where: { title } });
    if (!existing)
      await prisma.placementStep.create({
        data: {
          title,
          icon,
          status: "PUBLISHED",
          displayOrder: steps.findIndex((item) => item[0] === title)
        }
      });
  }

  for (const [index, country] of countries.entries()) {
    const countryData = {
      name: country.name,
      isoCode: country.isoCode,
      summary: country.summary,
      programDescription: country.programDescription,
      criteria: [...country.criteria],
      requirements: [...country.requirements],
      salaryDetails: [...country.salaryDetails],
      informalSectorInfo: country.informalSectorInfo,
      formalSectorInfo: country.formalSectorInfo,
      sectors: [...country.sectors],
      requirementsDisclaimer: null,
      requirementsSourceUrl: null,
      requirementsReviewedAt: null,
      programStatus: "MORE_INFO" as const,
      status: "PUBLISHED" as const,
      isFeatured: true,
      displayOrder: index
    };
    await prisma.country.upsert({
      where: { slug: country.slug },
      update: countryData,
      create: {
        ...countryData,
        slug: country.slug,
        publishedAt: new Date()
      }
    });
  }

  for (const [name, description, icon, order] of [
    ["Fast", "Responsif dalam penyampaian informasi dan tindak lanjut proses.", "Zap", 0],
    ["Reliable", "Mengutamakan ketepatan informasi, prosedur, dan dokumentasi.", "ShieldCheck", 1],
    [
      "Experienced",
      "Berpengalaman dalam layanan ketenagakerjaan internasional sejak 1998.",
      "Award",
      2
    ]
  ] as const) {
    await prisma.companyValue.upsert({
      where: { name },
      update: {},
      create: { name, description, icon, displayOrder: order }
    });
  }

  await prisma.companyProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      history:
        "PT Mutiara Putra Utama didirikan berdasarkan Akta Notaris No. 17 tanggal 1 Oktober 1998 dan menjalankan layanan penempatan tenaga kerja Indonesia untuk kebutuhan internasional.",
      directorName: "Martua Ritonga, SE",
      directorTitle: "Direktur Utama",
      directorMessage:
        "Kami berupaya menyediakan layanan yang sesuai dengan kebutuhan calon pekerja dan mitra melalui pengetahuan serta pengalaman di bidang ketenagakerjaan.",
      directorPhoto: "/client/director-martua-2026.png",
      vision: [
        "Menjadi perusahaan penempatan yang bereputasi dan turut memperkuat perekonomian nasional.",
        "Berkontribusi pada peningkatan kualitas pekerja Indonesia.",
        "Menerapkan pengelolaan berwawasan global untuk pelayanan dan pelindungan pekerja migran."
      ],
      mission: [
        "Mengembangkan pusat informasi ketenagakerjaan yang terintegrasi.",
        "Meningkatkan peluang dan mekanisme penempatan melalui koordinasi dengan pihak terkait.",
        "Membangun organisasi dan SDM profesional untuk menghasilkan calon pekerja berkualitas global."
      ],
      teamSummary:
        "Tim MPU memiliki pengalaman dalam memahami kebutuhan calon pekerja dan mitra serta membantu menyiapkan solusi proses yang sesuai.",
      portfolioFields: ["Pertanian", "Industri", "Konstruksi", "Jasa", "Perhotelan", "Perawatan"],
      developmentPlans: [
        "Peningkatan profesionalisme pimpinan dan staf",
        "Perluasan jaringan pemasaran",
        "Pengembangan hubungan dengan mitra luar negeri",
        "Peningkatan kualitas calon pekerja",
        "Penguatan konseling dan informasi"
      ]
    }
  });

  await prisma.legalDocument.upsert({
    where: { id: "siskop2mi-966" },
    update: {},
    create: {
      id: "siskop2mi-966",
      title: "Status P3MI pada SISKOP2MI",
      permitType: "Nomor izin pada profil SISKOP2MI",
      permitNumber: "0220100361829",
      description: "Profil resmi menampilkan PT Mutiara Putra Utama dengan status Aktif.",
      sourceUrl: "https://siskop2mi.bp2mi.go.id/profil/lembaga/detail/966/p3mi",
      sourceLabel: "SISKOP2MI",
      verifiedAt: new Date("2026-11-05T00:00:00.000Z"),
      needsReview: false,
      status: "PUBLISHED",
      displayOrder: 0
    }
  });

  await prisma.legalDocument.upsert({
    where: { id: "akta-17-1998" },
    update: {},
    create: {
      id: "akta-17-1998",
      title: "Akta Pendirian",
      permitType: "Akta Notaris",
      permitNumber: "17",
      issuedAt: new Date("1998-10-01T00:00:00.000Z"),
      issuedYear: 1998,
      description: "Akta pendirian yang disebutkan dalam company profile 2022.",
      sourceLabel: "Company Profile MPU 2022",
      verifiedAt: new Date("2026-11-05T00:00:00.000Z"),
      needsReview: true,
      status: "PUBLISHED",
      displayOrder: 1
    }
  });

  for (const [category, question, answer] of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question } });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: { category, answer, displayOrder: faqs.findIndex((item) => item[1] === question) }
      });
    } else {
      await prisma.faq.create({
        data: {
          category,
          question,
          answer,
          status: "PUBLISHED",
          displayOrder: faqs.findIndex((item) => item[1] === question)
        }
      });
    }
  }

  await prisma.trainingProgram.upsert({
    where: { slug: "persiapan-cpmi" },
    update: {},
    create: {
      title: "Program Persiapan CPMI",
      slug: "persiapan-cpmi",
      description:
        "Informasi program persiapan bahasa, keterampilan kerja, etika dan budaya kerja, dokumen, serta pembekalan prakeberangkatan sesuai kebutuhan program dan lembaga terkait.",
      materials: [
        "Bahasa",
        "Keterampilan kerja",
        "Etika dan budaya kerja",
        "Kesiapan dokumen",
        "Pembekalan prakeberangkatan"
      ],
      coverMediaId: null,
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date()
    }
  });

  const mediaRecords = [];
  for (const [file, altText, folder] of mediaSeeds) {
    const filePath = path.join(process.cwd(), "public", "client", file);
    const fileStat = await stat(filePath);
    const media = await prisma.mediaAsset.upsert({
      where: { objectKey: `seed/client/${file}` },
      update: {},
      create: {
        objectKey: `seed/client/${file}`,
        publicUrl: `/client/${file}`,
        originalName: file,
        safeName: file,
        kind: "IMAGE",
        visibility: "PUBLIC",
        mimeType: "image/webp",
        sizeBytes: BigInt(fileStat.size),
        altText,
        source: "Paket Google Drive klien, diterima 5 November 2026",
        permissionStatus: "CLIENT_PROVIDED",
        folder,
        tags: [folder, "klien"]
      }
    });
    mediaRecords.push(media);
  }

  const gallery = await prisma.galleryAlbum.upsert({
    where: { slug: "dokumentasi-kegiatan-mpu" },
    update: {
      description: "Dokumentasi kantor, tim, dan kegiatan persiapan pada sejumlah cabang MPU."
    },
    create: {
      title: "Dokumentasi Kegiatan MPU",
      slug: "dokumentasi-kegiatan-mpu",
      description: "Dokumentasi kantor, tim, dan kegiatan persiapan pada sejumlah cabang MPU.",
      category: "kegiatan",
      coverMediaId: mediaRecords[0]?.id,
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date()
    }
  });

  for (const [displayOrder, media] of mediaRecords.entries()) {
    await prisma.galleryItem.upsert({
      where: { albumId_mediaId: { albumId: gallery.id, mediaId: media.id } },
      update: {},
      create: { albumId: gallery.id, mediaId: media.id, displayOrder, isCover: displayOrder === 0 }
    });
  }

  for (const [slug, description] of galleryDescriptions) {
    await prisma.galleryAlbum.updateMany({ where: { slug }, data: { description } });
  }

  console.log("Seed MPU selesai tanpa membuat pendaftar, lowongan, atau testimoni fiktif.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
