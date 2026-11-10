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
  await expect(trustItem).toHaveClass(/reveal-visible/);
});

test("formulir publik dapat dibuka", async ({ page }) => {
  await page.goto("/daftar");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pendaftaran");
  await expect(page.getByLabel(/Nama lengkap/i)).toBeVisible();
});
test("admin dialihkan ke login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
