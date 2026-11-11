"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BriefcaseBusiness,
  CircleHelp,
  FileBadge2,
  FileText,
  GalleryHorizontal,
  Globe2,
  Home,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Route,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound
} from "lucide-react";

const primaryItems = [
  ["Ringkasan", "/admin", LayoutDashboard],
  ["Pendaftar", "/admin/pendaftar", Inbox],
  ["Pesan Masuk", "/admin/pesan", FileText],
  ["Negara Tujuan", "/admin/negara", Globe2],
  ["Lowongan", "/admin/lowongan", BriefcaseBusiness],
  ["Galeri", "/admin/galeri", GalleryHorizontal],
  ["Foto & Video", "/admin/media", ImageIcon]
] as const;

const contentItems = [
  ["Isi Beranda", "/admin/halaman", FileText],
  ["Profil Perusahaan", "/admin/profil", UserRound],
  ["Layanan", "/admin/layanan", ShieldCheck],
  ["Pelatihan", "/admin/pelatihan", FileText],
  ["Berita", "/admin/berita", Newspaper],
  ["FAQ", "/admin/faq", CircleHelp],
  ["Legalitas", "/admin/legalitas", FileBadge2],
  ["Tim", "/admin/tim", UsersRound],
  ["Testimoni", "/admin/testimoni", UserRound],
  ["Alur Penempatan", "/admin/alur", Route]
] as const;

const systemItems = [
  ["Pengaturan Website", "/admin/pengaturan", Settings],
  ["Profil Akun", "/admin/profil-akun", UserRound],
  ["Pengguna", "/admin/pengguna", UsersRound],
  ["Riwayat Aktivitas", "/admin/aktivitas", FileText]
] as const;

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Administrator utama",
  ADMIN: "Administrator",
  EDITOR: "Editor konten",
  VIEWER: "Pembaca"
};

function NavPendingHint() {
  const { pending } = useLinkStatus();
  return <span className={`admin-nav-pending${pending ? " is-pending" : ""}`} aria-hidden="true" />;
}

export function AdminShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(
    contentItems.some(([, href]) => pathname.startsWith(href))
  );
  const [systemOpen, setSystemOpen] = useState(
    systemItems.some(([, href]) => pathname.startsWith(href))
  );
  function navLink([label, href, Icon]:
    | (typeof primaryItems)[number]
    | (typeof contentItems)[number]
    | (typeof systemItems)[number]) {
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
    return (
      <Link
        className={active ? "active" : ""}
        href={href}
        key={href}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={18} aria-hidden="true" />
        <span>{label}</span>
        <NavPendingHint />
      </Link>
    );
  }
  return (
    <div className="admin-body">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link className="brand" href="/admin">
            <Image
              className="brand-logo"
              src="/brand/mpu-logo.png"
              alt="MPU"
              width={58}
              height={50}
            />
            <span className="brand-copy">
              <strong style={{ color: "white" }}>MPU</strong>
              <span>Kelola Website</span>
            </span>
          </Link>
          <nav className="admin-nav admin-nav-primary" aria-label="Menu utama admin">
            {primaryItems.map(navLink)}
          </nav>
          <details
            className="admin-nav-more"
            open={contentOpen}
            onToggle={(event) => setContentOpen(event.currentTarget.open)}
          >
            <summary>Konten lainnya</summary>
            <nav className="admin-nav" aria-label="Konten lainnya">
              {contentItems.map(navLink)}
            </nav>
          </details>
          <details
            className="admin-nav-more"
            open={systemOpen}
            onToggle={(event) => setSystemOpen(event.currentTarget.open)}
          >
            <summary>Akun & pengaturan</summary>
            <nav className="admin-nav" aria-label="Akun dan pengaturan">
              {systemItems
                .filter(([, href]) =>
                  href === "/admin/pengguna"
                    ? user.role === "SUPER_ADMIN"
                    : href === "/admin/aktivitas" || href === "/admin/pengaturan"
                      ? user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                      : true
                )
                .map(navLink)}
            </nav>
          </details>
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <strong>{user.name}</strong>
              <span>
                {roleLabels[user.role] ?? "Staf"} · {user.email}
              </span>
            </div>
            <div className="admin-actions">
              <Link className="admin-button" href="/" target="_blank">
                <Home size={16} /> Lihat Situs
              </Link>
              <button
                className="admin-button"
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                <LogOut size={16} /> Keluar
              </button>
            </div>
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
