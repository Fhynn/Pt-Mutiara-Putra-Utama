import Image from "next/image";
import { countryFlagUrl } from "@/lib/country-flags";

export function CountryFlag({
  isoCode,
  name,
  flagUrl
}: {
  isoCode?: string | null;
  name: string;
  flagUrl?: string | null;
}) {
  const src = countryFlagUrl(isoCode, flagUrl);
  if (!src) return null;
  const isAutomaticFlag = src.startsWith("https://flagcdn.com/");

  return (
    <Image
      className={`country-flag${isoCode?.toUpperCase() === "BN" ? " country-flag-brunei" : ""}${isAutomaticFlag ? " country-flag-auto" : ""}`}
      src={src}
      alt={`Bendera ${name}`}
      fill
      sizes="(max-width: 520px) 96px, (max-width: 1100px) 50vw, 300px"
      unoptimized
    />
  );
}
