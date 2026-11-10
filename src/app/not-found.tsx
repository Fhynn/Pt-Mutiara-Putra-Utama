import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <div>
        <span className="eyebrow">404</span>
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat mungkin berubah atau kontennya belum dipublikasikan.</p>
        <Link className="button button-primary" href="/">
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
