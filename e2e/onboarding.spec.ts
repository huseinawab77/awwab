import { expect, test } from "@playwright/test";

test("first visit picks starter habits and lands on Hari Ini", async ({ page }) => {
  await page.goto("/mulai");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Lanjut (18 kebiasaan)" }).click();
  await page.getByRole("button", { name: "Mulai hari ini" }).click();
  await expect(page).toHaveURL(/\/hari-ini$/);
  const count = await page.evaluate(() => JSON.parse(localStorage.getItem("awwab:demo-db") ?? "{}").habits?.length);
  expect(count).toBe(18);
  await page.goto("/mulai");
  await expect(page).toHaveURL(/\/hari-ini$/);
});

test("unchecking a habit lowers the count", async ({ page }) => {
  await page.goto("/mulai");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Batal pilih Journaling" }).click();
  await expect(page.getByRole("button", { name: "Lanjut (17 kebiasaan)" })).toBeVisible();
});
