import type { Metadata } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "PT Mutiara Putra Utama", template: "%s | PT Mutiara Putra Utama" },
  description:
    "Informasi resmi layanan, negara tujuan, lowongan, legalitas, dan pendaftaran awal PT Mutiara Putra Utama.",
  icons: { icon: "/brand/mpu-logo.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${archivo.variable} ${sourceSans.variable}`}>{children}</body>
    </html>
  );
}
