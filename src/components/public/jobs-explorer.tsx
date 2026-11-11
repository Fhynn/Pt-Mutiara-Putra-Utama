"use client";

import Link from "next/link";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/public/empty-state";
import { formatDate } from "@/lib/utils";

type Job = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  countrySlug: string;
  countryName: string;
  deadline: string | null;
};

export function JobsExplorer({
  jobs,
  countries
}: {
  jobs: Job[];
  countries: Array<{ slug: string; name: string }>;
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCountry, setActiveCountry] = useState("");

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const nextQuery = params.get("q") ?? "";
      const nextCountry = params.get("country") ?? "";
      setQuery(nextQuery);
      setCountry(nextCountry);
      setActiveQuery(nextQuery.trim().toLocaleLowerCase("id-ID"));
      setActiveCountry(nextCountry);
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const visibleJobs = jobs.filter(
    (job) =>
      (!activeCountry || job.countrySlug === activeCountry) &&
      (!activeQuery ||
        `${job.title} ${job.summary}`.toLocaleLowerCase("id-ID").includes(activeQuery))
  );

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`
    );
    setActiveQuery(query.trim().toLocaleLowerCase("id-ID"));
    setActiveCountry(country);
  }

  return (
    <>
      <form className="form-card" onSubmit={applyFilters} style={{ marginBottom: 32 }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="q">Cari lowongan</label>
            <input
              id="q"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Judul atau kata kunci"
            />
          </div>
          <div className="field">
            <label htmlFor="country">Negara</label>
            <select
              id="country"
              name="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              <option value="">Semua negara</option>
              {countries.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button className="button button-primary" type="submit">
              Terapkan Filter
            </button>
          </div>
        </div>
      </form>
      {visibleJobs.length ? (
        <div className="content-grid">
          {visibleJobs.map((job) => (
            <article className="content-card" key={job.id}>
              <BriefcaseBusiness />
              <h2>{job.title}</h2>
              <p>
                <MapPin size={16} /> {job.countryName}
              </p>
              <p>{job.summary}</p>
              <p className="form-note">Batas pendaftaran: {formatDate(job.deadline)}</p>
              <Link className="button button-secondary" href={`/lowongan/${job.slug}`}>
                Lihat Detail
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada lowongan aktif"
          description="Kami tidak menampilkan posisi contoh atau lowongan yang belum terverifikasi. Silakan konsultasi untuk informasi program terbaru."
        />
      )}
    </>
  );
}
