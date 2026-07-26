import { defineConfig, devices } from "@playwright/test";

// The port is pinned (and --strictPort set) so the dev server can never drift
// to 5174 and leave the tests pointing at nothing. Keep the host as `localhost`
// rather than an IP: ChatHome calls crypto.randomUUID() on every submit, which
// is only available in a secure context.
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* `open: never` so a failing run doesn't launch a browser and hang CI. */
  reporter: [["list"], ["html", { open: "never" }]],
  /* Headroom over the 600ms demo response delay plus a cold Vite dep optimize. */
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Chromium plus WebKit: the app carries Safari-specific workarounds (h-dvh,
     16px inputs to stop iOS zoom, the modal portal that dodges `transform`
     containing blocks), so WebKit earns its runtime. Nothing here is
     Firefox-specific. */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Run the Vite dev server before starting the tests. */
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
