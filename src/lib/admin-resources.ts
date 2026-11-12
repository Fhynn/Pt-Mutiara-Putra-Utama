import { z } from "zod";
import { normalizeCountryGenderCriteria } from "@/lib/country-gender-criteria";
import { slugify as createSlug } from "@/lib/utils";

export type AdminField = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "date"
    | "select"
    | "list"
    | "socialLinks"
    | "sectionContent"
    | "genderCriteria"
    | "relation"
    | "slug";
  required?: boolean;
  options?: readonly AdminOption[];
  relation?:
    | "countries"
    | "sectors"
    | "users"
    | "media"
    | "mediaImages"
    | "mediaUrls"
    | "articleCategories";
  autoFrom?: string;
  readOnly?: boolean;
  hidden?: boolean;
  placeholder?: string;
  help?: string;
};

export type AdminOption = { value: string; label: string; previewUrl?: string; kind?: string };

export type AdminResourceConfig = {
  title: string;
  singular: string;
  model: string;
  fields: readonly AdminField[];
  listFields: readonly string[];
  searchFields?: readonly string[];
  readonly?: boolean;
  noCreate?: boolean;
  noDelete?: boolean;
  singletonId?: string;
  permission: "content" | "applications" | "messages" | "users" | "settings" | "audit";
};

const publication: readonly AdminOption[] = [
  { value: "DRAFT", label: "Simpan, belum tampil di website" },
  { value: "PUBLISHED", label: "Tampilkan di website" },
  { value: "ARCHIVED", label: "Disembunyikan dari website" }
];
const featured = (help: string): AdminField => ({
  key: "isFeatured",
  label: "Tampilkan di beranda",
  type: "boolean",
  help
});
const order = (): AdminField => ({
  key: "displayOrder",
  label: "Urutan tampilan",
  type: "number",
  help: "Diisi otomatis saat menambah data. Ubah hanya jika ingin mengganti urutan."
});
const iconOptions: readonly AdminOption[] = [
  { value: "Megaphone", label: "Pengeras suara" },
  { value: "Search", label: "Pencarian" },
  { value: "BookOpen", label: "Buku / pelatihan" },
  { value: "Plane", label: "Pesawat / keberangkatan" },
  { value: "MessagesSquare", label: "Konsultasi" },
  { value: "FileCheck2", label: "Verifikasi dokumen" },
  { value: "UsersRound", label: "Seleksi peserta" },
  { value: "CirclePlus", label: "Pemeriksaan" },
  { value: "ShieldCheck", label: "Perlindungan" },
  { value: "Award", label: "Pengalaman" }
];
const sectionOptions: readonly AdminOption[] = [
  { value: "hero", label: "Bagian atas / pembuka" },
  { value: "quick-facts", label: "Fakta singkat" },
  { value: "about", label: "Tentang perusahaan" },
  { value: "final-cta", label: "Ajakan di bagian bawah" }
];
const pageLinkOptions: readonly AdminOption[] = [
  { value: "/", label: "Beranda" },
  { value: "/tentang-kami", label: "Tentang Kami" },
  { value: "/layanan", label: "Layanan" },
  { value: "/negara-tujuan", label: "Negara Tujuan" },
  { value: "/lowongan", label: "Lowongan" },
  { value: "/program-pelatihan", label: "Program Pelatihan" },
  { value: "/legalitas", label: "Legalitas" },
  { value: "/galeri", label: "Galeri" },
  { value: "/berita", label: "Berita" },
  { value: "/faq", label: "FAQ" },
  { value: "/kontak", label: "Kontak" },
  { value: "/daftar", label: "Pendaftaran Online" }
];
const text = (key: string, label: string, required = false): AdminField => ({
  key,
  label,
  required
});
const area = (key: string, label: string, required = false): AdminField => ({
  key,
  label,
  required,
  type: "textarea"
});
const select = (key: string, label: string, options: readonly AdminOption[]): AdminField => ({
  key,
  label,
  type: "select",
  options
});
const list = (key: string, label: string, help?: string): AdminField => ({
  key,
  label,
  type: "list",
  help
});
const relation = (
  key: string,
  label: string,
  relationName: NonNullable<AdminField["relation"]>,
  required = false
): AdminField => ({ key, label, type: "relation", relation: relationName, required });
const slug = (autoFrom = "title"): AdminField => ({
  key: "slug",
  label: "Alamat halaman",
  type: "slug",
  autoFrom,
  readOnly: true,
  help: "Dibuat otomatis oleh sistem."
});
const choices = (...items: Array<readonly [string, string]>): AdminOption[] =>
  items.map(([value, label]) => ({ value, label }));

