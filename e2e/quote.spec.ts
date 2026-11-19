import { expect, test } from "@playwright/test";
import { freshStart } from "./helpers";

test("shows the daily quote once a day, then Hari Ini", async ({ page }) => {
  await freshStart(page);
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem("awwab:demo-db")!);
    db.settings.showQuote = true;
    localStorage.setItem("awwab:demo-db", JSON.stringify(db));
  });
  await page.goto("/hari-ini");
  await expect(page).toHaveURL(/\/kutipan$/);
  await expect(page.getByRole("heading", { name: "Selamat pagi, Awab" })).toBeVisible();
  await expect(page.getByText("Rabu, 18 November")).toBeVisible();
  await page.getByRole("button", { name: "Mulai hari ini" }).click();
  await expect(page).toHaveURL(/\/hari-ini$/);
  await page.reload();
  await expect(page).toHaveURL(/\/hari-ini$/);
  await expect(page.getByTestId("score")).toBeVisible();
});

test("skips the quote when it's switched off", async ({ page }) => {
  await freshStart(page);
  await page.goto("/minggu");
  await expect(page).toHaveURL(/\/minggu$/);
});
