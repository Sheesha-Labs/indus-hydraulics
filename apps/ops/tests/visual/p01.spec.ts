import { expect, test } from '../signed-in'
import { prepare, settle } from './helpers'

/**
 * Committed baselines for the P01 sign-in pages (S03-T07), signed out, at 1440 × 940. The signed-in P01
 * pages (welcome, setup steps, team) are not baselined here: their content follows the shared e2e
 * database (setup progress, uploaded logo, people), so they are covered by e2e assertions, axe and the
 * local design-parity run (tests/visual-design/p01.spec.ts) instead.
 */
const SIGNED_OUT = [
  ['sign-in', '/sign-in'],
  ['sign-in-locked', '/sign-in?error=locked&minutes=14'],
  ['sign-in-not-invited', '/sign-in?error=not_invited'],
  ['sign-in-session-ended', '/sign-in?reason=session_ended&next=%2Freview'],
  ['sign-in-forgot', '/sign-in/forgot'],
  ['sign-in-two-factor-setup', '/sign-in/two-factor/setup'],
] as const

for (const [name, path] of SIGNED_OUT) {
  test(`p01/${name}`, async ({ page }) => {
    await prepare(page)
    await page.goto(path)
    await page.locator('[data-template="T11"]').waitFor()
    await settle(page)
    await expect(page).toHaveScreenshot(`p01-${name}.png`)
  })
}
