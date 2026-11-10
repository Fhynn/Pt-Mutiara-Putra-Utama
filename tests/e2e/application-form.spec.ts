import { expect, test } from "@playwright/test";

test("formulir CPMI mengirim biodata dan satu foto setelah persetujuan", async ({ page }) => {
  await page.goto("/daftar?country=hong-kong");
  await page.getByLabel("Sektor *").selectOption("INFORMAL");
  await page.getByLabel("Nama lengkap sesuai KTP *").fill("Pendaftar Uji");
  await page.getByLabel("Nomor NIK *").fill("0000000000000000");
  await page.getByLabel("Tempat lahir *").fill("Bogor");
  await page.getByLabel("Tanggal lahir *").fill("1995-01-01");
  await page.getByLabel("Jenis kelamin *").selectOption("PEREMPUAN");
  await page.getByLabel("Status pernikahan *").selectOption("BELUM_MENIKAH");
  await page.getByLabel("Agama *").selectOption("ISLAM");
  await page.getByLabel("Tinggi badan (cm) *").fill("160");
  await page.getByLabel("Berat badan (kg) *").fill("55");
  await page.getByLabel("Alamat lengkap *").fill("Jalan Melati nomor satu");
  await page.getByLabel("RT *").fill("001");
  await page.getByLabel("RW *").fill("002");
  await page.getByLabel("Desa / Kelurahan *").fill("Bojong Kulur");
  await page.getByLabel("Kecamatan *").fill("Gunung Putri");
  await page.getByLabel("Kabupaten / Kota *").fill("Bogor");
  await page.getByLabel("Provinsi *").fill("Jawa Barat");
  await page.getByLabel("Nomor telepon / WhatsApp *").fill("081234567890");
  await page.getByLabel("Email *").fill("uji@example.com");
  await page.getByLabel("Pengalaman kerja *").fill("Pernah bekerja di Jakarta selama dua tahun.");
  await page.getByLabel("Unggah foto diri *").setInputFiles({
    name: "foto.png",
    mimeType: "image/png",
    buffer: Buffer.from("foto-uji")
  });
  await page.getByRole("checkbox", { name: /Saya menyetujui/ }).check();

  let submitted = false;
  await page.route("**/api/applications", async (route) => {
    const data = route.request().postDataBuffer()?.toString("utf8") ?? "";
    expect(data).toContain("0000000000000000");
    expect(data).toContain("foto.png");
    submitted = true;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ referenceNumber: "MPU-UJI" })
    });
  });
  await page.getByRole("button", { name: "Kirim Pendaftaran" }).click();
  await expect(page.getByRole("status")).toContainText("MPU-UJI");
  expect(submitted).toBe(true);
});
