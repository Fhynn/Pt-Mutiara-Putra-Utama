import { NextResponse } from "next/server";
import { anonymizeApplication, inactiveApplicationCutoff } from "@/lib/application-retention";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  const expired = await prisma.application.findMany({
    where: {
      anonymizedAt: null,
      OR: [
        { fullName: "Data dihapus" },
        {
          updatedAt: { lt: inactiveApplicationCutoff() },
          status: { in: ["NEW", "CONTACTED", "REJECTED", "WITHDRAWN"] }
        }
      ]
    },
    orderBy: { updatedAt: "asc" },
    select: { id: true },
    take: 20
  });
  let deleted = 0;
  let failed = 0;
  for (const item of expired) {
    try {
      if ((await anonymizeApplication(item.id)) === "deleted") deleted++;
    } catch {
      failed++;
    }
  }
  return NextResponse.json(
    { checked: expired.length, deleted, failed },
    { status: failed ? 503 : 200, headers: { "Cache-Control": "no-store" } }
  );
}
