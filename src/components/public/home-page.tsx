import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileBadge2,
  MapPin,
  MessageCircle,
  PlaneTakeoff,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  Zap
} from "lucide-react";
import type { getHomeData } from "@/lib/public-data";
import { formatDate } from "@/lib/utils";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { CountryFlag } from "@/components/public/country-flag";
import { SectionHeading } from "@/components/public/section-heading";

type HomeData = Awaited<ReturnType<typeof getHomeData>>;

const fallbackServices = [
  {
    id: "sosialisasi",
    title: "Sosialisasi",
    slug: "sosialisasi",
    icon: "MessageCircle",
    description:
      "Informasi awal mengenai peluang, tahapan, hak, kewajiban, dan risiko penempatan ke luar negeri."
  },
  {
    id: "rekrutmen",
    title: "Rekrutmen",
    slug: "rekrutmen",
    icon: "SearchCheck",
    description:
      "Penyaringan calon pekerja berdasarkan kebutuhan program dan ketentuan yang berlaku."
  },
  {
    id: "pelatihan",
    title: "Pelatihan",
    slug: "pelatihan",
    icon: "BookOpenCheck",
    description:
      "Persiapan bahasa, keterampilan kerja, etika, budaya, dan dokumen melalui program yang sesuai."
  },
  {
    id: "penempatan",
    title: "Penempatan",
    slug: "penempatan",
    icon: "PlaneTakeoff",
    description:
      "Pendampingan proses penempatan yang legal, aman, dan mengikuti peraturan yang berlaku."
  }
];

const fallbackValues = [
  {
    id: "fast",
    name: "Fast",
    description: "Responsif dalam informasi dan tindak lanjut.",
    icon: "Zap"
  },
  {
    id: "reliable",
    name: "Reliable",
    description: "Mengutamakan ketepatan prosedur dan dokumentasi.",
    icon: "ShieldCheck"
  },
  {
    id: "experienced",
    name: "Experienced",
    description: "Berpengalaman sejak 1998.",
    icon: "Award"
  }
];

const fallbackCountries = [
  {
    id: "tw",
    name: "Taiwan",
    slug: "taiwan",
    isoCode: "TW",
    summary: "Informasi awal program dan persyaratan penempatan ke Taiwan.",
    sectors: ["Agrikultur", "Caregiver", "Industri"]
  },
  {
    id: "hk",
    name: "Hong Kong",
    slug: "hong-kong",
    isoCode: "HK",
    summary: "Informasi awal program dan persyaratan penempatan ke Hong Kong.",
    sectors: ["Layanan rumah tangga", "Caregiver"]
  },
  {
    id: "sg",
    name: "Singapura",
    slug: "singapura",
    isoCode: "SG",
    summary: "Informasi awal program dan persyaratan penempatan ke Singapura.",
    sectors: ["Layanan rumah tangga", "Jasa"]
  },
  {
    id: "my",
    name: "Malaysia",
    slug: "malaysia",
    isoCode: "MY",
    summary: "Informasi awal program dan persyaratan penempatan ke Malaysia.",
    sectors: ["Pertanian", "Konstruksi", "Industri"]
  }
];

const fallbackSteps = [
  ["Konsultasi & Sosialisasi", "MessageCircle"],
  ["Registrasi & Verifikasi Dokumen", "ClipboardCheck"],
  ["Seleksi & Rekrutmen", "UsersRound"],
  ["Pelatihan & Persiapan", "BookOpenCheck"],
  ["Wawancara, Pemeriksaan Kesehatan & Administrasi", "Stethoscope"],
  ["Keberangkatan & Pendampingan", "PlaneTakeoff"]
].map(([title, icon], index) => ({ id: String(index), title, icon }));

const fallbackFaqs = [
  [
    "Cara mendaftar",
    "Isi formulir CPMI dengan data diri, pengalaman kerja, dan satu foto. Tim akan meninjau pendaftaran dan memberi informasi tahap berikutnya."
  ],
  [
    "Berkas umum",
    "Daftar dokumen ada pada halaman setiap negara. KTP, KK, akta kelahiran, ijazah, surat izin keluarga, dan paspor lama disiapkan untuk verifikasi tahap lanjutan melalui petugas MPU."
  ],
  [
    "Tahapan proses",
    "Tahapan umum meliputi konsultasi, verifikasi, seleksi, persiapan, administrasi, dan keberangkatan sesuai ketentuan."
  ],
  [
    "Negara tersedia",
    "Taiwan, Hong Kong, Singapura, Malaysia, dan Brunei Darussalam tersedia sebagai pilihan minat. Status program harus dikonfirmasi."
  ],
  [
    "Informasi biaya",
    "Biaya mengikuti program dan ketentuan terbaru. Mintalah rincian tertulis dan jangan membayar ke rekening pribadi yang tidak terverifikasi."
  ],
  [
    "Verifikasi P3MI",
    "Gunakan tautan resmi SISKOP2MI dan cocokkan nama, alamat, serta status perusahaan."
  ]
].map(([question, answer], index) => ({ id: `fallback-${index}`, question, answer }));

