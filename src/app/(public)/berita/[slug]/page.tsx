import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await prisma.article
    .findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true }
    })
    .catch(() => []);
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article
    .findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { title: true, excerpt: true, metaTitle: true, metaDescription: true }
    })
    .catch(() => null);
  if (!article) return { title: "Artikel tidak tersedia", robots: { index: false, follow: false } };
  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/berita/${slug}` },
    openGraph: { title, description, type: "article" }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article = null;
  try {
    article = await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { category: true, author: { select: { name: true } } }
    });
  } catch {}
  if (!article) notFound();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumb items={[{ label: "Berita", href: "/berita" }, { label: article.title }]} />
          <h1 className="page-title">{article.title}</h1>
          <p>{article.excerpt}</p>
        </div>
      </section>
      <article className="section">
        <div className="container" style={{ maxWidth: 850 }}>
          <p className="form-note">
            {formatDate(article.publishedAt)} · {article.author?.name ?? "Tim MPU"}
          </p>
          <div dangerouslySetInnerHTML={{ __html: article.body }} />
        </div>
      </article>
    </>
  );
}
