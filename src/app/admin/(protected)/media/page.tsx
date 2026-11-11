import { MediaManager } from "@/components/admin/media-manager";
import { notFound } from "next/navigation";
import { getActiveAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";
import { serializeBigInt } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
export const dynamic = "force-dynamic";
export default async function MediaPage() {
  const user = (await getActiveAdmin())?.user;
  if (!user || !hasPermission(user.role, "media:write", user.permissions)) notFound();
  const items = await prisma.mediaAsset.findMany({
    where: { isDeleted: false },
    include: {
      _count: { select: { usages: true, galleryItems: true } },
      galleryItems: {
        select: {
          album: { select: { id: true, title: true, slug: true, status: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return (
    <MediaManager
      initialItems={serializeBigInt(items) as never[]}
      configured={isStorageConfigured()}
    />
  );
}
