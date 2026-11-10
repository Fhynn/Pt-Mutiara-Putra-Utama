import { expect, test } from "@playwright/test";

const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;

test("admin dapat mengedit persyaratan negara tanpa JSON", async ({ page }, testInfo) => {
  test.skip(!email || !password, "Kredensial QA admin tidak tersedia.");

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/negara");
  await expect(page.getByRole("heading", { level: 1, name: "Negara Tujuan" })).toBeVisible();
  await page.getByLabel("Cari data").fill("Hong Kong");
  const row = page.getByRole("row").filter({ hasText: "Hong Kong" });
  await row.getByRole("button", { name: "Edit" }).click();

  await expect(page.getByLabel("Kriteria calon pekerja 1")).toHaveValue(
    "Warga Negara Indonesia (WNI)"
  );
  await expect(page.getByLabel("Rincian gaji dari sumber 1")).toHaveValue(/HK\$5\.100/);
  await expect(page.getByLabel("Keterangan sektor informal")).toHaveValue(
    "Penjaga anak/bayi dan asisten rumah tangga."
  );
  await expect(page.getByLabel("Tanggal sumber terakhir diperiksa")).toHaveValue("2026-11-07");
  await expect(page.getByText(/JSON/i)).toHaveCount(0);
  await page.screenshot({
    path: `artifacts/screenshots/admin-country-${testInfo.project.name}.png`,
    fullPage: true
  });
});
