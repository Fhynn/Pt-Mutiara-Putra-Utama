"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

const nav = [
  ["Beranda", "/"],
  ["Tentang", "/tentang-kami"],
  ["Layanan", "/layanan"],
  ["Negara Tujuan", "/negara-tujuan"],
  ["Lowongan", "/lowongan"],
  ["Legalitas", "/legalitas"],
  ["Galeri", "/galeri"],
  ["Kontak", "/kontak"]
] as const;

export function SiteHeader({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="PT Mutiara Putra Utama - Beranda">
          <Image
            className="brand-logo"
            src={logoUrl || "/brand/mpu-logo.png"}
            alt="Logo MPU"
            width={67}
            height={58}
            priority
          />
          <span className="brand-copy">
            <strong>PT. MUTIARA PUTRA UTAMA</strong>
            <span>EMPLOYMENT AGENCY</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          {nav.map(([label, href]) => (
            <Link className={`nav-link ${active(href) ? "active" : ""}`} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        <Link className="button button-primary header-cta" href="/daftar">
          <UserRound size={17} /> Daftar Online
        </Link>

        <button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="mobile-toggle"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <nav
        className={`mobile-panel ${open ? "open" : ""}`}
        id="mobile-menu"
        aria-label="Navigasi seluler"
        aria-hidden={!open}
      >
        {nav.map(([label, href]) => (
          <Link
            href={href}
            key={href}
            aria-current={active(href) ? "page" : undefined}
            onClick={() => setOpen(false)}
            tabIndex={open ? undefined : -1}
          >
            {label}
          </Link>
        ))}
        <Link
          className="button button-primary"
          href="/daftar"
          onClick={() => setOpen(false)}
          tabIndex={open ? undefined : -1}
        >
          Daftar Online
        </Link>
      </nav>
    </header>
  );
}
