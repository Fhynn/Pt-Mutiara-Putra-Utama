import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Program Pelatihan",
  description: "Informasi persiapan dan program pelatihan calon pekerja migran Indonesia."
};

export default async function TrainingPage() {
  let programs: Array<{ id: string; title: string; description: string; materials: unknown }> = [];
  try {
    programs = await prisma.trainingProgram.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
  } catch {}
  return (
    <>
      <PageHero
        breadcrumb="Program Pelatihan"
        title="Persiapan kandidat sesuai kebutuhan program"
        description="Jenis, penyelenggara, durasi, dan sertifikasi pelatihan harus dikonfirmasi untuk setiap program."
      />
      <section className="section">
        <div className="container split-grid">
          <div className="media-frame">
            <Image
              src="/client/training-class.webp"
              alt="Kegiatan kelas persiapan"
              width={1000}
              height={760}
            />
          </div>
          <div>
            {programs.length ? (
              programs.map((program) => (
                <article key={program.id}>
                  <span className="eyebrow">Program</span>
                  <h2 className="section-title">{program.title}</h2>
                  <p className="lead">{program.description}</p>
                  <ul className="check-list">
                    {(Array.isArray(program.materials) ? program.materials.map(String) : []).map(
                      (item) => (
                        <li key={item}>
                          <CheckCircle2 size={18} />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </article>
              ))
            ) : (
              <p>
                Program pelatihan belum dipublikasikan. Hubungi petugas untuk informasi terbaru.
              </p>
            )}
            <p className="form-note" style={{ marginTop: 28 }}>
              Jenis pelatihan, lembaga pelaksana, durasi, dan sertifikasi mengikuti program yang
              dipilih dan akan dijelaskan sebelum proses dimulai.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
