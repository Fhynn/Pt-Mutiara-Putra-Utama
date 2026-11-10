import Image from "next/image";

const localFlags: Record<string, string> = {
  TW: "/flags/tw.png",
  HK: "/flags/hk.png",
  SG: "/flags/sg.png",
  MY: "/flags/my-card.png",
  BN: "/flags/bn.png"
};

export function CountryFlag({
  isoCode,
  name,
  flagUrl
}: {
  isoCode?: string | null;
  name: string;
  flagUrl?: string | null;
}) {
  const src = flagUrl || localFlags[isoCode?.toUpperCase() ?? ""];
  if (!src) return null;

  return (
    <Image
      className={
        isoCode?.toUpperCase() === "BN" ? "country-flag country-flag-brunei" : "country-flag"
      }
      src={src}
      alt={`Bendera ${name}`}
      fill
      sizes="(max-width: 520px) 96px, (max-width: 1100px) 50vw, 300px"
      unoptimized
    />
  );
}
