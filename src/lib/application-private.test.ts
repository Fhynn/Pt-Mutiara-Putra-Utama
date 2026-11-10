import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptNik, encryptNik, processApplicantPhoto } from "@/lib/application-private";

afterEach(() => vi.unstubAllEnvs());

describe("data pribadi pendaftar", () => {
  it("mengenkripsi NIK dan menolak kunci yang berbeda", () => {
    vi.stubEnv("NEXTAUTH_SECRET", "a-secret-value-with-more-than-32-characters-1234");
    const encrypted = encryptNik("3201010101010001");
    expect(encrypted).not.toContain("3201010101010001");
    expect(decryptNik(encrypted)).toBe("3201010101010001");
    vi.stubEnv("NEXTAUTH_SECRET", "another-secret-value-with-more-than-32-characters");
    expect(() => decryptNik(encrypted)).toThrow();
  });

  it("menolak foto di atas 2 MB dan berkas palsu", async () => {
    await expect(
      processApplicantPhoto(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], "a.jpg", { type: "image/jpeg" })
      )
    ).rejects.toThrow(/2 MB/);
    await expect(
      processApplicantPhoto(new File(["bukan foto"], "a.jpg", { type: "image/jpeg" }))
    ).rejects.toThrow(/valid/);
  });
});
