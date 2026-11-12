import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = [
    "",
    "/tentang-kami",
    "/layanan",
    "/negara-tujuan",
    "/lowongan",
    "/program-pelatihan",
    "/legalitas",
    "/galeri",
    "/testimoni",
    "/berita",
    "/faq",
    "/kontak",
    "/daftar",
    "/kebijakan-privasi",
    "/syarat-ketentuan"
  ];
  const rows: MetadataRoute.Sitemap = staticRoutes.map((url) => ({
    url: `${base}${url}`,
    lastModified: new Date()
  }));
  try {
    const [countries, occupations, jobs, albums, articles] = await Promise.all([
      prisma.country.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true }
      }),
      prisma.countryOccupation.findMany({
        where: { status: "PUBLISHED", country: { status: "PUBLISHED" } },
        select: { slug: true, updatedAt: true, country: { select: { slug: true } } }
      }),
      prisma.job.findMany({ where: { status: "OPEN" }, select: { slug: true, updatedAt: true } }),
      prisma.galleryAlbum.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true }
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true }
      })
    ]);
    rows.push(
      ...countries.map((x) => ({
        url: `${base}/negara-tujuan/${x.slug}`,
        lastModified: x.updatedAt
      })),
      ...occupations.map((x) => ({
        url: `${base}/negara-tujuan/${x.country.slug}/pekerjaan/${x.slug}`,
        lastModified: x.updatedAt
      })),
      ...jobs.map((x) => ({ url: `${base}/lowongan/${x.slug}`, lastModified: x.updatedAt })),
      ...albums.map((x) => ({ url: `${base}/galeri/${x.slug}`, lastModified: x.updatedAt })),
      ...articles.map((x) => ({ url: `${base}/berita/${x.slug}`, lastModified: x.updatedAt }))
    );
  } catch {}
  return rows;
}
