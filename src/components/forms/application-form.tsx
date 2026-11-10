"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applicationSchema } from "@/lib/validation";

type Values = z.input<typeof applicationSchema>;

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
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Values>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      domicile: "",
      countryId: defaultCountryId,
      jobId: defaultJobId,
      workExperience: "",
      message: "",
      consent: false as unknown as true,
      website: "",
      idempotencyKey
    }
  });

  const submit = handleSubmit(async (values) => {
    setResult(null);
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { message?: string; referenceNumber?: string };
    if (!response.ok)
      return setResult({
        type: "error",
        message: payload.message ?? "Pendaftaran belum dapat disimpan."
      });
    setResult({
      type: "success",
      message: `Terima kasih, pendaftaran awal Anda sudah kami terima. Nomor referensi internal: ${payload.referenceNumber}.`
    });
    reset({
      fullName: "",
      phone: "",
      email: "",
      domicile: "",
      countryId: defaultCountryId,
      jobId: defaultJobId,
      workExperience: "",
      message: "",
      consent: false as unknown as true,
      website: "",
      idempotencyKey: crypto.randomUUID()
    });
  });

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="fullName">Nama lengkap *</label>
          <input id="fullName" autoComplete="name" {...register("fullName")} />
          {errors.fullName ? (
            <span className="form-status error">{errors.fullName.message}</span>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="phone">Nomor HP/WhatsApp *</label>
          <input id="phone" autoComplete="tel" {...register("phone")} />
          {errors.phone ? <span className="form-status error">{errors.phone.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="email">Email (opsional)</label>
          <input id="email" type="email" autoComplete="email" {...register("email")} />
        </div>
        <div className="field">
          <label htmlFor="domicile">Kabupaten/kota domisili *</label>
          <input id="domicile" autoComplete="address-level2" {...register("domicile")} />
        </div>
        <div className="field">
          <label htmlFor="countryId">Negara diminati</label>
          <select id="countryId" {...register("countryId")}>
            <option value="">Belum menentukan</option>
            {countries.map((country) => (
              <option value={country.id} key={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="jobId">Lowongan (opsional)</label>
          <select id="jobId" {...register("jobId")}>
            <option value="">Tidak memilih lowongan</option>
            {jobs.map((job) => (
              <option value={job.id} key={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="workExperience">Pengalaman kerja singkat (opsional)</label>
          <textarea id="workExperience" {...register("workExperience")} />
        </div>
        <div className="field field-full">
          <label htmlFor="message">Pesan (opsional)</label>
          <textarea id="message" {...register("message")} />
        </div>
        <div style={{ position: "absolute", left: "-10000px" }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
        <div className="field field-full">
          <label className="checkbox-row">
            <input type="checkbox" {...register("consent")} />
            <span>
              Saya menyetujui penggunaan data ini untuk menindaklanjuti pendaftaran awal sesuai{" "}
              <Link className="text-link" href="/kebijakan-privasi">
                Kebijakan Privasi
              </Link>
              . *
            </span>
          </label>
          {errors.consent ? (
            <span className="form-status error">Persetujuan wajib diberikan.</span>
          ) : null}
        </div>
        <div className="field-full">
          {result ? <p className={`form-status ${result.type}`}>{result.message}</p> : null}
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Menyimpan…" : "Kirim Pendaftaran Awal"}
          </button>
        </div>
      </div>
    </form>
  );
}
