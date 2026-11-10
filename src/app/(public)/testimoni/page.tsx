import { EmptyState } from "@/components/public/empty-state";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Testimoni",
  description: "Testimoni yang telah disetujui untuk publikasi."
};

export default async function TestimonialsPage() {
  let items: Array<{ id: string; displayName: string; country: string | null; quote: string }> = [];
  try {
    items = await prisma.testimonial.findMany({
      where: { status: "PUBLISHED", approval: "APPROVED", consentToPublish: true },
      orderBy: { displayOrder: "asc" }
    });
  } catch {}
  return (
    <>
      <PageHero
        breadcrumb="Testimoni"
        title="Cerita yang telah mendapat persetujuan publikasi"
        description="Kami tidak memublikasikan testimoni contoh, nama rekaan, atau foto tanpa persetujuan."
      />
      <section className="section">
        <div className="container">
          {items.length ? (
            <div className="content-grid">
              {items.map((item) => (
                <blockquote className="content-card" key={item.id}>
                  <p>“{item.quote}”</p>
                  <footer>
                    <strong>{item.displayName}</strong>
                    {item.country ? ` · ${item.country}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada testimoni terverifikasi"
              description="Hubungi kami untuk konsultasi. Testimoni akan ditampilkan setelah persetujuan dan verifikasi selesai."
            />
          )}
        </div>
      </section>
    </>
  );
}
