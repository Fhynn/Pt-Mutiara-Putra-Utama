import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { PageHero } from "@/components/public/page-hero";
import { getPublishedArticles } from "@/lib/public-data";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
export const metadata = {
  title: "Berita",
  description: "Berita dan kegiatan PT Mutiara Putra Utama."
};

export default async function NewsPage() {
  const articles = await getPublishedArticles();
  return (
    <>
      <PageHero
        breadcrumb="Berita"
        title="Berita dan kegiatan"
        description="Ikuti informasi kegiatan, program, dan pengumuman resmi PT Mutiara Putra Utama."
      />
      <section className="section">
        <div className="container">
          {articles.length ? (
            <div className="content-grid">
              {articles.map((article) => (
                <article className="content-card" key={article.id}>
                  <span className="tag">{article.category?.name ?? "Berita"}</span>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <p className="form-note">{formatDate(article.publishedAt)}</p>
                  <Link className="text-link" href={`/berita/${article.slug}`}>
                    Baca artikel
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada berita terpublikasi"
              description="Informasi terbaru dapat ditanyakan langsung melalui halaman kontak."
            />
          )}
        </div>
      </section>
    </>
  );
}
