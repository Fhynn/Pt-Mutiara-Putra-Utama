"use client";

import Image from "next/image";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminField, AdminOption, AdminResourceConfig } from "@/lib/admin-resources";
import { inferCountryIso } from "@/lib/country-flags";

type FormValue = string | number | boolean | string[] | Record<string, unknown> | null;
type FormState = Record<string, FormValue>;
type RelationOptions = Record<string, AdminOption[]>;

const sectionBlueprints: Record<
  string,
  Array<{ key: string; label: string; type?: "textarea" | "list" | "image" | "link" }>
> = {
  hero: [
    { key: "eyebrow", label: "Teks kecil di atas judul" },
    { key: "title", label: "Judul utama" },
    { key: "body", label: "Deskripsi", type: "textarea" },
    { key: "primaryLabel", label: "Teks tombol utama" },
    { key: "primaryHref", label: "Tujuan tombol utama", type: "link" },
    { key: "secondaryLabel", label: "Teks tombol kedua" },
    { key: "secondaryHref", label: "Tujuan tombol kedua", type: "link" },
    { key: "image", label: "Foto utama", type: "image" }
  ],
  "quick-facts": [{ key: "items", label: "Fakta singkat", type: "list" }],
  about: [
    { key: "title", label: "Judul" },
    { key: "body", label: "Deskripsi", type: "textarea" },
    { key: "image", label: "Foto", type: "image" }
  ],
  "final-cta": [
    { key: "title", label: "Judul ajakan" },
    { key: "body", label: "Deskripsi", type: "textarea" },
    { key: "primaryLabel", label: "Teks tombol utama" },
    { key: "primaryHref", label: "Tujuan tombol utama", type: "link" },
    { key: "secondaryLabel", label: "Teks tombol kedua" },
    { key: "secondaryHref", label: "Tujuan tombol kedua", type: "link" }
  ]
};

