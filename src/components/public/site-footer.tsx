import Image from "next/image";
import Link from "next/link";
import type { getSettings } from "@/lib/public-data";

type Settings = Awaited<ReturnType<typeof getSettings>>;

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <Image
              className="brand-logo"
              src={settings.logoUrl || "/brand/mpu-logo.png"}
              alt="Logo MPU"
              width={67}
              height={58}
            />
            <span className="brand-copy">
              <strong style={{ color: "white" }}>PT. MUTIARA PUTRA UTAMA</strong>
              <span>EMPLOYMENT AGENCY</span>
            </span>
          </div>
          <p>Layanan informasi dan pendampingan proses penempatan Pekerja Migran Indonesia.</p>
        </div>
        <div className="footer-contact">
          <h3>Kontak resmi</h3>
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
          <p>{settings.primaryEmail}</p>
        </div>
        <nav className="footer-nav" aria-label="Tautan perusahaan">
          <h3>Perusahaan</h3>
          <Link href="/tentang-kami">Tentang Kami</Link>
          <Link href="/layanan">Layanan</Link>
          <Link href="/legalitas">Legalitas</Link>
          <Link href="/galeri">Galeri</Link>
        </nav>
        <nav className="footer-nav" aria-label="Tautan informasi">
          <h3>Informasi</h3>
          <Link href="/lowongan">Lowongan</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/syarat-ketentuan">Syarat & Ketentuan</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PT. Mutiara Putra Utama. Hak cipta dilindungi.</span>
        <a
          href="https://siskop2mi.bp2mi.go.id/profil/lembaga/detail/966/p3mi"
          rel="noopener noreferrer"
          target="_blank"
        >
          Verifikasi profil di SISKOP2MI
        </a>
      </div>
    </footer>
  );
}