export const adminResources: Record<string, AdminResourceConfig> = {
  pengaturan: {
    title: "Pengaturan Website",
    singular: "pengaturan",
    model: "siteSetting",
    permission: "settings",
    listFields: ["legalName", "brandName", "primaryEmail", "phone", "updatedAt"],
    noCreate: true,
    noDelete: true,
    fields: [
      text("legalName", "Nama hukum", true),
      text("brandName", "Nama merek", true),
      text("tagline", "Tagline"),
      text("primaryEmail", "Email utama"),
      text("alternateEmail", "Email lain"),
      text("phone", "Telepon"),
      text("whatsappE164", "Nomor WhatsApp"),
      area("address", "Alamat"),
      text("mapUrl", "Tautan Google Maps"),
      text("officeHours", "Jam operasional"),
      { key: "socialLinks", label: "Media sosial", type: "socialLinks" },
      area("announcement", "Pengumuman"),
      { key: "announcementEnabled", label: "Tampilkan pengumuman", type: "boolean" },
      { key: "maintenanceMode", label: "Mode pemeliharaan", type: "boolean" },
      text("defaultMetaTitle", "Judul bawaan untuk Google"),
      area("defaultMetaDescription", "Deskripsi bawaan untuk Google"),
      relation("defaultOgImage", "Gambar saat tautan dibagikan", "mediaUrls"),
      relation("logoUrl", "Logo website", "mediaUrls"),
      relation("faviconUrl", "Ikon browser", "mediaUrls"),
      area("privacyPolicy", "Kebijakan privasi"),
      area("terms", "Syarat dan ketentuan"),
      text("analyticsId", "Kode Google Analytics")
    ]
  },
  profil: {
    title: "Profil Perusahaan",
    singular: "profil",
    model: "companyProfile",
    permission: "content",
    listFields: ["directorName", "directorTitle", "updatedAt"],
    noCreate: true,
    noDelete: true,
    fields: [
      area("history", "Sejarah", true),
      text("directorName", "Nama direktur"),
      text("directorTitle", "Jabatan direktur"),
      area("directorMessage", "Sambutan direktur"),
      relation("directorPhoto", "Foto direktur", "mediaUrls"),
      list("vision", "Poin visi", "Tambahkan satu poin visi pada setiap baris."),
      list("mission", "Poin misi", "Tambahkan satu poin misi pada setiap baris."),
      area("teamSummary", "Ringkasan tim"),
      list("portfolioFields", "Bidang pekerjaan"),
      list("developmentPlans", "Rencana pengembangan")
    ]
  },
  halaman: {
    title: "Isi Beranda",
    singular: "bagian beranda",
    model: "pageSection",
    permission: "content",
    listFields: ["key", "title", "status"],
    searchFields: ["key", "title"],
    noCreate: true,
    noDelete: true,
    fields: [
      {
        key: "key",
        label: "Bagian halaman",
        type: "select",
        options: sectionOptions,
        readOnly: true
      },
      text("title", "Judul"),
      {
        key: "content",
        label: "Isi bagian halaman",
        type: "sectionContent",
        relation: "mediaUrls",
        required: true,
        help: "Isi teks dan tombol melalui kolom yang tersedia."
      },
      select("status", "Status", publication),
      { key: "displayOrder", label: "Urutan", type: "number" }
    ]
  },
  galeri: {
    title: "Album Galeri",
    singular: "album",
    model: "galleryAlbum",
    permission: "content",
    listFields: ["title", "category", "status", "isFeatured"],
    searchFields: ["title", "category"],
    fields: [
      text("title", "Judul", true),
      slug(),
      area("description", "Deskripsi"),
      {
        key: "category",
        label: "Jenis kegiatan",
        type: "select",
        required: true,
        options: choices(
          ["Kantor", "Kantor"],
          ["Sosialisasi", "Sosialisasi"],
          ["Rekrutmen", "Rekrutmen"],
          ["Pelatihan", "Pelatihan"],
          ["Kegiatan", "Kegiatan"],
          ["Pemberangkatan", "Pemberangkatan"],
          ["Lainnya", "Lainnya"]
        )
      },
      text("location", "Lokasi"),
      { key: "eventDate", label: "Tanggal kegiatan", type: "date" },
      select("status", "Status", publication),
      featured(
        "Album pertama yang diterbitkan akan ditampilkan di beranda secara otomatis. Aktifkan ini untuk memilih album lain."
      ),
      order()
    ]
  },
  negara: {
    title: "Negara Tujuan",
    singular: "negara",
    model: "country",
    permission: "content",
    listFields: ["name", "programStatus", "status", "isFeatured"],
    searchFields: ["name", "summary"],
    fields: [
      text("name", "Nama", true),
      slug("name"),
      {
        key: "isoCode",
        label: "Kode negara",
        help: "Contoh: TW untuk Taiwan atau MY untuk Malaysia."
      },
      area("summary", "Ringkasan"),
      area("programDescription", "Penjelasan program", false),
      {
        ...relation("coverMediaId", "Foto negara", "mediaImages"),
        help: "Foto ini muncul di halaman detail negara setelah diterbitkan. Bendera dibuat otomatis dari nama negara."
      },
      list(
        "requirements",
        "Dokumen umum untuk semua pekerjaan",
        "Satu dokumen per baris. Rincian usia, pengalaman, dan gaji diubah pada menu Pekerjaan Negara."
      ),
      select(
        "programStatus",
        "Ketersediaan program",
        choices(
          ["AVAILABLE", "Tersedia"],
          ["NOT_OPEN", "Belum dibuka"],
          ["MORE_INFO", "Hubungi kami untuk informasi"]
        )
      ),
      select("status", "Publikasi", publication),
      featured("Negara terpilih tampil di bagian Negara Tujuan pada beranda."),
      order(),
      text("metaTitle", "Judul untuk Google"),
      area("metaDescription", "Deskripsi untuk Google")
    ]
  },
  "pekerjaan-negara": {
    title: "Pekerjaan Negara",
    singular: "pekerjaan negara",
    model: "countryOccupation",
    permission: "content",
    listFields: ["title", "countryId", "gender", "status"],
    searchFields: ["title"],
    fields: [
      relation("countryId", "Negara tujuan", "countries", true),
      text("title", "Nama pekerjaan", true),
      slug("title"),
      {
        ...select(
          "gender",
          "Untuk calon pekerja",
          choices(["PEREMPUAN", "Perempuan"], ["LAKI_LAKI", "Laki-laki"])
        ),
        help: "Biarkan kosong bila revisi klien tidak menentukan jenis kelamin untuk pekerjaan ini."
      },
      { key: "ageMin", label: "Usia minimum (tahun)", type: "number" },
      { key: "ageMax", label: "Usia maksimum (tahun)", type: "number" },
      text("experienceRequirement", "Pengalaman kerja yang dibutuhkan"),
      text("healthRequirement", "Syarat kesehatan"),
      list("additionalCriteria", "Kriteria tambahan", "Isi satu syarat per baris, jika ada."),
      {
        ...text("salaryLabel", "Gaji pokok"),
        help: "Tulis mata uang dan nominal, misalnya RM 1.700. Biarkan kosong bila belum dicantumkan."
      },
      select("status", "Publikasi", publication),
      order()
    ]
  },
  lowongan: {
    title: "Lowongan",
    singular: "lowongan",
    model: "job",
    permission: "content",
    listFields: ["title", "status", "deadline", "isFeatured"],
    searchFields: ["title", "summary"],
    fields: [
      text("title", "Judul", true),
      slug(),
      relation("countryId", "Negara tujuan", "countries", true),
      relation("sectorId", "Bidang pekerjaan", "sectors"),
      text("employmentType", "Jenis kontrak"),
      area("summary", "Ringkasan", true),
      area("description", "Deskripsi", true),
      list("responsibilities", "Tanggung jawab"),
      list("requirements", "Persyaratan"),
      list("qualifications", "Kualifikasi"),
      list("facilities", "Fasilitas"),
      { key: "positions", label: "Jumlah posisi", type: "number" },
      { key: "deadline", label: "Batas pendaftaran", type: "date" },
      text("sourceReference", "Referensi job order"),
      text("sourceUrl", "URL sumber"),
      area("feeNotes", "Catatan biaya"),
      select(
        "status",
        "Status",
        choices(
          ["DRAFT", "Simpan, belum tampil di website"],
          ["OPEN", "Tampilkan sebagai lowongan dibuka"],
          ["CLOSED", "Tutup lowongan"]
        )
      ),
      featured("Lowongan terpilih dapat ditonjolkan di website.")
    ]
  },
  berita: {
    title: "Berita & Artikel",
    singular: "artikel",
    model: "article",
    permission: "content",
    listFields: ["title", "status", "isFeatured", "publishedAt"],
    searchFields: ["title", "excerpt"],
    fields: [
      text("title", "Judul", true),
      slug(),
      area("excerpt", "Ringkasan", true),
      area("body", "Isi", true),
      relation("coverMediaId", "Foto utama", "media"),
      relation("categoryId", "Kategori artikel", "articleCategories"),
      list("tags", "Kata kunci / tag"),
      select("status", "Status", publication),
      featured("Artikel terpilih dapat ditonjolkan di website."),
      text("metaTitle", "Judul untuk Google"),
      area("metaDescription", "Deskripsi untuk Google")
    ]
  },
  testimoni: {
    title: "Testimoni",
    singular: "testimoni",
    model: "testimonial",
    permission: "content",
    listFields: ["displayName", "country", "approval", "status", "consentToPublish"],
    searchFields: ["displayName", "quote"],
    fields: [
      text("displayName", "Nama/alias", true),
      text("country", "Negara"),
      text("occupation", "Pekerjaan"),
      area("quote", "Kutipan", true),
      relation("photoMediaId", "Foto", "media"),
      { key: "consentToPublish", label: "Izin publikasi", type: "boolean" },
      select(
        "approval",
        "Persetujuan",
        choices(
          ["PENDING", "Menunggu pemeriksaan"],
          ["APPROVED", "Disetujui"],
          ["REJECTED", "Ditolak"]
        )
      ),
      select("status", "Status", publication),
      featured("Testimoni terpilih tampil lebih dahulu."),
      order()
    ]
  },
  pelatihan: {
    title: "Program Pelatihan",
    singular: "program",
    model: "trainingProgram",
    permission: "content",
    listFields: ["title", "status", "isFeatured"],
    searchFields: ["title", "description"],
    fields: [
      text("title", "Judul", true),
      slug(),
      area("description", "Deskripsi", true),
      list("materials", "Materi pelatihan"),
      relation("coverMediaId", "Foto utama", "media"),
      select("status", "Status", publication),
      featured("Program terpilih tampil di beranda."),
      order()
    ]
  },
  layanan: {
    title: "Layanan",
    singular: "layanan",
    model: "service",
    permission: "content",
    listFields: ["title", "status"],
    searchFields: ["title", "description"],
    fields: [
      text("title", "Judul", true),
      slug(),
      { key: "icon", label: "Ikon", type: "select", options: iconOptions, required: true },
      area("description", "Deskripsi", true),
      area("detail", "Rincian"),
      { key: "href", label: "Halaman tujuan", type: "select", options: pageLinkOptions },
      select("status", "Status", publication),
      order()
    ]
  },
  tim: {
    title: "Tim",
    singular: "anggota",
    model: "teamMember",
    permission: "content",
    listFields: ["name", "position", "status"],
    searchFields: ["name", "position"],
    fields: [
      text("name", "Nama", true),
      text("position", "Jabatan", true),
      area("bio", "Bio"),
      relation("photoMediaId", "Foto anggota tim", "media"),
      select("status", "Status", publication),
      order()
    ]
  },
  alur: {
    title: "Alur Penempatan",
    singular: "tahap",
    model: "placementStep",
    permission: "content",
    listFields: ["title", "status"],
    searchFields: ["title", "description"],
    fields: [
      text("title", "Judul", true),
      area("description", "Deskripsi"),
      { key: "icon", label: "Ikon", type: "select", options: iconOptions, required: true },
      select("status", "Status", publication),
      order()
    ]
  },
  faq: {
    title: "FAQ",
    singular: "FAQ",
    model: "faq",
    permission: "content",
    listFields: ["question", "category", "status"],
    searchFields: ["question", "answer"],
    fields: [
      {
        key: "category",
        label: "Topik",
        type: "select",
        required: true,
        options: choices(
          ["Pendaftaran", "Pendaftaran"],
          ["Persyaratan", "Persyaratan"],
          ["Proses", "Proses penempatan"],
          ["Biaya", "Biaya"],
          ["Legalitas", "Legalitas"],
          ["Lainnya", "Lainnya"]
        )
      },
      text("question", "Pertanyaan", true),
      area("answer", "Jawaban", true),
      select("status", "Status", publication),
      order()
    ]
  },
  legalitas: {
    title: "Legalitas",
    singular: "dokumen",
    model: "legalDocument",
    permission: "content",
    listFields: ["title", "permitType", "permitNumber", "status", "needsReview"],
    searchFields: ["title", "permitType", "permitNumber"],
    fields: [
      text("title", "Judul", true),
      text("permitType", "Jenis izin", true),
      text("permitNumber", "Nomor"),
      { key: "issuedAt", label: "Tanggal terbit", type: "date" },
      {
        key: "issuedYear",
        label: "Tahun terbit (jika tanggal lengkap tidak diketahui)",
        type: "number"
      },
      { key: "validUntil", label: "Berlaku sampai", type: "date" },
      area("description", "Keterangan"),
      text("sourceUrl", "Tautan sumber resmi"),
      text("sourceLabel", "Nama sumber"),
      relation("documentMediaId", "Berkas dokumen", "media"),
      { key: "verifiedAt", label: "Tanggal verifikasi", type: "date" },
      { key: "needsReview", label: "Perlu ditinjau", type: "boolean" },
      select("status", "Status", publication),
      order()
    ]
  },
  pendaftar: {
    title: "Pendaftar",
    singular: "pendaftar",
    model: "application",
    permission: "applications",
    listFields: ["referenceNumber", "fullName", "phone", "status", "createdAt"],
    searchFields: ["referenceNumber", "fullName", "phone", "email"],
    noCreate: true,
    noDelete: true,
    fields: [
      select(
        "status",
        "Status",
        choices(
          ["NEW", "Baru"],
          ["CONTACTED", "Sudah dihubungi"],
          ["SCREENING", "Tahap pemeriksaan awal"],
          ["IN_PROCESS", "Sedang diproses"],
          ["COMPLETED", "Selesai"],
          ["REJECTED", "Tidak dilanjutkan"],
          ["WITHDRAWN", "Mengundurkan diri"]
        )
      ),
      relation("assignedToId", "Staf penanggung jawab", "users")
    ]
  },
  pesan: {
    title: "Pesan Masuk",
    singular: "pesan",
    model: "contactMessage",
    permission: "messages",
    listFields: ["name", "subject", "email", "status", "createdAt"],
    searchFields: ["name", "subject", "message", "email"],
    noCreate: true,
    fields: [
      select(
        "status",
        "Status",
        choices(
          ["UNREAD", "Belum dibaca"],
          ["READ", "Sudah dibaca"],
          ["FOLLOW_UP", "Perlu ditindaklanjuti"],
          ["RESOLVED", "Selesai"],
          ["SPAM", "Spam"],
          ["ARCHIVED", "Diarsipkan"]
        )
      ),
      relation("assignedToId", "Staf penanggung jawab", "users")
    ]
  },
  aktivitas: {
    title: "Riwayat Aktivitas",
    singular: "aktivitas",
    model: "auditLog",
    permission: "audit",
    listFields: ["createdAt", "action", "entityType", "summary"],
    readonly: true,
    noDelete: true,
    fields: []
  }
};

