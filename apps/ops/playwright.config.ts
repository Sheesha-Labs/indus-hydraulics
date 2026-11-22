import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100'
// Local runs can point at an installed Chromium instead of downloading one.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
const chromium = {
  ...devices['Desktop Chrome'],
  // Full Chromium in new headless mode (the headless shell does not paint
  // backdrop-filter, which the console's frosted surfaces use).
  channel: executablePath ? undefined : 'chromium',
  viewport: { width: 1440, height: 940 },
  ...(executablePath ? { launchOptions: { executablePath } } : {}),
}
/** Boards are 1440 × 940 at DPR 1; nothing moves (ADR-25, §6.9). */
const board = {
  ...chromium,
  deviceScaleFactor: 1,
  colorScheme: 'light' as const,
  contextOptions: { reducedMotion: 'reduce' as const },
}
// Design-parity output never lands in the repo: it goes to the evidence folder.
const EVIDENCE = process.env.OPS_EVIDENCE_DIR
  ? join(process.env.OPS_EVIDENCE_DIR, 'visual', process.env.OPS_SPRINT ?? 's01')
  : join(tmpdir(), 'ops-visual-design')

export default defineConfig({
  testDir: './tests/e2e',
  // Refreshes $OPS_EVIDENCE_DIR/visual/<sprint>/summary.md after a design-parity run (a no-op otherwise).
  globalTeardown: './tests/visual-design/teardown.ts',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.001 },
  },
  projects: [
    { name: 'ops-e2e', testDir: './tests/e2e', use: chromium },
    {
      // Committed regression baselines, neutral fixtures only.
      name: 'ops-visual',
      testDir: './tests/visual',
      snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
      use: board,
    },
    {
      // Local only: parity with the handoff in $OPS_DESIGN_REF_DIR.
      name: 'ops-visual-design',
      testDir: './tests/visual-design',
      outputDir: join(EVIDENCE, 'test-results'),
      use: board,
    },
  ],
  webServer: process.env.PLAYWRIGHT_REUSE_SERVER
    ? undefined
    : {
        command: 'bun run dev',
        url: `${BASE_URL}/robots.txt`,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { APP_ENV: 'local', OPS_KIT: '1', OPS_E2E_AUTH: '1' },
      },
})
