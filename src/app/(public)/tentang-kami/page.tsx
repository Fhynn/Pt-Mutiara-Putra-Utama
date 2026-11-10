import Image from "next/image";
import Link from "next/link";
import { Award, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tentang Kami",
  description:
    "Sejarah, sambutan direktur, visi, misi, nilai, tim, bidang pekerjaan, dan rencana pengembangan PT Mutiara Putra Utama."
};

const fallback = {
  history:
    "PT Mutiara Putra Utama didirikan berdasarkan Akta Notaris No. 17 tanggal 1 Oktober 1998 dan menjalankan layanan penempatan tenaga kerja Indonesia untuk kebutuhan internasional.",
  directorName: "Martua Ritonga, SE",
  directorTitle: "Direktur Utama",
  directorMessage:
    "Kami berupaya menyediakan layanan yang sesuai dengan kebutuhan calon pekerja dan mitra melalui pengetahuan serta pengalaman di bidang ketenagakerjaan.",
  directorPhoto: "/client/director-portrait.jpg",
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
};

export default async function AboutPage() {
  let profile = fallback;
  try {
    const record = await prisma.companyProfile.findUnique({ where: { id: "default" } });
    if (record) profile = record as unknown as typeof fallback;
  } catch {}

  return (
    <>
      <PageHero
        breadcrumb="Tentang Kami"
        title="Perusahaan penempatan dengan pengalaman sejak 1998"
        description="Profil, nilai, dan rencana perusahaan disajikan berdasarkan company profile serta sumber resmi yang tersedia."
      />
      <section className="section">
        <div className="container split-grid">
          <div className="copy-stack">
            <span className="eyebrow">Sejarah Perusahaan</span>
            <h2 className="section-title">Tumbuh bersama perubahan layanan ketenagakerjaan</h2>
            <p>{profile.history}</p>
            <p>
              MPU melayani kebutuhan penempatan pada sektor formal, semi-formal, dan informal.
              Informasi program, kuota, dan lowongan disampaikan sesuai ketersediaan serta ketentuan
              yang berlaku.
            </p>
          </div>
          <div className="media-frame">
            <Image
              src="/client/about-office.webp"
              alt="Kantor cabang PT Mutiara Putra Utama"
              width={1000}
              height={760}
            />
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container split-grid">
          <div className="media-frame">
            <Image
              className="director-photo"
              src={profile.directorPhoto ?? "/client/director-portrait.jpg"}
              alt="Foto Direktur Utama PT Mutiara Putra Utama"
              width={700}
              height={950}
            />
          </div>
          <div className="copy-stack">
            <span className="eyebrow">Sambutan Direktur</span>
            <h2 className="section-title">{profile.directorName}</h2>
            <p>
              <strong>{profile.directorTitle}</strong>
            </p>
            <p>{profile.directorMessage}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container content-grid">
          <article className="content-card">
            <ShieldCheck />
            <h2>Visi</h2>
            {profile.vision.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
          <article className="content-card" style={{ gridColumn: "span 2" }}>
            <CheckCircle2 />
            <h2>Misi</h2>
            <ul className="check-list">
              {profile.mission.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <span className="eyebrow">Nilai Perusahaan</span>
          <h2 className="section-title">Fast · Reliable · Experienced</h2>
          <div className="content-grid" style={{ marginTop: 36 }}>
            <article className="content-card">
              <Zap />
              <h3>Fast</h3>
              <p>Responsif dalam penyampaian informasi dan tindak lanjut proses.</p>
            </article>
            <article className="content-card">
              <ShieldCheck />
              <h3>Reliable</h3>
              <p>Mengutamakan ketepatan informasi, prosedur, dan dokumentasi.</p>
            </article>
            <article className="content-card">
              <Award />
              <h3>Experienced</h3>
              <p>Memiliki pengalaman layanan ketenagakerjaan internasional sejak 1998.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <div>
            <span className="eyebrow">Tim Kami</span>
            <h2 className="section-title">Pengetahuan proses dan koordinasi lintas fungsi</h2>
            <p className="lead">{profile.teamSummary}</p>
            <p>
              Pelayanan melibatkan koordinasi informasi, rekrutmen, persiapan kandidat, dokumentasi,
              dan komunikasi dengan pihak terkait.
            </p>
          </div>
          <div className="content-card">
            <h3>Bidang pekerjaan dalam materi perusahaan</h3>
            <div className="tags">
              {profile.portfolioFields.map((field) => (
                <span className="tag" key={field}>
                  {field}
                </span>
              ))}
            </div>
            <p className="form-note">
              Daftar ini menggambarkan bidang secara umum dan bukan bukti lowongan aktif.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <span className="eyebrow">Rencana Pengembangan</span>
          <h2 className="section-title">Arah yang dinyatakan dalam company profile</h2>
          <div className="content-grid" style={{ marginTop: 36 }}>
            {profile.developmentPlans.map((plan, index) => (
              <article className="content-card" key={plan}>
                <strong>0{index + 1}</strong>
                <h3>{plan}</h3>
              </article>
            ))}
          </div>
          <p className="form-note">
            Rencana pengembangan merupakan arah kerja perusahaan dan dilaksanakan secara bertahap.
          </p>
        </div>
      </section>

      <section className="final-cta">
        <div className="container cta-grid">
          <div>
            <h2>Periksa legalitas sebelum memulai proses</h2>
            <p>
              Gunakan profil resmi SISKOP2MI dan konsultasikan program yang benar-benar tersedia.
            </p>
          </div>
          <div className="cta-actions">
            <Link className="button button-light" href="/legalitas">
              Lihat Legalitas
            </Link>
            <Link className="button button-primary" href="/kontak">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
