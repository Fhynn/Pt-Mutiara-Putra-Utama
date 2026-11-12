import { expect, test } from "@playwright/test";

test("hero beranda memakai satu foto klien tanpa kolase", async ({ page }, testInfo) => {
  await page.goto("/");
  const hero = page.locator(".mpu-home .hero");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
    "Penempatan Pekerja Migran Indonesia yang Legal, Aman, dan Profesional"
  );
  const image = hero.locator(".hero-visual img");
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("src", /gallery-team\.webp/);
  await expect(hero.locator(".hero-collage-small, .hero-badge")).toHaveCount(0);
  await expect(image).toHaveAttribute("alt", "Dokumentasi kegiatan PT Mutiara Putra Utama");
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0);
  await hero.screenshot({ path: `artifacts/screenshots/hero-clean-${testInfo.project.name}.png` });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