const pageLinks: AdminOption[] = [
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

const fieldNameLabels: Record<string, string> = {
  createdAt: "Dibuat",
  updatedAt: "Terakhir diubah",
  publishedAt: "Tanggal terbit",
  deadline: "Batas pendaftaran",
  displayOrder: "Urutan tampilan",
  isFeatured: "Tampil di beranda",
  status: "Status",
  key: "Bagian",
  referenceNumber: "Nomor pendaftaran",
  fullName: "Nama lengkap",
  phone: "Telepon",
  email: "Email",
  subject: "Subjek",
  action: "Aktivitas",
  entityType: "Jenis data",
  summary: "Keterangan",
  needsReview: "Perlu ditinjau"
};

const resourceDescriptions: Record<string, string> = {
  halaman: "Perubahan teks dan foto akan muncul di halaman Beranda setelah ditampilkan di website.",
  profil: "Perubahan akan muncul di halaman Tentang Kami.",
  pengaturan: "Ubah kontak, alamat, dan identitas yang dipakai di seluruh website.",
  negara:
    "Atur nama, foto, ringkasan, dan dokumen umum negara. Rincian tiap pekerjaan diubah lewat menu Pekerjaan Negara.",
  "pekerjaan-negara":
    "Setiap pekerjaan muncul pada halaman negara yang dipilih. Usia, pengalaman, gaji, dan jenis kelamin tampil di halaman rincian pekerjaan.",
  lowongan: "Lowongan yang dibuka muncul di halaman Lowongan dan halaman negara terkait.",
  galeri:
    "Album yang ditampilkan muncul di halaman Galeri. Setelah membuat album, tambahkan fotonya.",
  berita: "Artikel yang ditampilkan muncul di halaman Berita.",
  testimoni:
    "Testimoni muncul di halaman Testimoni jika izin publikasi dan persetujuannya sudah lengkap.",
  pelatihan: "Program yang ditampilkan muncul di halaman Program Pelatihan.",
  layanan: "Layanan yang ditampilkan muncul di halaman Layanan dan Beranda.",
  tim: "Anggota tim yang ditampilkan muncul di halaman Tentang Kami.",
  alur: "Tahapan yang ditampilkan muncul di bagian Alur Penempatan pada Beranda.",
  faq: "Pertanyaan yang ditampilkan muncul di halaman FAQ dan beberapa di Beranda.",
  legalitas: "Dokumen yang ditampilkan muncul di halaman Legalitas dan sebagian di Beranda."
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyValue(field: AdminField): FormValue {
  if (field.type === "boolean") return false;
  if (field.type === "list") return [];
  if (
    field.type === "socialLinks" ||
    field.type === "sectionContent" ||
    field.type === "genderCriteria"
  )
    return {};
  if (field.type === "select") {
    if (field.key === "programStatus") return "MORE_INFO";
    if (field.key === "status" && field.options?.some((option) => option.value === "DRAFT"))
      return "DRAFT";
    if (field.key === "approval") return "PENDING";
  }
  return "";
}

function initialForm(config: AdminResourceConfig): FormState {
  return Object.fromEntries(config.fields.map((field) => [field.key, emptyValue(field)]));
}

function formFromItem(config: AdminResourceConfig, item: Record<string, unknown>): FormState {
  const next = initialForm(config);
  for (const field of config.fields) {
    const value = item[field.key];
    next[field.key] =
      field.type === "date" && value
        ? String(value).slice(0, 10)
        : ((value ?? emptyValue(field)) as FormValue);
  }
  return next;
}

const advancedFieldKeys = new Set([
  "displayOrder",
  "isFeatured",
  "faviconUrl",
  "logoUrl",
  "maintenanceMode",
  "privacyPolicy",
  "terms",
  "sourceReference",
  "sourceUrl",
  "needsReview"
]);

const detailGroups: Record<string, { title: string; keys: string[]; description: string }> = {
  negara: {
    title: "Dokumen umum",
    description: "Dokumen ini berlaku pada semua pekerjaan di negara tersebut.",
    keys: ["programDescription", "requirements"]
  },
  lowongan: {
    title: "Rincian pekerjaan dan persyaratan",
    description: "Tambahkan rincian yang sudah pasti sebelum membuka lowongan.",
    keys: [
      "employmentType",
      "responsibilities",
      "requirements",
      "qualifications",
      "facilities",
      "positions",
      "feeNotes"
    ]
  },
  pengaturan: {
    title: "Informasi tambahan website",
    description: "Isi bagian ini hanya bila informasinya sudah tersedia.",
    keys: [
      "alternateEmail",
      "mapUrl",
      "officeHours",
      "socialLinks",
      "announcement",
      "announcementEnabled"
    ]
  }
};

// These values are generated or retained by the system. They do not need an editor in the CMS.
const internalFieldKeys = new Set([
  "slug",
  "isoCode",
  "metaTitle",
  "metaDescription",
  "defaultMetaTitle",
  "defaultMetaDescription",
  "defaultOgImage",
  "analyticsId"
]);

function optionLabel(field: AdminField | undefined, value: unknown, relations: RelationOptions) {
  const options = field?.type === "relation" ? relations[field.relation ?? ""] : field?.options;
  return options?.find((option) => option.value === value)?.label;
}

function displayValue(value: unknown, field: AdminField | undefined, relations: RelationOptions) {
  if (value === null || value === undefined || value === "") return "—";
  const label = optionLabel(field, value, relations);
  if (label) return label;
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (Array.isArray(value)) return value.length ? `${value.length} item` : "—";
  if (typeof value === "object") return "Sudah diisi";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );
  return String(value);
}

function StringListEditor({
  value,
  onChange,
  label
}: {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
}) {
  const items = value.length ? value : [""];
  return (
    <div className="admin-list-editor">
      {items.map((item, index) => (
        <div className="admin-list-row" key={`${index}-${items.length}`}>
          <input
            aria-label={`${label} ${index + 1}`}
            placeholder={`Tulis ${label.toLowerCase()}…`}
            value={item}
            onChange={(event) => {
              const next = [...items];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <button
            aria-label={`Hapus ${label.toLowerCase()} ${index + 1}`}
            className="admin-icon-button danger"
            type="button"
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button className="admin-button" type="button" onClick={() => onChange([...items, ""])}>
        <Plus size={16} /> Tambah {label.toLowerCase()}
      </button>
    </div>
  );
}

function GenderCriteriaEditor({
  value,
  onChange
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const enabled = "women" in value || "men" in value;
  function group(gender: "women" | "men") {
    const current = value[gender];
    const data = current && typeof current === "object" && !Array.isArray(current) ? current : {};
    return {
      jobs: "jobs" in data && Array.isArray(data.jobs) ? data.jobs.map(String) : [],
      criteria: "criteria" in data && Array.isArray(data.criteria) ? data.criteria.map(String) : []
    };
  }
  function update(gender: "women" | "men", key: "jobs" | "criteria", entries: string[]) {
    onChange({ ...value, [gender]: { ...group(gender), [key]: entries } });
  }
  return (
    <div className="wide admin-gender-criteria">
      <div className="admin-gender-criteria-head">
        <div>
          <strong>Pisahkan persyaratan perempuan dan laki-laki</strong>
          <p>Aktifkan bila pilihan pekerjaan atau kriterianya berbeda.</p>
        </div>
        <button
          className={`admin-switch ${enabled ? "active" : ""}`}
          aria-pressed={enabled}
          type="button"
          onClick={() =>
            onChange(
              enabled
                ? {}
                : {
                    women: { jobs: [], criteria: [] },
                    men: { jobs: [], criteria: [] }
                  }
            )
          }
        >
          <span aria-hidden="true" />
          {enabled ? "Aktif" : "Tidak aktif"}
        </button>
      </div>
      {enabled ? (
        <div className="admin-gender-criteria-grid">
          {(["women", "men"] as const).map((gender) => {
            const label = gender === "women" ? "perempuan" : "laki-laki";
            const current = group(gender);
            return (
              <section className="admin-gender-criteria-group" key={gender}>
                <h3>Untuk {label}</h3>
                <div>
                  <strong>Pekerjaan {label}</strong>
                  <StringListEditor
                    label={`Pekerjaan ${label}`}
                    value={current.jobs}
                    onChange={(entries) => update(gender, "jobs", entries)}
                  />
                </div>
                <div>
                  <strong>Kriteria {label}</strong>
                  <StringListEditor
                    label={`Kriteria ${label}`}
                    value={current.criteria}
                    onChange={(entries) => update(gender, "criteria", entries)}
                  />
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SocialLinksEditor({
  value,
  onChange
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const platforms = [
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["youtube", "YouTube"],
    ["linkedin", "LinkedIn"]
  ] as const;
  return (
    <div className="admin-subgrid">
      {platforms.map(([key, label]) => (
        <label key={key}>
          <span>{label}</span>
          <input
            placeholder={`Tautan profil ${label}`}
            type="url"
            value={String(value[key] ?? "")}
            onChange={(event) => onChange({ ...value, [key]: event.target.value })}
          />
        </label>
      ))}
    </div>
  );
}

function SectionContentEditor({
  sectionKey,
  value,
  mediaOptions,
  onChange,
  onImageUpload,
  imageUploading
}: {
  sectionKey: string;
  value: Record<string, unknown>;
  mediaOptions: AdminOption[];
  onChange: (value: Record<string, unknown>) => void;
  onImageUpload: (file: File) => Promise<void>;
  imageUploading: boolean;
}) {
  const blueprint =
    sectionBlueprints[sectionKey] ??
    Object.entries(value).map(([key, entry]) => ({
      key,
      label: key,
      type: Array.isArray(entry) ? ("list" as const) : undefined
    }));

  return (
    <div className="admin-structured-editor">
      {blueprint.map((item) =>
        item.type === "image" ? (
          <div className="wide admin-simple-media-field" key={item.key}>
            <strong>{item.label}</strong>
            <div className="admin-simple-media-content">
              <div className="admin-simple-media-preview">
                {value[item.key] ? (
                  <Image
                    src={String(value[item.key])}
                    alt={item.label}
                    fill
                    sizes="(max-width: 700px) 100vw, 220px"
                  />
                ) : (
                  <span>Belum ada foto</span>
                )}
              </div>
              <div className="admin-simple-media-actions">
                <label className="admin-button primary admin-simple-media-upload">
                  <span>
                    {imageUploading
                      ? "Mengunggah…"
                      : value[item.key]
                        ? "Ganti foto"
                        : "Unggah foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    aria-label={`Unggah ${item.label.toLowerCase()}`}
                    disabled={imageUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) void onImageUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>
            {mediaOptions.length > 0 ? (
              <details>
                <summary>Pilih foto yang sudah ada</summary>
                <select
                  aria-label={`Pilih ${item.label.toLowerCase()} yang sudah ada`}
                  value={String(value[item.key] ?? "")}
                  onChange={(event) => onChange({ ...value, [item.key]: event.target.value })}
                >
                  <option value="">Belum dipilih</option>
                  {mediaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {value[item.key] &&
                  !mediaOptions.some((option) => option.value === value[item.key]) ? (
                    <option value={String(value[item.key])}>Foto yang sedang digunakan</option>
                  ) : null}
                </select>
              </details>
            ) : null}
          </div>
        ) : (
          <label
            className={item.type === "textarea" || item.type === "list" ? "wide" : ""}
            key={item.key}
          >
            <span>{item.label}</span>
            {item.type === "textarea" ? (
              <textarea
                rows={4}
                value={String(value[item.key] ?? "")}
                onChange={(event) => onChange({ ...value, [item.key]: event.target.value })}
              />
            ) : item.type === "list" ? (
              <StringListEditor
                label={item.label}
                value={Array.isArray(value[item.key]) ? (value[item.key] as string[]) : []}
                onChange={(items) => onChange({ ...value, [item.key]: items })}
              />
            ) : item.type === "link" ? (
              <select
                value={String(value[item.key] ?? "")}
                onChange={(event) => onChange({ ...value, [item.key]: event.target.value })}
              >
                <option value="">Pilih halaman tujuan</option>
                {pageLinks.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={String(value[item.key] ?? "")}
                onChange={(event) => onChange({ ...value, [item.key]: event.target.value })}
              />
            )}
          </label>
        )
      )}
    </div>
  );
}

export function ResourceManager({
  resource,
  config,
  initialItems,
  relationOptions
}: {
  resource: string;
  config: AdminResourceConfig;
  initialItems: Record<string, unknown>[];
  relationOptions: RelationOptions;
}) {
  const singleton = resource === "pengaturan" || resource === "profil";
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<FormState>(() =>
    singleton && initialItems[0] ? formFromItem(config, initialItems[0]) : initialForm(config)
  );
  const [editingId, setEditingId] = useState<string | null>(
    singleton && initialItems[0] ? String(initialItems[0].id) : null
  );
  const [formOpen, setFormOpen] = useState(singleton && Boolean(initialItems[0]));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoUploading, setPhotoUploading] = useState<string | null>(null);
  const [savedAlbumId, setSavedAlbumId] = useState<string | null>(null);
  const [availableRelationOptions, setAvailableRelationOptions] = useState(relationOptions);
  const detailGroup = detailGroups[resource];
  const standardFields = config.fields.filter(
    (field) =>
      !field.hidden &&
      !internalFieldKeys.has(field.key) &&
      !advancedFieldKeys.has(field.key) &&
      !detailGroup?.keys.includes(field.key)
  );
  const genderSplitEnabled =
    resource === "negara" &&
    form.genderCriteria &&
    typeof form.genderCriteria === "object" &&
    !Array.isArray(form.genderCriteria) &&
    ("women" in form.genderCriteria || "men" in form.genderCriteria);
  const detailFields = config.fields.filter(
    (field) =>
      !field.hidden &&
      detailGroup?.keys.includes(field.key) &&
      !(genderSplitEnabled && field.key === "criteria")
  );
  const advancedFields = config.fields.filter(
    (field) =>
      !field.hidden && !internalFieldKeys.has(field.key) && advancedFieldKeys.has(field.key)
  );
  const filtered = useMemo(
    () =>
      query
        ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
        : items,
    [items, query]
  );

  function updateField(field: AdminField, value: FormValue) {
    setForm((current) => {
      const next = { ...current, [field.key]: value };
      if (resource === "negara" && field.key === "name") {
        const code = inferCountryIso(String(value ?? ""));
        if (code) next.isoCode = code;
        else if (!editingId) next.isoCode = "";
      }
      for (const slugField of config.fields.filter(
        (candidate) => candidate.type === "slug" && candidate.autoFrom === field.key
      )) {
        if (!editingId || !current[slugField.key])
          next[slugField.key] = slugify(String(value ?? ""));
      }
      return next;
    });
  }

  async function uploadMediaForField(field: AdminField, file: File) {
    setPhotoUploading(field.key);
    setMessage("");
    try {
      const data = new FormData();
      data.append("files", file);
      data.append("visibility", "PUBLIC");
      data.append("altText", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "File gagal diunggah.");
      const uploaded = body.items?.[0];
      const isDocument = field.key === "documentMediaId";
      if (
        !uploaded?.id ||
        !uploaded.publicUrl ||
        (isDocument ? !["PDF", "IMAGE"].includes(uploaded.kind) : uploaded.kind !== "IMAGE")
      )
        throw new Error("File belum siap digunakan. Coba unggah ulang.");
      const option: AdminOption = {
        value: field.relation === "mediaUrls" ? uploaded.publicUrl : uploaded.id,
        label: file.name,
        previewUrl: uploaded.kind === "IMAGE" ? uploaded.publicUrl : undefined,
        kind: uploaded.kind
      };
      const relation = field.relation ?? "mediaImages";
      setAvailableRelationOptions((current) => ({
        ...current,
        [relation]: [option, ...(current[relation] ?? [])]
      }));
      updateField(field, option.value);
      setMessage("File berhasil diunggah. Klik Simpan perubahan untuk memasangnya.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "File gagal diunggah.");
    } finally {
      setPhotoUploading(null);
    }
  }

  async function uploadSectionImage(file: File) {
    setPhotoUploading("sectionImage");
    setMessage("");
    try {
      const data = new FormData();
      data.append("files", file);
      data.append("visibility", "PUBLIC");
      data.append("altText", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Foto gagal diunggah.");
      const uploaded = body.items?.[0];
      if (uploaded?.kind !== "IMAGE" || !uploaded.publicUrl)
        throw new Error("Foto belum siap digunakan. Coba unggah ulang.");
      setAvailableRelationOptions((current) => ({
        ...current,
        mediaUrls: [
          {
            value: uploaded.publicUrl,
            label: file.name,
            previewUrl: uploaded.publicUrl,
            kind: "IMAGE"
          },
          ...(current.mediaUrls ?? [])
        ]
      }));
      setForm((current) => ({
        ...current,
        content: {
          ...(current.content &&
          typeof current.content === "object" &&
          !Array.isArray(current.content)
            ? current.content
            : {}),
          image: uploaded.publicUrl
        }
      }));
      setMessage("Foto berhasil diunggah. Klik Simpan perubahan untuk menampilkannya.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Foto gagal diunggah.");
    } finally {
      setPhotoUploading(null);
    }
  }

  function edit(item: Record<string, unknown>) {
    setEditingId(String(item.id));
    setForm(formFromItem(config, item));
    setFormOpen(true);
    setMessage("");
    setSavedAlbumId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function reload() {
    const response = await fetch(`/api/admin/${resource}`);
    const body = await response.json();
    if (response.ok) setItems(body.items);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const isNewAlbum = resource === "galeri" && !editingId;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId ?? undefined, data: form })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Gagal menyimpan data.");
      setSavedAlbumId(isNewAlbum ? String(body.item?.id ?? "") : null);
      await reload();
      if (!singleton) {
        setEditingId(null);
        setForm(initialForm(config));
        setFormOpen(false);
      }
      setMessage(
        isNewAlbum
          ? "Album tersimpan. Tambahkan foto agar album dapat ditampilkan."
          : "Perubahan berhasil disimpan."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan data.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus data ini? Tindakan akan dicatat di riwayat aktivitas.")) return;
    const response = await fetch(`/api/admin/${resource}?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "Gagal menghapus data.");
      return;
    }
    await reload();
    setMessage("Data berhasil dihapus.");
  }

  function renderField(field: AdminField) {
    const value = form[field.key] ?? emptyValue(field);
    if (field.type === "textarea")
      return (
        <textarea
          required={field.required}
          rows={5}
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(event) => updateField(field, event.target.value)}
        />
      );
    if (field.type === "list")
      return (
        <StringListEditor
          label={field.label}
          value={Array.isArray(value) ? value : []}
          onChange={(entries) => updateField(field, entries)}
        />
      );
    if (field.type === "genderCriteria")
      return (
        <GenderCriteriaEditor
          value={value && typeof value === "object" && !Array.isArray(value) ? value : {}}
          onChange={(next) => updateField(field, next)}
        />
      );
    if (field.type === "socialLinks")
      return (
        <SocialLinksEditor
          value={value && typeof value === "object" && !Array.isArray(value) ? value : {}}
          onChange={(links) => updateField(field, links)}
        />
      );
    if (field.type === "sectionContent")
      return (
        <SectionContentEditor
          sectionKey={String(form.key ?? "")}
          value={value && typeof value === "object" && !Array.isArray(value) ? value : {}}
          mediaOptions={availableRelationOptions.mediaUrls ?? []}
          onChange={(content) => updateField(field, content)}
          onImageUpload={uploadSectionImage}
          imageUploading={photoUploading === "sectionImage"}
        />
      );
    if (field.type === "select" || field.type === "relation") {
      const options =
        field.type === "relation" ? availableRelationOptions[field.relation ?? ""] : field.options;
      return (
        <select
          disabled={field.readOnly}
          required={field.required}
          value={String(value)}
          onChange={(event) => updateField(field, event.target.value)}
        >
          <option value="">Pilih…</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {value && !options?.some((option) => option.value === value) ? (
            <option value={String(value)}>Pilihan yang sedang digunakan</option>
          ) : null}
        </select>
      );
    }
    if (field.type === "boolean")
      return (
        <button
          aria-pressed={Boolean(value)}
          className={`admin-switch ${value ? "active" : ""}`}
          type="button"
          onClick={() => updateField(field, !value)}
        >
          <span aria-hidden="true" />
          {value ? "Aktif" : "Tidak aktif"}
        </button>
      );
    return (
      <input
        readOnly={field.readOnly || field.type === "slug"}
        required={field.required}
        placeholder={field.placeholder}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={String(value)}
        onChange={(event) => updateField(field, event.target.value)}
      />
    );
  }

  function renderFormField(field: AdminField) {
    if (field.type === "genderCriteria")
      return (
        <div className="wide" key={field.key}>
          {renderField(field)}
          {field.help ? <small>{field.help}</small> : null}
        </div>
      );
    if (
      field.type === "relation" &&
      ["media", "mediaImages", "mediaUrls"].includes(field.relation ?? "")
    ) {
      const isDocument = field.key === "documentMediaId";
      const available = (availableRelationOptions[field.relation ?? ""] ?? []).filter((option) =>
        isDocument ? ["PDF", "IMAGE"].includes(option.kind ?? "") : option.kind === "IMAGE"
      );
      const currentValue = String(form[field.key] ?? "");
      const selected = available.find((option) => option.value === currentValue);
      const imageUrl =
        selected?.previewUrl ||
        (field.relation === "mediaUrls" && /^(https:\/\/|\/)/.test(currentValue)
          ? currentValue
          : null);
      return (
        <div className="wide admin-simple-media-field" key={field.key}>
          <strong>{field.label}</strong>
          <div className="admin-simple-media-content">
            <div className="admin-simple-media-preview">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={selected?.label || field.label}
                  fill
                  sizes="(max-width: 700px) 100vw, 220px"
                />
              ) : selected?.kind === "PDF" ? (
                <FileText aria-label="Dokumen PDF" />
              ) : (
                <span>{currentValue ? "File terpasang" : "Belum ada file"}</span>
              )}
            </div>
            <div className="admin-simple-media-actions">
              <label className="admin-button primary admin-simple-media-upload">
                <span>
                  {photoUploading === field.key
                    ? "Mengunggah…"
                    : `${currentValue ? "Ganti" : "Unggah"} ${isDocument ? "dokumen" : "foto"}`}
                </span>
                <input
                  type="file"
                  accept={
                    isDocument
                      ? "application/pdf,image/jpeg,image/png,image/webp"
                      : "image/jpeg,image/png,image/webp,image/avif"
                  }
                  disabled={photoUploading !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadMediaForField(field, file);
                  }}
                />
              </label>
              {currentValue ? (
                <button
                  className="admin-button"
                  type="button"
                  onClick={() => updateField(field, "")}
                >
                  Lepas file
                </button>
              ) : null}
            </div>
          </div>
          {field.help ? <p>{field.help}</p> : null}
          {available.length ? (
            <details>
              <summary>Pilih {isDocument ? "dokumen" : "foto"} yang sudah ada</summary>
              <select
                aria-label={`Pilih ${field.label.toLowerCase()} yang sudah ada`}
                value={currentValue}
                onChange={(event) => updateField(field, event.target.value)}
              >
                <option value="">Belum dipilih</option>
                {available.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {currentValue && !selected ? (
                  <option value={currentValue}>File saat ini</option>
                ) : null}
              </select>
            </details>
          ) : null}
        </div>
      );
    }
    return (
      <label
        className={
          ["textarea", "list", "socialLinks", "sectionContent"].includes(field.type ?? "")
            ? "wide"
            : ""
        }
        key={field.key}
      >
        <span>
          {field.key === "status" ? "Tampilan di website" : field.label}
          {field.required ? " *" : ""}
        </span>
        {renderField(field)}
        {field.help && <small>{field.help}</small>}
      </label>
    );
  }

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>{config.title}</h1>
          <p>
            {resourceDescriptions[resource] ??
              `Tambah, perbarui, dan periksa ${config.title.toLowerCase()} yang tampil di website.`}
          </p>
        </div>
        {!config.readonly && !config.noCreate && (
          <button
            className="admin-button primary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm(config));
              setFormOpen(true);
              setMessage("");
              setSavedAlbumId(null);
            }}
          >
            <Plus size={16} aria-hidden="true" /> Tambah {config.singular}
          </button>
        )}
      </div>
      {!config.readonly && formOpen && (
        <section className="admin-panel" style={{ marginBottom: 20 }}>
          <div className="admin-panel-header">
            <h2>{editingId ? `Ubah ${config.singular}` : `Tambah ${config.singular}`}</h2>
            {!singleton && (
              <button
                className="admin-button"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm(config));
                  setFormOpen(false);
                }}
              >
                Batal
              </button>
            )}
          </div>
          {config.noCreate && !editingId ? (
            <p>
              Pilih <strong>Edit</strong> pada data yang ingin diperbarui.
            </p>
          ) : (
            <form onSubmit={save}>
              <div className="admin-form-grid">{standardFields.map(renderFormField)}</div>
              {detailFields.length > 0 && detailGroup && (
                <details className="admin-advanced admin-detail-group">
                  <summary>{detailGroup.title}</summary>
                  <p>{detailGroup.description}</p>
                  <div className="admin-form-grid">{detailFields.map(renderFormField)}</div>
                </details>
              )}
              {advancedFields.length > 0 && (
                <details className="admin-advanced">
                  <summary>Pengaturan tambahan</summary>
                  <p>Ubah bagian ini hanya jika diperlukan.</p>
                  <div className="admin-form-grid">{advancedFields.map(renderFormField)}</div>
                </details>
              )}
              <div className="admin-actions" style={{ marginTop: 18 }}>
                <button
                  className="admin-button primary"
                  disabled={busy || photoUploading !== null}
                  type="submit"
                >
                  {busy ? "Menyimpan…" : "Simpan perubahan"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
      {message && (
        <div className="admin-message" role="status">
          {message}
          {savedAlbumId ? (
            <a className="admin-button primary" href={`/admin/galeri/${savedAlbumId}`}>
              Tambahkan foto ke album
            </a>
          ) : null}
        </div>
      )}
      {!singleton && (
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>
              Daftar {config.title.toLowerCase()} ({filtered.length})
            </h2>
            <input
              aria-label="Cari data"
              placeholder="Cari…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {config.listFields.map((fieldKey) => {
                    const field = config.fields.find((candidate) => candidate.key === fieldKey);
                    return (
                      <th key={fieldKey}>
                        {field?.label ?? fieldNameLabels[fieldKey] ?? fieldKey}
                      </th>
                    );
                  })}
                  {!config.readonly && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((item) => (
                    <tr key={String(item.id)}>
                      {config.listFields.map((fieldKey) => {
                        const field = config.fields.find((candidate) => candidate.key === fieldKey);
                        return (
                          <td key={fieldKey}>
                            {displayValue(item[fieldKey], field, relationOptions)}
                          </td>
                        );
                      })}
                      {!config.readonly && (
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-button"
                              type="button"
                              onClick={() => edit(item)}
                            >
                              Ubah
                            </button>
                            {resource === "galeri" && (
                              <a className="admin-button" href={`/admin/galeri/${String(item.id)}`}>
                                Kelola foto
                              </a>
                            )}
                            {!config.noDelete && (
                              <button
                                className="admin-button danger"
                                type="button"
                                onClick={() => remove(String(item.id))}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={config.listFields.length + 1}>Belum ada data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
