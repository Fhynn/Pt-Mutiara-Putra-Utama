"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  BriefcaseBusiness,
  Building2,
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
  MessageSquare,
  Newspaper,
  Route,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound
} from "lucide-react";

const groups = [
  { label: "Ringkasan", items: [["Dashboard", "/admin", LayoutDashboard]] },
  {
    label: "Konten Website",
    items: [
      ["Halaman", "/admin/halaman", FileText],
      ["Media", "/admin/media", ImageIcon],
      ["Galeri", "/admin/galeri", GalleryHorizontal],
      ["Negara", "/admin/negara", Globe2],
      ["Berita", "/admin/berita", Newspaper],
      ["Testimoni", "/admin/testimoni", MessageSquare],
      ["Pelatihan", "/admin/pelatihan", Building2],
      ["Layanan", "/admin/layanan", ShieldCheck],
      ["Tim", "/admin/tim", UsersRound],
      ["Profil", "/admin/profil", UserRound],
      ["Alur", "/admin/alur", Route],
      ["FAQ", "/admin/faq", CircleHelp],
      ["Legalitas", "/admin/legalitas", FileBadge2]
    ]
  },
  {
    label: "Rekrutmen",
    items: [
      ["Lowongan", "/admin/lowongan", BriefcaseBusiness],
      ["Pendaftar", "/admin/pendaftar", Inbox]
    ]
  },
  { label: "Komunikasi", items: [["Pesan", "/admin/pesan", MessageSquare]] },
  {
    label: "Sistem",
    items: [
      ["Pengaturan", "/admin/pengaturan", Settings],
      ["Pengguna", "/admin/pengguna", UsersRound],
      ["Aktivitas", "/admin/aktivitas", Activity],
      ["Profil Akun", "/admin/profil-akun", UserRound]
    ]
  }
] as const;

export function AdminShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const pathname = usePathname();
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
              <strong style={{ color: "white" }}>CMS MPU</strong>
              <span>Panel Administrasi</span>
            </span>
          </Link>
          {groups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <span>{group.label}</span>
              <nav className="admin-nav">
                {group.items.map(([label, href, Icon]) => (
                  <Link
                    className={
                      pathname === href || (href !== "/admin" && pathname.startsWith(href))
                        ? "active"
                        : ""
                    }
                    href={href}
                    key={href}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <strong>{user.name}</strong>
              <span>
                {user.role} · {user.email}
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
