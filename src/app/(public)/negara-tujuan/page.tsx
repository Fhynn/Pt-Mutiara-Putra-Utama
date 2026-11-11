import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { CountryFlag } from "@/components/public/country-flag";
import { getPublishedCountries } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Negara Tujuan",
  description: "Kriteria kerja dan pilihan negara tujuan PT Mutiara Putra Utama."
};

export default async function CountriesPage() {
  const countries = await getPublishedCountries();
  return (
    <>
      <PageHero
        breadcrumb="Negara Tujuan"
        title="Pilihan negara tujuan"
        description="Lihat kriteria tiap negara. Pekerjaan yang sedang dibuka tercantum di halaman Lowongan."
      />
      <section className="section">
        <div className="container">
          <div className="country-grid">
            {countries.map((country) => (
              <article className="country-card" key={country.id}>
                <div className="country-visual">
                  <CountryFlag
                    isoCode={country.isoCode}
                    name={country.name}
                    flagUrl={country.flagUrl}
                  />
                </div>
                <div className="country-body">
                  <h2 className="country-name">{country.name}</h2>
                  <span className="status-pill">
                    {country.programStatus === "AVAILABLE"
                      ? "Program tersedia"
                      : country.programStatus === "NOT_OPEN"
                        ? "Program belum dibuka"
                        : "Lihat persyaratan"}
                  </span>
                  <div className="tags">
                    {country.sectors.map((sector) => (
                      <span className="tag" key={sector}>
                        {sector}
                      </span>
                    ))}
                  </div>
                  <p>{country.summary}</p>
                  <Link className="text-link" href={`/negara-tujuan/${country.slug}`}>
                    Lihat detail <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {!countries.length ? (
            <p className="empty-state">
              Informasi negara tujuan belum tersedia. Silakan hubungi petugas MPU untuk konsultasi.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
