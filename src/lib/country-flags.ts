const localFlags: Record<string, string> = {
  TW: "/flags/tw.png",
  HK: "/flags/hk.png",
  SG: "/flags/sg.png",
  MY: "/flags/my-card.png",
  BN: "/flags/bn.png"
};

const aliases: Record<string, string> = {
  hongkong: "HK",
  hongkongdaktiongkok: "HK",
  bruneidarussalam: "BN",
  koreaselatan: "KR",
  koreautara: "KP",
  amerika: "US",
  amerikaserikat: "US"
};

function normalized(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const names = new Intl.DisplayNames(["id"], { type: "region" });
const countryCodes = new Map<string, string>();

for (let first = 65; first <= 90; first++) {
  for (let second = 65; second <= 90; second++) {
    const code = String.fromCharCode(first, second);
    const name = names.of(code);
    if (name && name !== code && name !== "Wilayah Tidak Dikenal") {
      countryCodes.set(normalized(name), code);
    }
  }
}

export function inferCountryIso(name: string) {
  const key = normalized(name);
  return aliases[key] ?? countryCodes.get(key) ?? null;
}

export function countryFlagUrl(isoCode?: string | null, uploadedUrl?: string | null) {
  if (uploadedUrl) return uploadedUrl;
  const code = isoCode?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;
  return localFlags[code] ?? `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}
