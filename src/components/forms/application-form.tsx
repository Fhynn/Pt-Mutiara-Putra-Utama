"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { applicationSchema } from "@/lib/validation";

type Values = z.input<typeof applicationSchema>;

const sectorOptions = [
  ["FORMAL", "Formal"],
  ["SEMI_FORMAL", "Semi-formal"],
  ["INFORMAL", "Informal"]
] as const;
const genderOptions = [
  ["LAKI_LAKI", "Laki-laki"],
  ["PEREMPUAN", "Perempuan"]
] as const;
const maritalOptions = [
  ["BELUM_MENIKAH", "Belum menikah"],
  ["MENIKAH", "Menikah"],
  ["CERAI_HIDUP", "Cerai hidup"],
  ["CERAI_MATI", "Cerai mati"]
] as const;
const religionOptions = [
  ["ISLAM", "Islam"],
  ["KRISTEN", "Kristen"],
  ["KATOLIK", "Katolik"],
  ["HINDU", "Hindu"],
  ["BUDDHA", "Buddha"],
  ["KONGHUCU", "Konghucu"],
  ["LAINNYA", "Lainnya"]
] as const;

export function ApplicationForm({
  countries,
  jobs,
  defaultCountryId = "",
  defaultJobId = ""
}: {
  countries: Array<{ id: string; name: string }>;
  jobs: Array<{ id: string; title: string; countryId: string }>;
  defaultCountryId?: string;
  defaultJobId?: string;
}) {
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Values>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      countryId: defaultCountryId,
      sector: undefined,
      nik: "",
      birthPlace: "",
      birthDate: "",
      gender: undefined,
      maritalStatus: undefined,
      religion: undefined,
      heightCm: undefined,
      weightKg: undefined,
      address: "",
      rt: "",
      rw: "",
      village: "",
      district: "",
      domicile: "",
      province: "",
      jobId: defaultJobId,
      workExperience: "",
      consent: false as unknown as true,
      website: "",
      idempotencyKey
    }
  });
  const countryId = useWatch({ control, name: "countryId" });
  const availableJobs = jobs.filter((job) => job.countryId === countryId);
  const error = (key: keyof Values) =>
    errors[key]?.message ? (
      <span className="field-error" role="alert">
        {String(errors[key]?.message)}
      </span>
    ) : null;

  const submit = handleSubmit(async (values) => {
    setResult(null);
    if (!photo) {
      setPhotoError("Unggah satu foto pendaftar.");
      return;
    }
    const data = new FormData();
    data.set("data", JSON.stringify(values));
    data.set("photo", photo);
    try {
      const response = await fetch("/api/applications", { method: "POST", body: data });
      const payload = (await response.json()) as { message?: string; referenceNumber?: string };
      if (!response.ok) {
        setResult({
          type: "error",
          message: payload.message ?? "Pendaftaran belum dapat disimpan."
        });
        return;
      }
      setResult({
        type: "success",
        message: `Pendaftaran Anda sudah diterima. Simpan nomor referensi internal: ${payload.referenceNumber}.`
      });
      setPhoto(null);
      setPhotoError("");
      setPhotoInputKey((current) => current + 1);
      reset({
        fullName: "",
        phone: "",
        email: "",
        countryId: defaultCountryId,
        sector: undefined,
        nik: "",
        birthPlace: "",
        birthDate: "",
        gender: undefined,
        maritalStatus: undefined,
        religion: undefined,
        heightCm: undefined,
        weightKg: undefined,
        address: "",
        rt: "",
        rw: "",
        village: "",
        district: "",
        domicile: "",
        province: "",
        jobId: defaultJobId,
        workExperience: "",
        consent: false as unknown as true,
        website: "",
        idempotencyKey: crypto.randomUUID()
      });
    } catch {
      setResult({ type: "error", message: "Koneksi terputus. Coba kirim kembali." });
    }
  });

  return (
    <form
      className="form-card application-form"
      onSubmit={submit}
      noValidate
      encType="multipart/form-data"
    >
      <h2>Formulir Pendaftaran CPMI</h2>
      <p className="form-note">
        Kolom bertanda * wajib diisi. Data pendaftaran hanya dapat dibaca petugas berwenang.
      </p>
      <div className="form-grid">
        <h3 className="application-form-section">Program yang diminati</h3>
        <div className="field">
          <label htmlFor="countryId">Negara tujuan *</label>
          <select id="countryId" {...register("countryId")}>
            <option value="">Pilih negara</option>
            {countries.map((country) => (
              <option value={country.id} key={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          {error("countryId")}
        </div>
        <div className="field">
          <label htmlFor="sector">Sektor *</label>
          <select id="sector" {...register("sector")}>
            <option value="">Pilih sektor</option>
            {sectorOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          {error("sector")}
        </div>
        {availableJobs.length > 0 && (
          <div className="field field-full">
            <label htmlFor="jobId">Lowongan (opsional)</label>
            <select id="jobId" {...register("jobId")}>
              <option value="">Belum memilih lowongan</option>
              {availableJobs.map((job) => (
                <option value={job.id} key={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <h3 className="application-form-section">Data diri</h3>
        <div className="field field-full">
          <label htmlFor="fullName">Nama lengkap sesuai KTP *</label>
          <input id="fullName" autoComplete="name" {...register("fullName")} />
          {error("fullName")}
        </div>
        <div className="field">
          <label htmlFor="nik">Nomor NIK *</label>
          <input
            id="nik"
            inputMode="numeric"
            maxLength={16}
            autoComplete="off"
            {...register("nik")}
          />
          {error("nik")}
        </div>
        <div className="field">
          <label htmlFor="birthPlace">Tempat lahir *</label>
          <input id="birthPlace" autoComplete="off" {...register("birthPlace")} />
          {error("birthPlace")}
        </div>
        <div className="field">
          <label htmlFor="birthDate">Tanggal lahir *</label>
          <input
            id="birthDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...register("birthDate")}
          />
          {error("birthDate")}
        </div>
        <div className="field">
          <label htmlFor="gender">Jenis kelamin *</label>
          <select id="gender" {...register("gender")}>
            <option value="">Pilih jenis kelamin</option>
            {genderOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          {error("gender")}
        </div>
        <div className="field">
          <label htmlFor="maritalStatus">Status pernikahan *</label>
          <select id="maritalStatus" {...register("maritalStatus")}>
            <option value="">Pilih status</option>
            {maritalOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          {error("maritalStatus")}
        </div>
        <div className="field">
          <label htmlFor="religion">Agama *</label>
          <select id="religion" {...register("religion")}>
            <option value="">Pilih agama</option>
            {religionOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          {error("religion")}
        </div>
        <div className="field">
          <label htmlFor="heightCm">Tinggi badan (cm) *</label>
          <input
            id="heightCm"
            type="number"
            min={100}
            max={250}
            {...register("heightCm", { valueAsNumber: true })}
          />
          {error("heightCm")}
        </div>
        <div className="field">
          <label htmlFor="weightKg">Berat badan (kg) *</label>
          <input
            id="weightKg"
            type="number"
            min={25}
            max={300}
            {...register("weightKg", { valueAsNumber: true })}
          />
          {error("weightKg")}
        </div>

        <h3 className="application-form-section">Alamat dan kontak</h3>
        <div className="field field-full">
          <label htmlFor="address">Alamat lengkap *</label>
          <textarea id="address" autoComplete="street-address" {...register("address")} />
          {error("address")}
        </div>
        <div className="field">
          <label htmlFor="rt">RT *</label>
          <input id="rt" inputMode="numeric" maxLength={3} {...register("rt")} />
          {error("rt")}
        </div>
        <div className="field">
          <label htmlFor="rw">RW *</label>
          <input id="rw" inputMode="numeric" maxLength={3} {...register("rw")} />
          {error("rw")}
        </div>
        <div className="field">
          <label htmlFor="village">Desa / Kelurahan *</label>
          <input id="village" {...register("village")} />
          {error("village")}
        </div>
        <div className="field">
          <label htmlFor="district">Kecamatan *</label>
          <input id="district" {...register("district")} />
          {error("district")}
        </div>
        <div className="field">
          <label htmlFor="domicile">Kabupaten / Kota *</label>
          <input id="domicile" autoComplete="address-level2" {...register("domicile")} />
          {error("domicile")}
        </div>
        <div className="field">
          <label htmlFor="province">Provinsi *</label>
          <input id="province" autoComplete="address-level1" {...register("province")} />
          {error("province")}
        </div>
        <div className="field">
          <label htmlFor="phone">Nomor telepon / WhatsApp *</label>
          <input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          {error("phone")}
        </div>
        <div className="field">
          <label htmlFor="email">Email *</label>
          <input id="email" type="email" autoComplete="email" {...register("email")} />
          {error("email")}
        </div>

        <h3 className="application-form-section">Pengalaman dan foto</h3>
        <div className="field field-full">
          <label htmlFor="workExperience">Pengalaman kerja *</label>
          <textarea
            id="workExperience"
            placeholder="Contoh: Pernah bekerja di Jakarta selama 2 tahun sebagai asisten rumah tangga dan menjaga anak usia 5 tahun."
            {...register("workExperience")}
          />
          {error("workExperience")}
        </div>
        <div className="field field-full">
          <label htmlFor="photo">Unggah foto diri *</label>
          <input
            id="photo"
            key={photoInputKey}
            type="file"
            className="application-photo-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setPhoto(selected);
              setPhotoError(
                selected && selected.size > 2 * 1024 * 1024 ? "Ukuran foto maksimal 2 MB." : ""
              );
            }}
          />
          <label className="application-photo-picker" htmlFor="photo" aria-hidden="true">
            <span>{photo ? photo.name : "Pilih foto dari perangkat"}</span>
            <strong>Telusuri</strong>
          </label>
          <small className="field-help">
            JPG, PNG, atau WebP. Maksimal 2 MB dan satu foto. Foto disimpan privat.
          </small>
          {photoError && (
            <span className="field-error" role="alert">
              {photoError}
            </span>
          )}
        </div>
        <div className="application-honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
        <div className="field field-full">
          <label className="checkbox-row">
            <input type="checkbox" {...register("consent")} />
            <span>
              Saya menyetujui PT Mutiara Putra Utama memproses biodata, NIK, dan foto saya untuk
              memeriksa pendaftaran, sesuai{" "}
              <Link className="text-link" href="/kebijakan-privasi" target="_blank">
                Kebijakan Privasi
              </Link>
              , serta menyetujui{" "}
              <Link className="text-link" href="/syarat-ketentuan" target="_blank">
                Syarat &amp; Ketentuan
              </Link>
              . *
            </span>
          </label>
          {error("consent")}
        </div>
        <div className="field-full">
          {result && (
            <p className={`form-status ${result.type}`} role="status">
              {result.message}
            </p>
          )}
          <button
            className="button button-primary"
            disabled={isSubmitting || Boolean(photoError)}
            type="submit"
          >
            {isSubmitting ? "Mengirim…" : "Kirim Pendaftaran"}
          </button>
        </div>
      </div>
    </form>
  );
}
