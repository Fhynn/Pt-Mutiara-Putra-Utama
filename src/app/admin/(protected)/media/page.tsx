import { MediaManager } from "@/components/admin/media-manager";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";
import { serializeBigInt } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
export const dynamic = "force-dynamic";
export default async function MediaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !hasPermission(session.user.role, "media:write", session.user.permissions))
    notFound();
  const items = await prisma.mediaAsset.findMany({
    where: { isDeleted: false },
    include: { _count: { select: { usages: true, galleryItems: true } } },
    orderBy: { createdAt: "desc" }
  });
  return (
    <MediaManager
      initialItems={serializeBigInt(items) as never[]}
      configured={isStorageConfigured()}
    />
  );
}
