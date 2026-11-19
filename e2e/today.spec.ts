import { expect, test, type Page } from "@playwright/test";
import { freshStart } from "./helpers";

const score = (page: Page) => page.getByTestId("score");

test("starts at 0 with a sleepy cat and reaches 100 when everything is done", async ({ page }) => {
  await freshStart(page);
  await expect(page.getByRole("heading", { name: "Halo, Awab" })).toBeVisible();
  await expect(score(page)).toHaveText("0");
  await expect(page.getByAltText("Kucing AWWAB mengantuk")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tandai Gym beres" })).toBeVisible();

  const unchecked = page.getByRole("button", { name: /^Tandai .* beres$/ });
  while ((await unchecked.count()) > 0) await unchecked.first().click();

  await expect(score(page)).toHaveText("100");
  await expect(page.getByText("Semua beres hari ini. Mantap.")).toBeVisible();
  await expect(page.getByAltText("Kucing AWWAB berbinar")).toBeVisible();
});

test("typed values are validated and overshoot is shown", async ({ page }) => {
  await freshStart(page);
  await page.getByRole("button", { name: "Ubah nilai Protein" }).click();
  const input = page.getByLabel("Protein hari ini (g)");
  await input.fill("-5");
  await expect(page.getByRole("button", { name: "Simpan" })).toBeDisabled();
  await input.fill("");
  await expect(page.getByRole("button", { name: "Simpan" })).toBeDisabled();
  await input.fill("150");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText("150 dari 120 g, lewat target")).toBeVisible();
});

test("plus and minus change a quantity by its step, never below zero", async ({ page }) => {
  await freshStart(page);
  await page.getByRole("button", { name: "Tambah Langkah" }).click();
  await expect(page.getByText("1.000 dari 6.000 langkah")).toBeVisible();
  await page.getByRole("button", { name: "Kurangi Langkah" }).click();
  await expect(page.getByText("0 dari 6.000 langkah")).toBeVisible();
  // At zero the minus button switches off, so the value can't go negative.
  await expect(page.getByRole("button", { name: "Kurangi Langkah" })).toBeDisabled();
});

test("a failed save is rolled back with a message", async ({ page, context }) => {
  await freshStart(page);
  await context.setOffline(true);
  await page.getByRole("button", { name: "Tandai Journaling beres" }).click();
  await expect(page.getByText("Belum tersimpan, coba lagi")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tandai Journaling beres" })).toBeVisible();
  await context.setOffline(false);
});

test("adds a weekly habit to today", async ({ page }) => {
  await freshStart(page);
  await page.getByRole("button", { name: "Tambah ke hari ini" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Laundry" }).click();
  await expect(page.getByRole("button", { name: "Tandai Laundry beres" })).toBeVisible();
});

test("can look back at past days but not forward", async ({ page }) => {
  await freshStart(page);
  await expect(page.getByRole("button", { name: "Hari berikutnya" })).toBeDisabled();
  await page.getByRole("button", { name: "Hari sebelumnya" }).click();
  await expect(page.getByText("Selasa, 17 November")).toBeVisible();
  // Habits started today, so yesterday has nothing planned.
  await expect(page.getByText("Hari santai, nggak ada yang dijadwalkan")).toBeVisible();
  await page.getByRole("button", { name: "Kembali ke hari ini" }).click();
  await expect(page.getByText("Rabu, 18 November")).toBeVisible();
});

test("the focus timer adds its minutes to the habit", async ({ page }) => {
  await freshStart(page);
  await page.getByRole("button", { name: "Tambah ke hari ini" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Deep work/ }).click();
  await page.getByRole("button", { name: "Timer Deep work" }).click();
  await page.getByRole("button", { name: "Mulai" }).click();
  await page.clock.fastForward("25:00");
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.getByRole("button", { name: "Selesai" }).click();
  await expect(page.getByText("25 dari 90 menit")).toBeVisible();
});

test("finishing a timer with no minutes writes nothing", async ({ page }) => {
  await freshStart(page);
  await page.getByRole("button", { name: "Tambah ke hari ini" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Deep work/ }).click();
  await page.getByRole("button", { name: "Timer Deep work" }).click();
  await page.getByRole("button", { name: "Mulai" }).click();
  await page.getByRole("button", { name: "Selesai" }).click();
  await expect(page.getByText("Belum ada menit yang tercatat")).toBeVisible();
  await expect(page.getByText("0 dari 90 menit")).toBeVisible();
});
