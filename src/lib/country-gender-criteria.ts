import { z } from "zod";

const entriesSchema = z.array(z.string().trim().min(1).max(180)).max(20);
const groupSchema = z.object({
  jobs: entriesSchema,
  criteria: entriesSchema
});
export const countryGenderCriteriaSchema = z.object({
  women: groupSchema,
  men: groupSchema
});

export type CountryGenderCriteria = z.infer<typeof countryGenderCriteriaSchema>;

function list(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function group(value: unknown) {
  const item = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    jobs: list("jobs" in item ? item.jobs : undefined),
    criteria: list("criteria" in item ? item.criteria : undefined)
  };
}

export function normalizeCountryGenderCriteria(value: unknown): CountryGenderCriteria | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = countryGenderCriteriaSchema.parse({
    women: group("women" in value ? value.women : undefined),
    men: group("men" in value ? value.men : undefined)
  });
  return data.women.jobs.length ||
    data.women.criteria.length ||
    data.men.jobs.length ||
    data.men.criteria.length
    ? data
    : null;
}

export function readCountryGenderCriteria(value: unknown): CountryGenderCriteria | null {
  try {
    return normalizeCountryGenderCriteria(value);
  } catch {
    return null;
  }
}
