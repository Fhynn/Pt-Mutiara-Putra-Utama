import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { CountryFlag } from "@/components/public/country-flag";
import { CountryCarousel } from "@/components/public/country-carousel";
import { getPublishedCountries } from "@/lib/public-data";

export const revalidate = 60;
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
          <CountryCarousel>
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
                  <p>{country.summary}</p>
                  <Link className="text-link" href={`/negara-tujuan/${country.slug}`}>
                    Lihat detail <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </CountryCarousel>
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
