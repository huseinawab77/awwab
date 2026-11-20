import { expect, test } from "@playwright/test";

test("headings and body text use Schibsted Grotesk", async ({ page }) => {
  await page.goto("/masuk");
  const h1 = await page.locator("h1").first().evaluate((el) => getComputedStyle(el).fontFamily);
  const body = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1.toLowerCase()).toContain("schibsted");
  expect(body.toLowerCase()).toContain("schibsted");
});
