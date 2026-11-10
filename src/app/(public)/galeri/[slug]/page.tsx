import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.galleryAlbum
    .findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { title: true, description: true }
    })
    .catch(() => null);
  if (!album) return { title: "Album tidak tersedia", robots: { index: false, follow: false } };
  const title = album.title;
  const description =
    album.description || `Dokumentasi kegiatan ${album.title} dari PT Mutiara Putra Utama.`;
  return {
    title,
    description,
    alternates: { canonical: `/galeri/${slug}` },
    openGraph: { title, description, type: "website" }
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let album = null;
  try {
    album = await prisma.galleryAlbum.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { items: { include: { media: true }, orderBy: { displayOrder: "asc" } } }
    });
  } catch {}
  if (!album) notFound();
  const items = album.items
    .filter((item) => item.media.publicUrl && !item.media.isDeleted)
    .map((item) => ({
      id: item.id,
      src: item.media.publicUrl!,
      alt: item.media.altText,
      caption: item.caption
    }));
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumb items={[{ label: "Galeri", href: "/galeri" }, { label: album.title }]} />
          <h1 className="page-title">{album.title}</h1>
          <p>{album.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <GalleryLightbox items={items} />
        </div>
      </section>
    </>
  );
}
