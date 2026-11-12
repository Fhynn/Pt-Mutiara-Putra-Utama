type AdminItem = Record<string, unknown>;
type CountryOption = { value: string; slug?: string; isPublished?: boolean };

export type AdminPublicLink = {
  href: string;
  label: string;
  note?: string;
  live: boolean;
};

const listingPages: Record<string, string> = {
  pengaturan: "/",
  profil: "/tentang-kami",
  halaman: "/",
  galeri: "/galeri",
  negara: "/negara-tujuan",
  "pekerjaan-negara": "/negara-tujuan",
  lowongan: "/lowongan",
  berita: "/berita",
  testimoni: "/testimoni",
  pelatihan: "/program-pelatihan",
  layanan: "/layanan",
  tim: "/tentang-kami",
  alur: "/#alur",
  faq: "/faq",
  legalitas: "/legalitas"
};

const homeSectionAnchors: Record<string, string> = {
  hero: "/",
  "quick-facts": "/#fakta",
  about: "/#tentang",
  "final-cta": "/#cta"
};

function pathPart(value: unknown) {
  return typeof value === "string" && value.trim() ? encodeURIComponent(value.trim()) : null;
}

export function getAdminPublicLink(
  resource: string,
  item: AdminItem,
  countries: CountryOption[] = [],
  deleted = false
): AdminPublicLink | null {
  const country = countries.find((option) => option.value === item.countryId);
  const countryPath = country?.slug
    ? `/negara-tujuan/${encodeURIComponent(country.slug)}`
    : listingPages.negara;
  const listing =
    resource === "halaman" && typeof item.key === "string"
      ? (homeSectionAnchors[item.key] ?? "/")
      : resource === "pekerjaan-negara" && country?.isPublished
        ? countryPath
        : (listingPages[resource] ?? null);
  if (!listing) return null;

  if (deleted) {
    return {
      href: listing,
      label: "Lihat halaman setelah penghapusan",
      live: true
    };
  }

  const status = item.status;
  const published =
    resource === "pengaturan" || resource === "profil"
      ? true
      : resource === "lowongan"
        ? status === "OPEN" &&
          (!item.deadline || new Date(String(item.deadline)).getTime() >= Date.now())
        : status === "PUBLISHED";
  const visible =
    published &&
    (resource !== "pekerjaan-negara" || (country?.isPublished === true && Boolean(country.slug))) &&
    (resource !== "testimoni" || (item.approval === "APPROVED" && item.consentToPublish === true));

  if (!visible) {
    return {
      href: listing,
      label: "Buka halaman terkait",
      note: "Perubahan tersimpan, tetapi belum tampil untuk pengunjung. Terbitkan konten agar hasilnya terlihat di website.",
      live: false
    };
  }

  const slug = pathPart(item.slug);
  let href = listing;
  if (slug) {
    if (resource === "galeri") href = `/galeri/${slug}`;
    if (resource === "negara") href = `/negara-tujuan/${slug}`;
    if (resource === "pekerjaan-negara") href = `${countryPath}/pekerjaan/${slug}`;
    if (resource === "lowongan") href = `/lowongan/${slug}`;
    if (resource === "berita") href = `/berita/${slug}`;
    if (resource === "layanan") href = `/layanan#${slug}`;
  }

  return { href, label: "Lihat hasil di website", live: true };
}
