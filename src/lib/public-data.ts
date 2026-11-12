import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";

const homeClientFiles = [
  "hero-training.webp",
  "about-office.webp",
  "training-class.webp",
  "gallery-team.webp",
  "gallery-office-sragen.webp",
  "gallery-training-sragen.webp",
  "gallery-briefing.webp",
  "gallery-training-legok.webp"
];

export const defaultSettings = {
  legalName: "PT. MUTIARA PUTRA UTAMA",
  brandName: "MPU Employment Agency",
  tagline: "Penempatan Pekerja Migran Indonesia yang legal, aman, dan profesional",
  primaryEmail: "mpu_setu@yahoo.com",
  alternateEmail: null,
  phone: "021-82740059",
  whatsappE164: null,
  address:
    "Jl. KH Sanip No. 42, Kp. Bubulak, Bojong Kulur, Gunung Putri, Kabupaten Bogor, Jawa Barat",
  logoUrl: "/brand/mpu-logo.png",
  officeHours: null,
  socialLinks: null,
  privacyPolicy: null,
  terms: null
};

export const getSettings = unstable_cache(
  async () => {
    try {
      return (await prisma.siteSetting.findUnique({ where: { id: "default" } })) ?? defaultSettings;
    } catch {
      return defaultSettings;
    }
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 60 }
);

export async function getHomeData() {
  try {
    const [
      page,
      services,
      values,
      countries,
      steps,
      training,
      legal,
      testimonials,
      galleries,
      faqs,
      clientAssets
    ] = await Promise.all([
      prisma.page.findUnique({
        where: { slug: "home" },
        include: { sections: { where: { status: "PUBLISHED" }, orderBy: { displayOrder: "asc" } } }
      }),
      prisma.service.findMany({ where: { status: "PUBLISHED" }, orderBy: { displayOrder: "asc" } }),
      prisma.companyValue.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" }
      }),
      prisma.country.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        include: {
          occupations: { where: { status: "PUBLISHED" }, orderBy: { displayOrder: "asc" } },
          _count: { select: { occupations: true } }
        },
        orderBy: { displayOrder: "asc" },
        take: 5
      }),
      prisma.placementStep.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" }
      }),
      prisma.trainingProgram.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        orderBy: { displayOrder: "asc" },
        take: 1
      }),
      prisma.legalDocument.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        take: 3
      }),
      prisma.testimonial.findMany({
        where: { status: "PUBLISHED", approval: "APPROVED", consentToPublish: true },
        orderBy: { displayOrder: "asc" },
        take: 3
      }),
      prisma.galleryAlbum.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        include: { items: { include: { media: true }, orderBy: { displayOrder: "asc" }, take: 8 } },
        orderBy: { displayOrder: "asc" },
        take: 1
      }),
      prisma.faq.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        take: 6
      }),
      prisma.mediaAsset.findMany({
        where: {
          objectKey: { in: homeClientFiles.map((file) => `seed/client/${file}`) },
          isDeleted: false,
          visibility: "PUBLIC"
        },
        select: { objectKey: true, publicUrl: true }
      })
    ]);
    const clientMedia = Object.fromEntries(
      clientAssets
        .filter((asset) => asset.publicUrl)
        .map((asset) => [asset.objectKey.replace("seed/client/", "/client/"), asset.publicUrl!])
    );
    return serializeBigInt({
      page,
      services,
      values,
      countries,
      steps,
      training,
      legal,
      testimonials,
      galleries,
      faqs,
      clientMedia
    });
  } catch {
    return {
      page: null,
      services: [],
      values: [],
      countries: [],
      steps: [],
      training: [],
      legal: [],
      testimonials: [],
      galleries: [],
      faqs: [],
      clientMedia: {} as Record<string, string>
    };
  }
}

export const getPublishedCountries = unstable_cache(
  async () => {
    try {
      return await prisma.country.findMany({
        where: { status: "PUBLISHED" },
        include: {
          occupations: { where: { status: "PUBLISHED" }, orderBy: { displayOrder: "asc" } },
          _count: { select: { occupations: true } }
        },
        orderBy: { displayOrder: "asc" }
      });
    } catch {
      return [];
    }
  },
  ["published-countries"],
  { tags: ["public-content"], revalidate: 60 }
);

export const getOpenJobs = unstable_cache(
  async (params?: { country?: string; query?: string }) => {
    const now = new Date();
    try {
      return await prisma.job.findMany({
        where: {
          status: "OPEN",
          AND: [
            { OR: [{ deadline: null }, { deadline: { gte: now } }] },
            ...(params?.country ? [{ country: { slug: params.country } }] : []),
            ...(params?.query
              ? [
                  {
                    OR: [
                      { title: { contains: params.query, mode: "insensitive" as const } },
                      { summary: { contains: params.query, mode: "insensitive" as const } }
                    ]
                  }
                ]
              : [])
          ]
        },
        include: { country: true, sector: true },
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }]
      });
    } catch {
      return [];
    }
  },
  ["open-jobs"],
  { tags: ["public-content"], revalidate: 60 }
);

export async function getPublishedArticles() {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true, author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" }
    });
  } catch {
    return [];
  }
}
