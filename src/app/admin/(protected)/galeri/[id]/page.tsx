import { notFound } from "next/navigation";
import { GalleryItemManager } from "@/components/admin/gallery-item-manager";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function GalleryItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [album, media] = await Promise.all([
    prisma.galleryAlbum.findUnique({
      where: { id },
      include: {
        items: {
          include: { media: { select: { originalName: true, publicUrl: true, kind: true } } },
          orderBy: { displayOrder: "asc" }
        }
      }
    }),
    prisma.mediaAsset.findMany({
      where: { isDeleted: false, visibility: "PUBLIC" },
      select: { id: true, originalName: true, kind: true },
      orderBy: { createdAt: "desc" }
    })
  ]);
  if (!album) notFound();
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Media Album: {album.title}</h1>
          <p>Pilih media library, atur caption, cover, dan urutan.</p>
        </div>
      </div>
      <GalleryItemManager albumId={album.id} initialItems={album.items} media={media} />
    </>
  );
}
