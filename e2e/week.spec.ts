import { expect, test } from "@playwright/test";
import { freshStart } from "./helpers";

test.beforeEach(async ({ page }) => {
  await freshStart(page);
  await page.getByRole("link", { name: "Minggu" }).click();
  await expect(page).toHaveURL(/\/minggu$/);
});

test("routine habits show on their days", async ({ page }) => {
  await page.getByRole("button", { name: /^Jumat 20/ }).click();
  const plan = page.getByRole("region", { name: /Jumat 20/ });
  await expect(plan.getByText("Gym")).toBeVisible();
  await expect(plan.getByText("Dari rutinitas")).toBeVisible();
});

test("schedules a weekly target onto a future day and removes it", async ({ page }) => {
  await page.getByRole("button", { name: /^Kamis 19/ }).click();
  await page.getByRole("button", { name: "Jadwalkan Laundry ke Kamis" }).click();
  const plan = page.getByRole("region", { name: /Kamis 19/ });
  await expect(plan.getByText("Laundry")).toBeVisible();
  await expect(plan.getByText("Dijadwalin manual")).toBeVisible();
  await page.getByRole("button", { name: "Hapus Laundry dari jadwal" }).click();
  await expect(plan.getByText("Laundry")).toHaveCount(0);
});

test("past days can't get new plans", async ({ page }) => {
  // Pretend the habits started earlier this month, so Tuesday has targets to show.
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem("awwab:demo-db")!);
    db.habits = db.habits.map((h: { startOn: string }) => ({ ...h, startOn: "2026-11-01" }));
    localStorage.setItem("awwab:demo-db", JSON.stringify(db));
  });
  await page.reload();
  await page.getByRole("button", { name: /^Selasa 17/ }).click();
  await expect(page.getByRole("button", { name: "Jadwalkan Laundry ke Selasa" })).toBeDisabled();
});

test("shows weekly and monthly targets with progress", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Target minggu ini" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Target bulan ini" })).toBeVisible();
  await expect(page.getByText("0 dari 3 kali").first()).toBeVisible();
});
