import { expect, test } from "@playwright/test";
test("capture halaman representatif untuk QA visual", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  for (const [name, path] of [
    ["home", "/"],
    ["about", "/tentang-kami"],
    ["services", "/layanan"],
    ["countries", "/negara-tujuan"],
    ["lowongan", "/lowongan"],
    ["country-hong-kong", "/negara-tujuan/hong-kong"],
    ["training", "/program-pelatihan"],
    ["legal", "/legalitas"],
    ["gallery", "/galeri"],
    ["testimonials", "/testimoni"],
    ["news", "/berita"],
    ["faq", "/faq"],
    ["daftar", "/daftar?country=hong-kong"],
    ["kontak", "/kontak"],
    ["privacy", "/kebijakan-privasi"],
    ["terms", "/syarat-ketentuan"],
    ["admin-login", "/admin/login"]
  ] as const) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      window.scrollTo(0, 0);
      document
        .querySelectorAll(".reveal-node")
        .forEach((element) => element.classList.add("reveal-visible"));
    });
    await page.waitForTimeout(150);
    await page.screenshot({
      path: `artifacts/screenshots/${name}-${testInfo.project.name}.png`,
      fullPage: true
    });
    if (name === "home") {
      await page.locator(".trust-strip").screenshot({
        path: `artifacts/screenshots/quick-facts-${testInfo.project.name}.png`
      });
    }
    if (name === "countries") {
      await page.locator(".country-grid").screenshot({
        path: `artifacts/screenshots/country-cards-${testInfo.project.name}.png`
      });
    }
  }
});
