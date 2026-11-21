import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      // Full Chromium in new headless mode, not the headless shell: the shell
      // renders without a GPU path that paints backdrop-filter, so the frosted
      // header reads as transparent in screenshots and the contrast check
      // measures text against the band beneath instead of the bar.
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: process.env.PLAYWRIGHT_REUSE_SERVER
    ? undefined
    : {
        command: 'bun run --filter web dev',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
