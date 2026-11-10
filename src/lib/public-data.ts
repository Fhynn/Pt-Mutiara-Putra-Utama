import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";

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

export async function getSettings() {
  try {
    return (await prisma.siteSetting.findUnique({ where: { id: "default" } })) ?? defaultSettings;
  } catch {
    return defaultSettings;
  }
}

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
      faqs
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
        orderBy: { displayOrder: "asc" },
        take: 4
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
      })
    ]);
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
      faqs
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
      faqs: []
    };
  }
}

export async function getPublishedCountries() {
  try {
    return await prisma.country.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
  } catch {
    return [];
  }
}

export async function getOpenJobs(params?: { country?: string; query?: string }) {
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
}

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
