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
  email: z.union([z.literal(""), z.email()]).optional(),
  domicile: z.string().trim().min(2).max(120),
  countryId: z.union([z.literal(""), z.string().cuid()]).optional(),
  jobId: z.union([z.literal(""), z.string().cuid()]).optional(),
  workExperience: z.string().trim().max(1500).optional(),
  message: z.string().trim().max(1500).optional(),
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
