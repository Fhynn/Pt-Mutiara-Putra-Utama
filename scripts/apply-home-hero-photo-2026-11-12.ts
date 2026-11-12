import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

try {
  const section = await prisma.pageSection.findFirst({
    where: { key: "hero", page: { slug: "home" } },
    select: { id: true, content: true }
  });
  const content = section?.content;
  const currentImage =
    content &&
    !Array.isArray(content) &&
    typeof content === "object" &&
    typeof content.image === "string"
      ? content.image
      : "";
  const usesPreviousDefault =
    currentImage === "/client/hero-training.webp" ||
    currentImage.endsWith("/seed/client/hero-training.webp");
  if (!section || !content || Array.isArray(content) || typeof content !== "object") {
    process.stdout.write("Bagian hero beranda tidak ditemukan.\n");
  } else if (!usesPreviousDefault) {
    const imageName =
      typeof content.image === "string" ? content.image.split("/").pop() : "tidak ditentukan";
    process.stdout.write(`Foto hero saat ini (${imageName}) dipertahankan.\n`);
  } else if (!process.argv.includes("--apply")) {
    process.stdout.write("Foto hero bawaan siap diganti dengan foto tim MPU.\n");
  } else {
    await prisma.pageSection.update({
      where: { id: section.id },
      data: { content: { ...content, image: "/client/gallery-team.webp" } }
    });
    process.stdout.write("Foto hero bawaan diganti dengan foto tim MPU.\n");
  }
} finally {
  await prisma.$disconnect();
}
