import { FaqAccordion } from "@/components/public/faq-accordion";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const revalidate = 60;
export const metadata = {
  title: "FAQ",
  description: "Pertanyaan umum mengenai pendaftaran dan proses penempatan."
};

export default async function FaqPage() {
  let faqs: Array<{ id: string; question: string; answer: string }> = [];
  try {
    faqs = await prisma.faq.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ category: "asc" }, { displayOrder: "asc" }]
    });
  } catch {}
  return (
    <>
      <PageHero
        breadcrumb="FAQ"
        title="Pertanyaan yang sering diajukan"
        description="Jawaban yang bergantung pada program harus dikonfirmasi kembali kepada petugas."
      />
      <section className="section">
        <div className="container">
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </>
  );
}
