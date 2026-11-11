import { expect, test } from "@playwright/test";
test("homepage memiliki CTA dan navigasi nyata", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Penempatan Pekerja Migran Indonesia"
  );
  await expect(page.getByRole("link", { name: /Daftar Online/i }).first()).toHaveAttribute(
    "href",
    "/daftar"
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("elemen homepage muncul saat masuk viewport", async ({ page }) => {
  await page.goto("/");
  const trustItem = page.locator(".trust-item").first();
  await trustItem.scrollIntoViewIfNeeded();
  await expect(trustItem).toBeVisible();
  const lowerSection = page.locator(".timeline-card").first();
  await lowerSection.scrollIntoViewIfNeeded();
  await expect(lowerSection).toHaveClass(/reveal-visible/);
});

test("formulir publik dapat dibuka", async ({ page }) => {
  await page.goto("/daftar");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pendaftaran");
  await expect(page.getByLabel(/Nama lengkap/i)).toBeVisible();
});

test("filter lowongan mengikuti URL tanpa memuat ulang halaman", async ({ page }) => {
  await page.goto("/lowongan?country=hong-kong");
  await expect(page.getByLabel("Negara")).toHaveValue("hong-kong");
  await page.getByLabel("Negara").selectOption("taiwan");
  await page.getByRole("button", { name: "Terapkan Filter" }).click();
  await expect(page).toHaveURL(/country=taiwan/);
  await expect(page.getByLabel("Negara")).toHaveValue("taiwan");
  await page.goBack();
  await expect(page.getByLabel("Negara")).toHaveValue("hong-kong");
});

test("admin dialihkan ke login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
