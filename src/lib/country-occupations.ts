import { readCountryGenderCriteria } from "@/lib/country-gender-criteria";

export type OccupationCountry = {
  sectors: string[];
  genderCriteria: unknown;
};

export function getCountryOccupationOptions(country: OccupationCountry, gender?: string) {
  const criteria = readCountryGenderCriteria(country.genderCriteria);
  if (criteria) {
    if (!gender && (criteria.women.jobs.length || criteria.men.jobs.length)) return [];
    const jobs =
      gender === "PEREMPUAN"
        ? criteria.women.jobs
        : gender === "LAKI_LAKI"
          ? criteria.men.jobs
          : [];
    if (jobs.length) return jobs;
  }
  return country.sectors;
}
