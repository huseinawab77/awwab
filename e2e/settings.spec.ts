import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { freshStart } from "./helpers";

test.beforeEach(async ({ page }) => {
  await freshStart(page);
  await page.getByRole("link", { name: "Atur" }).click();
  await expect(page).toHaveURL(/\/atur$/);
});

test("adds a new daily quantity habit", async ({ page }) => {
  await page.getByRole("link", { name: "+ Kebiasaan baru" }).click();
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText("Nama wajib diisi")).toBeVisible();
  await page.getByLabel("Nama").fill("Minum air");
  await page.getByRole("radio", { name: "Angka" }).click();
  await page.getByLabel("Satuan").fill("gelas");
  await page.getByLabel("Target per hari").fill("8");
  await page.getByLabel("Tambah per ketukan").fill("1");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page).toHaveURL(/\/atur$/);
  await page.getByRole("link", { name: "Hari Ini" }).click();
  await expect(page.getByRole("button", { name: "Tambah Minum air" })).toBeVisible();
});

test("changing Gym's routine days moves it in the week", async ({ page }) => {
  await page.getByRole("link", { name: /^Gym/ }).click();
  await page.getByRole("button", { name: "Sen" }).click();
  await page.getByRole("button", { name: "Rab" }).click();
  await page.getByRole("button", { name: "Jum" }).click();
  await page.getByRole("button", { name: "Kam" }).click();
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page).toHaveURL(/\/atur$/);
  await page.getByRole("link", { name: "Minggu", exact: true }).click();
  await page.getByRole("button", { name: /^Kamis 19/ }).click();
  await expect(page.getByRole("region", { name: /Kamis 19/ }).getByText("Gym")).toBeVisible();
  await page.getByRole("button", { name: /^Jumat 20/ }).click();
  await expect(page.getByRole("region", { name: /Jumat 20/ }).getByText("Gym")).toHaveCount(0);
});

test("archives and restores a habit", async ({ page }) => {
  await page.getByRole("link", { name: /^Journaling/ }).click();
  await page.getByRole("button", { name: "Arsipkan" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Ya, arsipkan" }).click();
  await expect(page).toHaveURL(/\/atur$/);
  const archived = page.getByRole("region", { name: "Diarsipkan" });
  await expect(archived.getByText("Journaling")).toBeVisible();
  await page.getByRole("link", { name: "Hari Ini" }).click();
  await expect(page.getByRole("button", { name: "Tandai Journaling beres" })).toHaveCount(0);
  await page.getByRole("link", { name: "Atur" }).click();
  await page.getByRole("button", { name: "Pulihkan Journaling" }).click();
  await page.getByRole("link", { name: "Hari Ini" }).click();
  await expect(page.getByRole("button", { name: "Tandai Journaling beres" })).toBeVisible();
});

test("moving a habit down changes the order on Hari Ini", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Naikkan Catat pengeluaran" })).toBeDisabled();
  await page.getByRole("button", { name: "Turunkan Catat pengeluaran" }).click();
  await page.getByRole("link", { name: "Hari Ini" }).click();
  const rows = page.getByRole("button", { name: /^Tandai (Catat pengeluaran|Baca 10 halaman) beres$/ });
  await expect(rows).toHaveCount(2);
  const labels = await rows.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  expect(labels).toEqual(["Tandai Baca 10 halaman beres", "Tandai Catat pengeluaran beres"]);
});

test("daily quote switch is saved", async ({ page }) => {
  const sw = page.getByRole("switch", { name: "Kutipan harian" });
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("awwab:demo-db")!).settings.showQuote);
  expect(saved).toBe(true);
});

test("downloads a JSON backup", async ({ page }) => {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Unduh cadangan" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^awwab-cadangan-2026-11-18\.json$/);
  const json = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(json.habits.length).toBe(18);
});