export const mutationEnvelope = z.object({
  id: z.string().optional(),
  data: z.record(z.string(), z.unknown()).default({})
});

export function normalizeAdminPayload(config: AdminResourceConfig, raw: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const field of config.fields) {
    const value = raw[field.key];
    if (value === undefined) continue;
    if (field.type === "number") {
      if (field.key === "displayOrder" && (value === "" || value === null)) continue;
      result[field.key] = value === "" || value === null ? null : Number(value);
    } else if (field.type === "boolean") result[field.key] = Boolean(value);
    else if (field.type === "date") result[field.key] = value ? new Date(String(value)) : null;
    else if (field.type === "slug")
      result[field.key] =
        String(value ?? "").trim() || createSlug(String(raw[field.autoFrom ?? "title"] ?? ""));
    else if (field.type === "list")
      result[field.key] = Array.isArray(value)
        ? value.map((item) => String(item).trim()).filter(Boolean)
        : [];
    else if (field.type === "genderCriteria")
      result[field.key] = normalizeCountryGenderCriteria(value);
    else if (field.type === "socialLinks" && value && typeof value === "object")
      result[field.key] = Object.fromEntries(
        Object.entries(value).filter(([, entry]) => String(entry ?? "").trim())
      );
    else result[field.key] = value === "" ? null : value;
  }
  if (result.issuedAt instanceof Date && !Number.isNaN(result.issuedAt.getTime()))
    result.issuedYear = result.issuedAt.getFullYear();
  return result;
}
