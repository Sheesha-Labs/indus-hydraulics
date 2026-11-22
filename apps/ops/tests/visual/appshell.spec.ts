import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'
import { prepare, settle } from './helpers'

/**
 * Committed baselines of the empty AppShell (S02-T03): the Today placeholder inside the shell, for the Owner
 * and for the Helper, at 1440 × 940. The people come from the database, so their names are masked: the
 * sidebar's identity line, the avatar row and the placeholder's "Signed in as" line. Everything else (the
 * sidebar, the frame, the page background) is compared.
 */

async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const toggle = document.querySelector('[data-part="sidebar-toggle"]')
    return toggle !== null && Object.keys(toggle).some((k) => k.startsWith('__reactProps'))
  })
}

for (const who of ['owner', 'helper'] as const) {
  test(`appshell ${who}`, async ({ page, signedInAs }) => {
    await signedInAs(who)
    await prepare(page)
    await page.goto('/today')
    await settle(page)
    await hydrated(page)
    const sidebar = page.locator('[data-part="sidebar"]')
    await expect(page).toHaveScreenshot(`appshell-${who}.png`, {
      mask: [
        sidebar.getByText(/^Signed in as /),
        sidebar.locator('[data-part="profile-trigger"]'),
        page.locator('#content').getByText(/^Signed in as /),
      ],
    })
  })
}
