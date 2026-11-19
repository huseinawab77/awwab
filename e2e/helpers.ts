import { expect, type Page } from "@playwright/test";

// Wednesday 18 Nov 2026, 10:00 WIB — gym is planned by routine on Mon/Wed/Fri.
export const WED_10AM = new Date("2026-11-18T03:00:00Z");

/** Clean demo store, skip the quote screen, pick the 18 default habits, land on Hari Ini. */
export async function freshStart(page: Page) {
  await page.clock.install({ time: WED_10AM });
  await page.goto("/mulai");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      "awwab:demo-db",
      JSON.stringify({ settings: { showQuote: false, lastQuoteOn: null, displayName: "Awab" } }),
    );
  });
  await page.reload();
  await page.getByRole("button", { name: "Lanjut (18 kebiasaan)" }).click();
  await page.getByRole("button", { name: "Mulai hari ini" }).click();
  await expect(page).toHaveURL(/\/hari-ini$/);
}
