import Link from "next/link";
import { BookOpenCheck, MessageCircle, PlaneTakeoff, SearchCheck } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const revalidate = 60;
export const metadata = {
  title: "Layanan",
  description: "Layanan sosialisasi, rekrutmen, pelatihan, dan penempatan PT Mutiara Putra Utama."
};

const fallbacks = [
  {
    id: "1",
    slug: "sosialisasi",
    title: "Sosialisasi",
    description:
      "Informasi awal mengenai peluang, tahapan, hak, kewajiban, risiko, dan jalur verifikasi resmi.",
    detail:
      "Calon pekerja perlu memahami bahwa proses berbeda untuk setiap negara dan program. Informasi biaya, kontrak, dan jadwal harus diperiksa sebelum mengambil keputusan.",
    icon: MessageCircle
  },
  {
    id: "2",
    slug: "rekrutmen",
    title: "Rekrutmen",
    description: "Seleksi awal berdasarkan persyaratan program dan kebutuhan pemberi kerja.",
    detail:
      "Penyaringan tidak menjamin penempatan. Hasil seleksi, wawancara, pemeriksaan, dan dokumen tetap menentukan kelanjutan proses.",
    icon: SearchCheck
  },
  {
    id: "3",
    slug: "pelatihan",
    title: "Pelatihan",
    description: "Persiapan bahasa, keterampilan, etika, budaya kerja, serta dokumen.",
    detail:
      "Jenis pelatihan dan lembaga pelaksana mengikuti program. MPU tidak mengklaim sertifikasi atau kepemilikan fasilitas yang belum terverifikasi.",
    icon: BookOpenCheck
  },
  {
    id: "4",
    slug: "penempatan",
    title: "Penempatan",
    description: "Pendampingan administrasi dan proses menuju keberangkatan sesuai ketentuan.",
    detail:
      "Keberangkatan hanya dapat berlangsung setelah seluruh persyaratan terpenuhi dan bukan hasil yang dapat dijanjikan sejak pendaftaran awal.",
    icon: PlaneTakeoff
  }
];

export default async function ServicesPage() {
  let services: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    detail: string | null;
  }> = [];
  try {
    services = await prisma.service.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
  } catch {}
  const data = services.length ? services : fallbacks;
  return (
    <>
      <PageHero
        breadcrumb="Layanan"
        title="Empat layanan utama dalam satu proses yang saling terhubung"
        description="Ruang lingkup layanan disesuaikan dengan program, negara, pemberi kerja, dan ketentuan terbaru."
      />
      <section className="section">
        <div className="container">
          <div className="content-grid services-page-grid">
            {data.map((service, index) => {
              const Icon = fallbacks[index]?.icon ?? MessageCircle;
              return (
                <article className="content-card" id={service.slug} key={service.id}>
                  <Icon />
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <p>{service.detail}</p>
                </article>
              );
            })}
          </div>
          <div style={{ marginTop: 34 }}>
            <Link className="button button-primary" href="/daftar">
              Mulai Pendaftaran Awal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
