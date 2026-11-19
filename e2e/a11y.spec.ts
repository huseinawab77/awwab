import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { freshStart } from "./helpers";

const scan = (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();

test("sign-in page has no WCAG A/AA violations", async ({ page }) => {
  await page.goto("/masuk");
  await expect(page.getByRole("heading").first()).toBeVisible();
  const { violations } = await scan(page);
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
});

for (const path of ["/hari-ini", "/minggu", "/rapor", "/atur", "/atur/kebiasaan/baru"]) {
  test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
    await freshStart(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const { violations } = await scan(page);
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
  });
}
