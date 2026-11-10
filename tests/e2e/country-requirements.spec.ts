import { expect, test } from "@playwright/test";

test("halaman Hong Kong menampilkan kriteria, dokumen, gaji, dan sumber", async ({ page }) => {
  await page.goto("/negara-tujuan/hong-kong");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Kriteria & Persyaratan Kerja ke Hong Kong"
  );
  await expect(page.getByText("Usia 21–35 tahun")).toBeVisible();
  await expect(page.getByText("Kartu Tanda Penduduk (KTP)")).toBeVisible();
  await expect(page.getByText(/HK\$5\.100/)).toBeVisible();
  await expect(
    page.getByText("Penjaga anak/bayi dan asisten rumah tangga.", { exact: true })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Buka sumber persyaratan/i })).toHaveAttribute(
    "href",
    "https://ptmutiaraputrautama.com/Syarat-Hongkong/"
  );

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  if ((page.viewportSize()?.width ?? 1000) <= 520) {
    await page.getByRole("button", { name: "Lihat 4 kriteria lainnya" }).click();
    await expect(page.getByText("Tinggi badan minimal 155 cm")).toBeVisible();
  }
});

test("halaman daftar menjelaskan kapan dokumen diserahkan", async ({ page }) => {
  await page.goto("/daftar?country=hong-kong");

  await expect(
    page.getByRole("heading", { name: "Pendaftaran awal sebelum verifikasi dokumen" })
  ).toBeVisible();
  await expect(page.getByText(/KTP, KK, akta kelahiran, ijazah/)).toBeVisible();
  await expect(page.getByText(/petugas dan kanal resmi MPU/)).toBeVisible();
});

test("empat negara memiliki persyaratan spesifik dari sumber MPU", async ({ page }) => {
  for (const [slug, name, salary] of [
    ["taiwan", "Taiwan", "NT$20.000"],
    ["hong-kong", "Hong Kong", "HK$5.100"],
    ["singapura", "Singapura", "SGD550"],
    ["malaysia", "Malaysia", "RM1.500"]
  ] as const) {
    await page.goto(`/negara-tujuan/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
    await expect(page.getByText(salary, { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dokumen yang perlu disiapkan" })).toBeVisible();
  }
});
