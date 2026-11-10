import { expect, test } from "@playwright/test";

test("halaman Hong Kong menampilkan kriteria, dokumen, dan gaji tanpa sumber situs lama", async ({
  page
}) => {
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
  await expect(page.getByRole("link", { name: /Buka sumber persyaratan/i })).toHaveCount(0);
  await expect(page.getByText(/Sumber terakhir diperiksa/i)).toHaveCount(0);
  await expect(page.getByText(/Nominal di atas berasal dari/i)).toHaveCount(0);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  if ((page.viewportSize()?.width ?? 1000) <= 520) {
    await page.getByRole("button", { name: "Lihat 4 kriteria lainnya" }).click();
    await expect(page.getByText("Tinggi badan minimal 155 cm")).toBeVisible();
  }
});

test("halaman daftar meminta data diri dan menjelaskan penyimpanan foto privat", async ({
  page
}) => {
  await page.goto("/daftar?country=hong-kong");

  await expect(page.getByRole("heading", { name: "Siapkan data diri dan foto" })).toBeVisible();
  await expect(page.getByText(/NIK dan foto disimpan secara privat/)).toBeVisible();
  await expect(page.getByLabel("Nomor NIK *")).toBeVisible();
  await expect(page.getByLabel("Unggah foto diri *")).toBeVisible();
});

test("empat negara tetap memiliki persyaratan spesifik", async ({ page }) => {
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

test("revisi klien menampilkan Brunei, ABK Taiwan, dan pekerjaan Malaysia", async ({ page }) => {
  await page.goto("/negara-tujuan/brunei-darussalam");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Brunei Darussalam");
  await expect(
    page.getByText("Konstruksi, pembuatan kue, dan bidang formal lain sesuai program.")
  ).toBeVisible();
  await expect(page.getByText("Rincian gaji belum dipublikasikan.")).toBeVisible();
  await expect(page.getByText("Konfirmasi program kepada petugas MPU").first()).toBeVisible();

  await page.goto("/negara-tujuan/taiwan");
  await expect(page.getByText(/ABK \(anak buah kapal\)/).first()).toBeVisible();

  await page.goto("/negara-tujuan/malaysia");
  await expect(page.getByText(/Konstruksi dan pekerjaan kebun sawit\/karet/)).toBeVisible();

  await page.goto("/tentang-kami");
  await expect(page.getByAltText("Foto Direktur Utama PT Mutiara Putra Utama")).toHaveAttribute(
    "src",
    /director-martua-2026/
  );
});
