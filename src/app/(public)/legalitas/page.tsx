import { ExternalLink, FileBadge2, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Legalitas",
  description: "Informasi legalitas dan sumber verifikasi PT Mutiara Putra Utama."
};

export default async function LegalityPage() {
  let documents: Array<{
    id: string;
    title: string;
    permitType: string;
    permitNumber: string | null;
    issuedAt: Date | null;
    issuedYear: number | null;
    description: string | null;
    sourceUrl: string | null;
    sourceLabel: string | null;
    verifiedAt: Date | null;
    needsReview: boolean;
  }> = [];
  try {
    documents = await prisma.legalDocument.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
  } catch {}
  return (
    <>
      <PageHero
        breadcrumb="Legalitas"
        title="Legalitas dan sumber verifikasi"
        description="Kategori dokumen, nomor, dan sumber ditampilkan terpisah untuk mencegah penyebutan izin yang keliru."
      />
      <section className="section">
        <div className="container">
          <div className="content-grid">
            {documents.map((document) => (
              <article className="content-card" key={document.id}>
                {document.needsReview ? <FileBadge2 /> : <ShieldCheck />}
                <h2>{document.title}</h2>
                <p>
                  <strong>{document.permitType}</strong>
                </p>
                <p>Nomor: {document.permitNumber ?? "Tidak dipublikasikan"}</p>
                <p>
                  Tanggal/tahun:{" "}
                  {document.issuedAt ? formatDate(document.issuedAt) : (document.issuedYear ?? "—")}
                </p>
                <p>{document.description}</p>
                <p className="form-note">
                  Verifikasi terakhir: {formatDate(document.verifiedAt)}
                  {document.needsReview ? " · Perlu konfirmasi berkala" : ""}
                </p>
                {document.sourceUrl ? (
                  <a
                    className="text-link"
                    href={document.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={16} /> {document.sourceLabel ?? "Lihat sumber"}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
          <div className="content-card" style={{ marginTop: 34 }}>
            <h2>Catatan penting</h2>
            <p>
              Company profile 2022 menyebut nomor <strong>02201003618290002</strong> dengan label
              SIUP 2021, sedangkan profil SISKOP2MI menampilkan nomor izin{" "}
              <strong>0220100361829</strong>. Keduanya tidak digabungkan menjadi satu jenis dokumen.
              Gunakan tautan sumber pada setiap kartu untuk memeriksa kategori dan status dokumen.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
