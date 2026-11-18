import { defineConfig } from "@playwright/test";

// UI flows run against the in-memory demo store (NEXT_PUBLIC_DEMO=1); see ledger Task 3.
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3200",
    viewport: { width: 390, height: 844 },
    launchOptions: { executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome" },
    timezoneId: "Asia/Jakarta",
    locale: "id-ID",
  },
  webServer: {
    command: "NEXT_PUBLIC_DEMO=1 NEXT_DIST_DIR=.next-demo npx next dev -p 3200",
    url: "http://localhost:3200/masuk",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
