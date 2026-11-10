"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { contactSchema } from "@/lib/validation";

type Values = z.input<typeof contactSchema>;

export function ContactForm() {
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Values>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      consent: false as unknown as true,
      website: ""
    }
  });
  const submit = handleSubmit(async (values) => {
    setResult(null);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok)
      return setResult({
        type: "error",
        message: payload.message ?? "Pesan belum dapat disimpan."
      });
    setResult({
      type: "success",
      message:
        "Pesan Anda sudah tersimpan. Tim MPU akan menindaklanjuti melalui kontak yang Anda berikan."
    });
    reset();
  });
  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Nama *</label>
          <input id="name" autoComplete="name" {...register("name")} />
          {errors.name ? <span className="form-status error">{errors.name.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" autoComplete="email" {...register("email")} />
        </div>
        <div className="field">
          <label htmlFor="contact-phone">Nomor telepon</label>
          <input id="contact-phone" autoComplete="tel" {...register("phone")} />
        </div>
        <div className="field">
          <label htmlFor="subject">Subjek *</label>
          <input id="subject" {...register("subject")} />
        </div>
        <div className="field field-full">
          <label htmlFor="contact-message">Pesan *</label>
          <textarea id="contact-message" {...register("message")} />
          {errors.message ? (
            <span className="form-status error">{errors.message.message}</span>
          ) : null}
        </div>
        <div style={{ position: "absolute", left: "-10000px" }} aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
        <div className="field field-full">
          <label className="checkbox-row">
            <input type="checkbox" {...register("consent")} />
            <span>
              Saya menyetujui penggunaan data untuk menindaklanjuti pesan ini sesuai{" "}
              <Link className="text-link" href="/kebijakan-privasi">
                Kebijakan Privasi
              </Link>
              . *
            </span>
          </label>
        </div>
        <div className="field-full">
          {result ? <p className={`form-status ${result.type}`}>{result.message}</p> : null}
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Menyimpan…" : "Kirim Pesan"}
          </button>
        </div>
      </div>
    </form>
  );
}
