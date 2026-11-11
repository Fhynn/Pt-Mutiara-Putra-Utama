import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const getAdminSession = cache(() => getServerSession(authOptions));

export const getActiveAdmin = cache(async () => {
  const session = await getAdminSession();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      isActive: true
    }
  });
  if (!user?.isActive) return null;
  return { session, user };
});