const galleryFallback = [
  ["/client/hero-training.webp", "Kelas persiapan CPMI"],
  ["/client/gallery-office-sragen.webp", "Kantor cabang Sragen"],
  ["/client/gallery-training-sragen.webp", "Pelatihan keterampilan"],
  ["/client/gallery-briefing.webp", "Kegiatan pengarahan"],
  ["/client/gallery-training-legok.webp", "Kegiatan kelas cabang Legok"]
] as const;

const iconMap = {
  MessageCircle,
  SearchCheck,
  BookOpenCheck,
  PlaneTakeoff,
  ClipboardCheck,
  UsersRound,
  Stethoscope,
  Zap,
  ShieldCheck,
  Award
};

function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const Component = iconMap[name as keyof typeof iconMap] ?? CheckCircle2;
  return <Component size={size} aria-hidden="true" />;
}

type HeroSection = {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image?: string;
};

export function HomePage({ data }: { data: HomeData }) {
  const heroSection = data.page?.sections?.find((section) => section.key === "hero");
  const hero = (heroSection?.content ?? {}) as HeroSection;
  const services = data.services.length ? data.services : fallbackServices;
  const values = data.values.length ? data.values : fallbackValues;
  const countries = data.countries.length ? data.countries : fallbackCountries;
  const steps = data.steps.length ? data.steps : fallbackSteps;
  const faqs = data.faqs.length ? data.faqs : fallbackFaqs;
  const dbGallery =
    data.galleries[0]?.items.filter(
      (item) => item.media.kind === "IMAGE" && item.media.publicUrl
    ) ?? [];

  return (
    <div className="mpu-home">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              {hero.eyebrow ?? "PT. MUTIARA PUTRA UTAMA — EMPLOYMENT AGENCY"}
            </span>
            <h1 className="display-title">
              Penempatan Pekerja Migran Indonesia yang <span>Legal, Aman, dan Profesional</span>
            </h1>
            <p className="lead">
              {hero.body ??
                "Kami mendampingi calon pekerja memahami proses, persyaratan, dan pilihan program secara jelas tanpa menjanjikan keberangkatan sebelum seluruh ketentuan dipenuhi."}
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={hero.primaryHref ?? "/kontak"}>
                <MessageCircle size={18} /> {hero.primaryLabel ?? "Konsultasi Sekarang"}
              </Link>
              <Link className="button button-secondary" href={hero.secondaryHref ?? "/lowongan"}>
                <SearchCheck size={18} /> {hero.secondaryLabel ?? "Lihat Lowongan"}
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <CheckCircle2 size={17} /> Terdaftar di SISKOP2MI
              </span>
              <span>
                <CheckCircle2 size={17} /> Berdiri sejak 1998
              </span>
              <span>
                <CheckCircle2 size={17} /> Informasi proses yang jelas
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Dokumentasi kegiatan PT Mutiara Putra Utama">
            <div className="hero-collage-main">
              <Image
                className="hero-image"
                src={hero.image ?? "/client/hero-training.webp"}
                alt="Kegiatan kelas persiapan calon pekerja migran Indonesia"
                width={1000}
                height={1100}
                priority
              />
            </div>
            <div className="hero-collage-small hero-collage-team">
              <Image
                src="/client/gallery-team.webp"
                alt="Tim PT Mutiara Putra Utama dalam kegiatan kantor"
                width={560}
                height={420}
                priority
              />
            </div>
            <div className="hero-collage-small hero-collage-training">
              <Image
                src="/client/training-class.webp"
                alt="Peserta mengikuti kegiatan persiapan"
                width={560}
                height={420}
                priority
              />
            </div>
            <div className="hero-badge">
              <strong>Mulai dari informasi yang benar</strong>
              <span>Periksa program, syarat, biaya, dan legalitas sebelum mendaftar.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Fakta singkat perusahaan">
        <div className="container trust-grid">
          <div className="trust-item">
            <span className="trust-icon">
              <CalendarDays size={22} strokeWidth={1.9} />
            </span>
            <div>
              <span>Berdiri sejak</span>
              <strong>1 Oktober 1998</strong>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <FileBadge2 size={22} strokeWidth={1.9} />
            </span>
            <div>
              <span>Nomor izin SISKOP2MI</span>
              <strong>0220100361829</strong>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <MapPin size={22} strokeWidth={1.9} />
            </span>
            <div>
              <span>Kantor pusat</span>
              <strong>Bogor, Jawa Barat</strong>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <UsersRound size={22} strokeWidth={1.9} />
            </span>
            <div>
              <span>Layanan</span>
              <strong>Pendampingan proses</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <div className="media-frame">
            <Image
              src="/client/about-office.webp"
              alt="Kantor cabang PT Mutiara Putra Utama"
              width={1000}
              height={760}
              loading="eager"
            />
          </div>
          <div className="copy-stack">
            <span className="eyebrow">Tentang Kami</span>
            <h2 className="section-title">
              Pengalaman panjang, proses yang tetap harus transparan
            </h2>
            <p>
              PT Mutiara Putra Utama bergerak di bidang layanan penempatan dan rekrutmen tenaga
              kerja Indonesia untuk kebutuhan internasional pada sektor formal, semi-formal, dan
              informal.
            </p>
            <p>
              Kami menempatkan pemahaman proses, kelengkapan dokumen, persiapan kandidat, dan
              kepatuhan terhadap ketentuan sebagai bagian penting sebelum penempatan.
            </p>
            <Link className="button button-secondary" href="/tentang-kami">
              Selengkapnya Tentang Kami <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="services-layout">
            <SectionHeading
              eyebrow="Layanan Kami"
              title="Layanan terintegrasi untuk proses penempatan"
              description="Informasi, seleksi, persiapan, dan pendampingan proses yang mengikuti program serta ketentuan berlaku."
            />
            <div className="service-grid">
              {services.map((service) => (
                <Link className="service-card" href={`/layanan#${service.slug}`} key={service.id}>
                  <span className="icon-box">
                    <Icon name={service.icon} />
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="value-row">
            {values.map((value) => (
              <div className="value-item" key={value.id}>
                <Icon name={value.icon} />
                <div>
                  <strong>{value.name}</strong>
                  <span>{value.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section legal-band">
        <div className="container legal-grid">
          <div className="legal-visual">
            <div className="document-sheet document-sheet-back">
              <FileBadge2 size={30} />
              <span>Dokumen Perizinan</span>
            </div>
            <div className="document-sheet document-sheet-front">
              <ShieldCheck size={34} />
              <strong>Legalitas Perusahaan</strong>
              <span>Diperiksa melalui sumber resmi</span>
            </div>
          </div>
          <div className="legal-content">
            <span className="eyebrow">Legalitas & Izin Resmi</span>
            <h2 className="section-title">Verifikasi melalui sumber yang dapat diperiksa</h2>
            <p>
              Status izin, nomor dokumen, dan tanggal verifikasi dikelola terpisah agar label
              dokumen tidak tercampur.
            </p>
            <div className="legal-cards">
              {(data.legal.length
                ? data.legal
                : [
                    {
                      id: "akta",
                      title: "Akta Pendirian",
                      permitType: "Akta Notaris",
                      permitNumber: "No. 17 — 1 Oktober 1998",
                      verifiedAt: "2026-11-05"
                    },
                    {
                      id: "siskop",
                      title: "Status P3MI pada SISKOP2MI",
                      permitType: "Status Aktif",
                      permitNumber: "0220100361829",
                      verifiedAt: "2026-11-05"
                    }
                  ]
              ).map((document) => (
                <div className="legal-card" key={document.id}>
                  <ShieldCheck />
                  <div>
                    <strong>{document.title}</strong>
                    <span>
                      {document.permitType}: {document.permitNumber ?? "—"}
                    </span>
                    <small>Verifikasi: {formatDate(document.verifiedAt)}</small>
                  </div>
                </div>
              ))}
              <a
                className="legal-card"
                href="https://siskop2mi.bp2mi.go.id/profil/lembaga/detail/966/p3mi"
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink />
                <div>
                  <strong>Cek langsung di SISKOP2MI</strong>
                  <span>Sumber resmi pemerintah untuk profil dan status P3MI.</span>
                </div>
              </a>
            </div>
            <Link className="button button-secondary" href="/legalitas">
              Lihat Legalitas <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Negara Tujuan"
            title="Lihat pilihan negara tujuan"
            description="Baca persyaratan tiap negara. Lowongan yang sedang dibuka ada di halaman Lowongan."
          />
          <div className="country-grid">
            {countries.map((country) => (
              <article className="country-card" key={country.id}>
                <div className="country-visual">
                  <CountryFlag
                    isoCode={country.isoCode}
                    name={country.name}
                    flagUrl={"flagUrl" in country ? country.flagUrl : null}
                  />
                </div>
                <div className="country-body">
                  <h3 className="country-name">{country.name}</h3>
                  <span className="status-pill">Lihat persyaratan</span>
                  <div className="tags">
                    {country.sectors.slice(0, 3).map((sector) => (
                      <span className="tag" key={sector}>
                        {sector}
                      </span>
                    ))}
                  </div>
                  <p>{country.summary}</p>
                  <Link className="text-link" href={`/negara-tujuan/${country.slug}`}>
                    Lihat detail <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link className="button button-secondary" href="/negara-tujuan">
              Lihat Semua Negara
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Alur Penempatan"
            title="Tahapan umum yang dapat berubah sesuai program"
            description="Urutan ini adalah ilustrasi proses umum. Persyaratan dan tahapan aktual mengikuti negara, pemberi kerja, pemeriksaan, dan ketentuan terbaru."
          />
          <div className="timeline">
            {steps.map((step, index) => (
              <article className="timeline-card" key={step.id}>
                <span className="step-number">{index + 1}</span>
                <Icon name={step.icon} size={28} />
                <h3>{step.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <div className="media-frame">
            <Image
              src="/client/training-class.webp"
              alt="Kegiatan kelas persiapan calon pekerja"
              width={1000}
              height={760}
              loading="eager"
            />
          </div>
          <div className="copy-stack">
            <span className="eyebrow">Program Pelatihan</span>
            <h2 className="section-title">Persiapan yang disesuaikan dengan program</h2>
            <p>
              Jenis pelatihan dan lembaga pelaksana harus dipastikan untuk setiap program. Informasi
              di bawah menggambarkan area persiapan umum, bukan klaim kepemilikan LPK atau
              sertifikasi tertentu.
            </p>
            <ul className="check-list">
              {[
                "Bahasa",
                "Keterampilan kerja",
                "Etika dan budaya kerja",
                "Kesiapan dokumen",
                "Pembekalan prakeberangkatan"
              ].map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} /> {item}
                </li>
              ))}
            </ul>
            <Link className="button button-secondary" href="/program-pelatihan">
              Lihat Program Pelatihan
            </Link>
          </div>
        </div>
      </section>

      {data.testimonials.length ? (
        <section className="section section-muted">
          <div className="container">
            <SectionHeading
              eyebrow="Cerita Alumni"
              title="Pengalaman yang telah disetujui untuk dipublikasikan"
            />
          </div>
        </section>
      ) : null}

      <section className="section section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Galeri Kegiatan"
            title="Dokumentasi dari kantor dan kegiatan MPU"
            description="Lihat dokumentasi kantor, pengarahan, persiapan, dan kegiatan yang telah dipilih untuk publikasi."
          />
          <div className="gallery-grid">
            {(dbGallery.length
              ? dbGallery
                  .slice(0, 5)
                  .map((item) => [item.media.publicUrl ?? "", item.media.altText] as const)
              : galleryFallback
            ).map(([src, alt], index) =>
              src ? (
                <div className="gallery-item" key={`${src}-${index}`}>
                  <Image src={src} alt={alt} width={900} height={700} loading="eager" />
                  <span>{alt}</span>
                </div>
              ) : null
            )}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link className="button button-secondary" href="/galeri">
              Lihat Galeri
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="FAQ"
            title="Pertanyaan yang sering diajukan"
            description="Jika jawaban bergantung pada program, tim MPU akan memberikan penjelasan berdasarkan informasi terbaru."
          />
          <FaqAccordion
            items={faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))}
          />
          <div style={{ marginTop: 24 }}>
            <Link className="text-link" href="/faq">
              Baca seluruh FAQ <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container cta-grid">
          <div>
            <h2>Siap Memulai Karier ke Luar Negeri?</h2>
            <p>
              Mulai dengan konsultasi dan pahami program yang tersedia. Pendaftaran awal tidak
              menjamin penerimaan atau keberangkatan.
            </p>
          </div>
          <div className="cta-actions">
            <Link className="button button-light" href="/kontak">
              Hubungi Kami
            </Link>
            <Link className="button button-primary" href="/daftar">
              Daftar Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
