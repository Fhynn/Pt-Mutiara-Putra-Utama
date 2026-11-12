import { expect, test } from "@playwright/test";

test("Malaysia menampilkan lima pekerjaan dengan rincian yang terpisah", async ({ page }) => {
  await page.goto("/negara-tujuan/malaysia");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pekerjaan di Malaysia");
  await expect(page.locator(".country-occupation-card")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "Terapis SPA" })).toBeVisible();
  await page.getByRole("link", { name: "Lihat syarat dan daftar" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Asisten Rumah Tangga (ART)");
  await expect(page.getByText("Usia 21–45 tahun")).toBeVisible();
  await expect(page.getByText("RM 1.500")).toBeVisible();
  await expect(
    page.getByText("Surat izin suami, bagi calon pekerja perempuan yang berstatus menikah")
  ).toBeVisible();
  await expect(
    page.getByText(
      "Surat izin orang tua, bagi calon pekerja yang berstatus belum kawin atau cerai hidup"
    )
  ).toBeVisible();
});

test("gaji dan pengalaman Malaysia tidak tercampur antarkategori pekerjaan", async ({ page }) => {
  await page.goto("/negara-tujuan/malaysia/pekerjaan/konstruksi");
  await expect(page.getByText("Usia 18–43 tahun")).toBeVisible();
  await expect(page.getByText("Pengalaman kerja minimal 1 tahun")).toBeVisible();
  await expect(page.getByText("RM 1.700")).toBeVisible();

  await page.goto("/negara-tujuan/malaysia/pekerjaan/perkebunan-sawit");
  await expect(page.getByText("RM 1.700")).toBeVisible();
  await expect(page.getByText("Pengalaman kerja minimal 1 tahun")).toHaveCount(0);

  await page.goto("/negara-tujuan/malaysia/pekerjaan/terapis-spa");
  await expect(page.getByText("Belum dicantumkan")).toBeVisible();
});

test("setiap negara memakai pekerjaan dan gaji dari revisi klien", async ({ page }) => {
  for (const [country, occupation, title, salary] of [
    ["hong-kong", "asisten-rumah-tangga", "Asisten Rumah Tangga (ART)", "HKD 5.220"],
    ["taiwan", "asisten-rumah-tangga", "Asisten Rumah Tangga (ART)", "NTD 20.000"],
    ["taiwan", "anak-buah-kapal", "Anak Buah Kapal (ABK)", "Belum dicantumkan"],
    ["singapura", "asisten-rumah-tangga", "Asisten Rumah Tangga (ART)", "SGD 550"],
    ["brunei-darussalam", "baker-pembuat-kue", "Baker (Pembuat Kue)", "Belum dicantumkan"]
  ] as const) {
    await page.goto(`/negara-tujuan/${country}/pekerjaan/${occupation}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator(".occupation-salary-box strong")).toHaveText(salary);
    await expect(page.getByRole("heading", { name: "Dokumen yang perlu disiapkan" })).toBeVisible();
  }
});

test("halaman pekerjaan mengisi formulir dan pilihan tetap bisa diubah", async ({ page }) => {
  await page.goto("/negara-tujuan/malaysia/pekerjaan/konstruksi");
  await page.getByRole("link", { name: "Daftar untuk pekerjaan ini" }).click();
  await expect(page.getByLabel("Negara tujuan *")).toHaveValue(/.+/);
  await expect(page.locator("#countryId option:checked")).toHaveText("Malaysia");
  await expect(page.getByLabel("Jenis kelamin *")).toHaveValue("LAKI_LAKI");
  await expect(page.getByLabel("Pekerjaan yang diminati *")).toHaveValue("Konstruksi");
  await page.getByLabel("Jenis kelamin *").selectOption("PEREMPUAN");
  await expect(page.getByLabel("Pekerjaan yang diminati *")).toHaveValue("");
  await page.getByLabel("Pekerjaan yang diminati *").selectOption("Asisten Rumah Tangga (ART)");
  await expect(page.getByLabel("Pekerjaan yang diminati *")).toHaveValue(
    "Asisten Rumah Tangga (ART)"
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("pekerjaan tanpa pembatasan jenis kelamin tetap terpilih setelah pendaftar memilih gender", async ({
  page
}) => {
  await page.goto("/negara-tujuan/malaysia/pekerjaan/terapis-spa");
  await page.getByRole("link", { name: "Daftar untuk pekerjaan ini" }).click();
  await expect(page.getByLabel("Jenis kelamin *")).toHaveValue("");
  await expect(page.getByLabel("Pekerjaan yang diminati *")).toHaveValue("Terapis SPA");
  await page.getByLabel("Jenis kelamin *").selectOption("PEREMPUAN");
  await expect(page.getByLabel("Pekerjaan yang diminati *")).toHaveValue("Terapis SPA");
});
