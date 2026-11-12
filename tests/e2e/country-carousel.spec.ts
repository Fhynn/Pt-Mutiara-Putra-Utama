import { expect, test } from "@playwright/test";

test("kartu negara tetap lebar dan bisa digeser tanpa tombol", async ({ page }, testInfo) => {
  await page.goto("/negara-tujuan");
  const track = page.locator(".country-carousel-track");
  const cards = track.locator(".country-card");
  await expect(cards).toHaveCount(5);
  await expect(track.locator(".status-pill, .tags")).toHaveCount(0);
  await expect(page.locator(".country-carousel-indicator")).toHaveCount(0);
  await expect(cards.first().getByText("Pilihan pekerjaan di Taiwan:")).toBeVisible();
  await expect(page.getByText("Geser untuk melihat negara lain")).toBeVisible();
  await page.screenshot({
    path: `artifacts/screenshots/country-carousel-${testInfo.project.name}.png`,
    fullPage: true
  });

  const trackBox = await track.boundingBox();
  const firstBox = await cards.first().boundingBox();
  if (!trackBox || !firstBox) throw new Error("Ukuran kartu negara tidak tersedia.");
  if (testInfo.project.name === "desktop") {
    expect(firstBox.width).toBeGreaterThan(trackBox.width / 5);
    expect(firstBox.width).toBeLessThan(trackBox.width / 3);
  }

  const startX = trackBox.x + Math.min(trackBox.width - 30, 280);
  const y = firstBox.y + Math.min(30, firstBox.height / 2);
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 180, y, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  await track.evaluate((element) =>
    element.scrollTo({ left: element.scrollWidth, behavior: "instant" })
  );
  await expect(cards.last()).toBeInViewport();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await cards.last().getByRole("link", { name: "Lihat detail" }).click();
  await expect(page).toHaveURL(/\/negara-tujuan\/brunei-darussalam$/);
});

test("kartu negara di beranda memakai ringkasan yang sama", async ({ page }, testInfo) => {
  await page.goto("/");
  const track = page.locator(".country-carousel-track");
  await expect(track.locator(".country-card")).toHaveCount(5);
  await expect(track.locator(".status-pill, .tags")).toHaveCount(0);
  await expect(page.locator(".country-carousel-indicator")).toHaveCount(0);
  await expect(track.getByText("Pilihan pekerjaan di Brunei Darussalam:")).toBeVisible();
  await track.screenshot({
    path: `artifacts/screenshots/home-country-carousel-${testInfo.project.name}.png`
  });
});
