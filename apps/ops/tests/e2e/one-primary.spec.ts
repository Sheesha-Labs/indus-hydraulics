import type { Page } from '@playwright/test'
import { expect, test, type DemoUser } from '../signed-in'
import { CONSOLE } from './route-table'

/**
 * One primary action per view (CLAUDE.md §4.9, S02-T09): on every static route of the route table, signed in
 * as the Owner and as the Helper, at most one VISIBLE `[data-variant="primary"]` outside open dialogs. The
 * decision cards are their own views and keep their primary (ProposalCard, Composer and a drafted email;
 * templates.spec.ts). Also the first-run pages outside the shell, the sign-in pages and the client pages.
 */

const PRIMARY = [
  '[data-variant="primary"]',
  ':not([role="dialog"] *)',
  ':not([role="alertdialog"] *)',
  ':not([data-part="proposal"] *)',
  ':not([data-part="composer"] *)',
  ':not([data-part="drafted-email"] *)',
].join('')

const SETUP = [
  '/welcome',
  '/setup/company',
  '/setup/mailboxes',
  '/setup/history',
  '/setup/money',
  '/setup/assistant',
  '/setup/invite',
]

const TOKEN = 'abcdefghijklmnopqrstuv'
const SIGNED_OUT = [
  '/sign-in',
  '/sign-in/forgot',
  `/sign-in/reset/${TOKEN}`,
  `/sign-in/invite/${TOKEN}`,
  '/sign-in/two-factor',
  '/sign-in/two-factor/setup',
  `/q/${TOKEN}`,
  `/q/${TOKEN}/accept`,
  `/q/${TOKEN}/changes`,
  '/q/legacy/Q-2026-ABCD',
  `/d/${TOKEN}`,
  `/s/${TOKEN}`,
  `/u/${TOKEN}`,
]

/** Visible primaries outside dialogs, with their labels for the failure message. */
async function visiblePrimaries(page: Page): Promise<string[]> {
  const all = page.locator(PRIMARY)
  const out: string[] = []
  for (const el of await all.all())
    if (await el.isVisible()) out.push((await el.innerText()).trim() || '(no text)')
  return out
}

for (const who of ['owner', 'helper'] as const satisfies readonly DemoUser[]) {
  test.describe(`one-primary · ${who}`, () => {
    test.describe.configure({ mode: 'parallel' })
    for (const path of [...CONSOLE.map(([p]) => p), ...SETUP]) {
      test(`one-primary: ${path} (${who})`, async ({ page, signedInAs }) => {
        await signedInAs(who)
        const res = await page.goto(path)
        expect(res?.status()).toBe(200)
        // The page has streamed in: a console page marks its content [data-arrives] (a skeleton) or
        // [data-built] (a finished page, e.g. /settings/team) (routes.spec.ts); a
        // first-run page is its template.
        await expect(
          page
            .locator(
              SETUP.includes(path)
                ? '[data-template]'
                : 'main#content :is([data-arrives], [data-built])'
            )
            .first()
        ).toBeVisible()
        const found = await visiblePrimaries(page)
        expect(found.length, found.join(', ')).toBeLessThanOrEqual(1)
      })
    }
  })
}

test.describe('one-primary · signed out', () => {
  test.describe.configure({ mode: 'parallel' })
  for (const path of SIGNED_OUT) {
    test(`one-primary: ${path} (signed out)`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('[data-template]').first()).toBeVisible()
      const found = await visiblePrimaries(page)
      expect(found.length, found.join(', ')).toBeLessThanOrEqual(1)
    })
  }
})
