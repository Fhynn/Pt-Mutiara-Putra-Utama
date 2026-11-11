import { notFound } from "next/navigation";
import { GalleryItemManager } from "@/components/admin/gallery-item-manager";
import { getActiveAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
export const dynamic = "force-dynamic";
export default async function GalleryItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = (await getActiveAdmin())?.user;
  if (!user || !hasPermission(user.role, "content:read", user.permissions)) notFound();
  const { id } = await params;
  const [album, media] = await Promise.all([
    prisma.galleryAlbum.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            media: {
              select: {
                originalName: true,
                title: true,
                altText: true,
                publicUrl: true,
                kind: true
              }
            }
          },
          orderBy: { displayOrder: "asc" }
        }
      }
    }),
    prisma.mediaAsset.findMany({
      where: {
        isDeleted: false,
        visibility: "PUBLIC",
        kind: { in: ["IMAGE", "VIDEO", "EMBED"] }
      },
      select: {
        id: true,
        originalName: true,
        title: true,
        altText: true,
        publicUrl: true,
        kind: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);
  if (!album) notFound();
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Foto album: {album.title}</h1>
          <p>Lihat fotonya, tentukan sampul album, lalu atur urutan tampil.</p>
        </div>
      </div>
      <GalleryItemManager
        albumId={album.id}
        albumSlug={album.slug}
        albumStatus={album.status}
        albumFeatured={album.isFeatured}
        initialItems={album.items}
        media={media}
      />
    </>
  );
}
