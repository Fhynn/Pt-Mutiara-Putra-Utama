import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { deleteObject } from "@/lib/storage";

export function inactiveApplicationCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  return cutoff;
}

export async function anonymizeApplication(id: string, actorId?: string) {
  const current = await prisma.application.findUnique({
    where: { id },
    select: { photoObjectKey: true, anonymizedAt: true }
  });
  if (!current) return "missing" as const;
  if (current.anonymizedAt) return "already-deleted" as const;

  await prisma.$transaction([
    prisma.applicationNote.deleteMany({ where: { applicationId: id } }),
    prisma.application.update({
      where: { id },
      data: {
        fullName: "Data dihapus",
        phone: "-",
        email: null,
        domicile: "-",
        province: null,
        sector: null,
        nikEncrypted: null,
        birthPlace: null,
        birthDate: null,
        gender: null,
        maritalStatus: null,
        religion: null,
        heightCm: null,
        weightKg: null,
        address: null,
        rt: null,
        rw: null,
        village: null,
        district: null,
        workExperience: null,
        message: null,
        source: null,
        idempotencyKey: null,
        assignedToId: null,
        countryId: null,
        jobId: null,
        status: "WITHDRAWN"
      }
    })
  ]);
  if (current.photoObjectKey) await deleteObject(current.photoObjectKey, "PRIVATE");
  await prisma.application.update({
    where: { id },
    data: { photoObjectKey: null, anonymizedAt: new Date() }
  });
  await writeAudit({
    actorId,
    action: "DELETE",
    entityType: "Application",
    entityId: id,
    summary: "Menghapus data pribadi pendaftar"
  });
  return "deleted" as const;
}
