import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState } from "@/components/public/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Galeri",
  description: "Album dokumentasi kegiatan PT Mutiara Putra Utama."
};

export default async function GalleryPage() {
  let albums: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string;
    items: Array<{ media: { publicUrl: string | null; altText: string } }>;
    _count: { items: number };
  }> = [];
  try {
    albums = await prisma.galleryAlbum.findMany({
      where: { status: "PUBLISHED" },
      include: {
        items: {
          where: { media: { kind: "IMAGE", isDeleted: false, visibility: "PUBLIC" } },
          include: { media: true },
          orderBy: [{ isCover: "desc" }, { displayOrder: "asc" }],
          take: 1
        },
        _count: { select: { items: true } }
      },
      orderBy: { displayOrder: "asc" }
    });
  } catch {}
  return (
    <>
      <PageHero
        breadcrumb="Galeri"
        title="Dokumentasi kegiatan"
        description="Album hanya memuat media yang dipilih untuk publikasi. Foto berisi dokumen pribadi tidak digunakan."
      />
      <section className="section">
        <div className="container">
          {albums.length ? (
            <div className="content-grid">
              {albums.map((album) => (
                <article className="content-card album-card" key={album.id}>
                  {album.items[0]?.media.publicUrl ? (
                    <div className="album-card-media">
                      <Image
                        src={album.items[0].media.publicUrl}
                        alt={album.items[0].media.altText}
                        fill
                        loading="eager"
                        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="album-card-copy">
                    <div className="album-card-meta">
                      <span className="tag">{album.category}</span>
                      <span>{album._count.items} foto</span>
                    </div>
                    <h2>{album.title}</h2>
                    <p>{album.description}</p>
                    <Link className="button button-secondary" href={`/galeri/${album.slug}`}>
                      Buka Album
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Galeri belum dipublikasikan"
              description="Dokumentasi kegiatan sedang disiapkan untuk ditampilkan di halaman ini."
            />
          )}
        </div>
      </section>
    </>
  );
}
