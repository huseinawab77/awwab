import { expect, test } from "@playwright/test";
import { freshStart } from "./helpers";

test.beforeEach(async ({ page }) => {
  await freshStart(page);
});

test("week report matches today's score and shows the journey", async ({ page }) => {
  await page.getByRole("button", { name: "Tandai Journaling beres" }).click();
  const score = (await page.getByTestId("score").innerText()).trim();
  await page.getByRole("link", { name: "Rapor" }).click();
  await expect(page).toHaveURL(/\/rapor$/);
  await expect(page.getByTestId("average")).toHaveText(score);
  await expect(page.getByRole("img", { name: new RegExp(`Rabu ${score}, Kamis belum`) })).toBeVisible();
  // Habits started today: one day isn't enough to judge consistency.
  await expect(page.getByText("Belum cukup data")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Minggu berikutnya" })).toBeDisabled();
});

test("month view shows the weekly chart and saves the note by itself", async ({ page }) => {
  await page.getByRole("link", { name: "Rapor" }).click();
  await page.getByRole("radio", { name: "Bulan" }).click();
  await expect(page.getByRole("heading", { name: "Rata-rata per minggu" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Target bulan ini" })).toBeVisible();
  const note = page.getByLabel("Catatan bulan ini");
  await note.fill("Bulan ini fokus lomba.");
  await page.clock.runFor(1000);
  await expect(page.getByRole("status").filter({ hasText: "Tersimpan" })).toBeVisible();
  await page.reload();
  await page.getByRole("radio", { name: "Bulan" }).click();
  await expect(page.getByLabel("Catatan bulan ini")).toHaveValue("Bulan ini fokus lomba.");
});

test("going back a week shows an empty period without breaking", async ({ page }) => {
  await page.getByRole("link", { name: "Rapor" }).click();
  await page.getByRole("button", { name: "Minggu sebelumnya" }).click();
  await expect(page.getByText("9–15 November")).toBeVisible();
  await expect(page.getByText("Belum ada skor di periode ini")).toBeVisible();
});
