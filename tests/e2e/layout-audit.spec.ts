import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/tentang-kami",
  "/layanan",
  "/negara-tujuan",
  "/negara-tujuan/hong-kong",
  "/lowongan",
  "/program-pelatihan",
  "/legalitas",
  "/galeri",
  "/testimoni",
  "/berita",
  "/faq",
  "/kontak",
  "/daftar?country=hong-kong",
  "/kebijakan-privasi",
  "/syarat-ketentuan"
];

test("seluruh halaman publik rapi dan bebas teks internal", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();

    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      text: document.body.innerText
    }));

    expect.soft(result.overflow, `overflow horizontal pada ${route}`).toBeLessThanOrEqual(1);
    expect
      .soft(result.text, `teks internal muncul pada ${route}`)
      .not.toMatch(/\b(?:CMS|admin|klien)\b|seed database|paket klien/i);
  }
});
