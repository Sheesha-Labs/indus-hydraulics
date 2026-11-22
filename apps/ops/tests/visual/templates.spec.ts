import { expect, test } from '../signed-in'
import { prepare, settle } from './helpers'

/**
 * Committed baselines of the template specimens (S02-T04): /_kit/templates/<t> inside AppShell, signed in
 * as the Owner, at 1440 × 940. Neutral fixtures only. The people come from the database, so the sidebar's
 * identity line and avatar row are masked, as in appshell.spec.ts.
 */
const SPECIMENS = ['t1a', 't1b', 't2a', 't2b', 't3a', 't4a', 't5a', 't6a'] as const

for (const t of SPECIMENS) {
  test(`templates/${t}`, async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await prepare(page)
    await page.goto(`/_kit/templates/${t}`)
    await page.locator('[data-template]').first().waitFor()
    await settle(page)
    // Client parts (the Composer's editor, proposal cards) settle after hydration.
    await page.waitForFunction(() => {
      const toggle = document.querySelector('[data-part="sidebar-toggle"]')
      return toggle !== null && Object.keys(toggle).some((k) => k.startsWith('__reactProps'))
    })
    const sidebar = page.locator('[data-part="sidebar"]')
    await expect(page).toHaveScreenshot(`templates-${t}.png`, {
      mask: [sidebar.getByText(/^Signed in as /), sidebar.locator('[data-part="profile-trigger"]')],
    })
  })
}
