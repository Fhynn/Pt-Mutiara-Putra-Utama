"use client";
import Link from "next/link";
export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-page">
      <div>
        <span className="eyebrow">Terjadi kendala</span>
        <h1>Halaman belum dapat dimuat</h1>
        <p>Silakan coba kembali. Jika berulang, hubungi administrator website.</p>
        <div className="button-row">
          <button className="button button-primary" onClick={reset}>
            Coba Lagi
          </button>
          <Link className="button button-secondary" href="/">
            Ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
