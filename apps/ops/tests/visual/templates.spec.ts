import { expect, test } from '../signed-in'
import { prepare, settle } from './helpers'

/**
 * Committed baselines of the template specimens (S02-T04): /_kit/templates/<t> inside AppShell, signed in
 * as the Owner, at 1440 × 940. Neutral fixtures only. The people come from the database, so the sidebar's
 * identity line and avatar row are masked, as in appshell.spec.ts.
 */
const SPECIMENS = [
  't1a',
  't1b',
  't2a',
  't2b',
  't3a',
  't4a',
  't5a',
  't6a',
  't7a',
  't8a',
  't8a-first-run',
  't10a',
  'x1',
] as const

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

/**
 * S02-T05: the templates drawn without the shell (T9 centred wizard, T11 sign-in, T12 client page). No
 * session; T12 also at a phone's 390 × 844, its one responsive surface.
 */
const BARE = [
  { t: 't9a', viewport: { width: 1440, height: 940 }, name: 'templates-t9a.png' },
  { t: 't11a', viewport: { width: 1440, height: 940 }, name: 'templates-t11a.png' },
  { t: 't12a', viewport: { width: 1440, height: 940 }, name: 'templates-t12a.png' },
  { t: 't12a', viewport: { width: 390, height: 844 }, name: 'templates-t12a-390.png' },
] as const

for (const b of BARE) {
  test(`templates/${b.t} at ${b.viewport.width}`, async ({ page }) => {
    await page.setViewportSize(b.viewport)
    await prepare(page)
    await page.goto(`/_kit/templates/${b.t}`)
    await page.locator('[data-template]').first().waitFor()
    await settle(page)
    await expect(page).toHaveScreenshot(b.name)
  })
}
