import { expect, test } from "@playwright/test";

test("headings use Bricolage and body text uses Plus Jakarta Sans", async ({ page }) => {
  await page.goto("/masuk");
  const h1 = await page.locator("h1").first().evaluate((el) => getComputedStyle(el).fontFamily);
  const body = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1.toLowerCase()).toContain("bricolage");
  expect(body.toLowerCase()).toContain("jakarta");
});
