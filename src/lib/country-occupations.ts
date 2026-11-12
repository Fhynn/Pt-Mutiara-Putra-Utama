export type OccupationCountry = {
  occupations: Array<{ title: string; gender: string | null; status?: string }>;
};

export function getCountryOccupationOptions(country: OccupationCountry, gender?: string) {
  return country.occupations
    .filter((occupation) => occupation.status === undefined || occupation.status === "PUBLISHED")
    .filter((occupation) => !occupation.gender || occupation.gender === gender)
    .map((occupation) => occupation.title);
}
