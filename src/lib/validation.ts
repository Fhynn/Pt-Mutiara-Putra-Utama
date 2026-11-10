import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Nomor telepon terlalu pendek.")
  .max(25, "Nomor telepon terlalu panjang.")
  .regex(/^[+0-9()\-\s]+$/, "Format nomor telepon tidak valid.");

export const applicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: z.email("Email tidak valid."),
  countryId: z.string().cuid("Pilih negara tujuan."),
  sector: z.enum(["FORMAL", "SEMI_FORMAL", "INFORMAL"], "Pilih sektor pekerjaan."),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 angka."),
  birthPlace: z.string().trim().min(2).max(120),
  birthDate: z.iso
    .date()
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      "Tanggal lahir tidak valid."
    ),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"], "Pilih jenis kelamin."),
  maritalStatus: z.enum(
    ["BELUM_MENIKAH", "MENIKAH", "CERAI_HIDUP", "CERAI_MATI"],
    "Pilih status pernikahan."
  ),
  religion: z.enum(
    ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"],
    "Pilih agama."
  ),
  heightCm: z.coerce.number<number>().int().min(100).max(250),
  weightKg: z.coerce.number<number>().int().min(25).max(300),
  address: z.string().trim().min(5).max(500),
  rt: z.string().regex(/^\d{1,3}$/, "RT harus 1–3 angka."),
  rw: z.string().regex(/^\d{1,3}$/, "RW harus 1–3 angka."),
  village: z.string().trim().min(2).max(120),
  district: z.string().trim().min(2).max(120),
  domicile: z.string().trim().min(2).max(120),
  province: z.string().trim().min(2).max(120),
  jobId: z.union([z.literal(""), z.string().cuid()]).optional(),
  workExperience: z.string().trim().min(5).max(1500),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
  idempotencyKey: z.string().uuid().optional()
});

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.union([z.literal(""), z.email()]).optional(),
    phone: z.union([z.literal(""), phoneSchema]).optional(),
    subject: z.string().trim().min(3).max(160),
    message: z.string().trim().min(10).max(3000),
    consent: z.literal(true),
    website: z.string().max(0).optional()
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: "Isi minimal email atau nomor telepon.",
    path: ["email"]
  });

export const adminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200)
});
