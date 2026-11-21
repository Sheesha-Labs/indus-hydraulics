import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100'
// Local runs can point at an installed Chromium instead of downloading one.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  projects: [
    {
      name: 'ops-e2e',
      use: {
        ...devices['Desktop Chrome'],
        // Full Chromium in new headless mode (the headless shell does not paint
        // backdrop-filter, which the console's frosted surfaces use).
        channel: executablePath ? undefined : 'chromium',
        viewport: { width: 1440, height: 940 },
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_REUSE_SERVER
    ? undefined
    : {
        command: 'bun run dev',
        url: `${BASE_URL}/robots.txt`,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { APP_ENV: 'local' },
      },
})
