import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

if (!connectionString) throw new Error("DATABASE_URL wajib diisi.");
if (!email || !name || !password) {
  throw new Error(
    "Isi BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, dan BOOTSTRAP_ADMIN_PASSWORD melalui environment untuk satu kali bootstrap."
  );
}
if (password.length < 14) throw new Error("Password bootstrap minimal 14 karakter.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 3,
  parallelism: 1
});

try {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN", isActive: true }
  });
  if (existingSuperAdmin)
    throw new Error("Bootstrap ditolak karena SUPER_ADMIN aktif sudah tersedia.");

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "SUPER_ADMIN",
      mustChangePassword: true,
      isActive: true
    }
  });
  console.log(
    "Akun SUPER_ADMIN berhasil dibuat. Password tidak dicetak. Ganti password setelah login pertama."
  );
} finally {
  await prisma.$disconnect();
}
