import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * axe (WCAG 2.1 AA; critical and serious fail) on every signed-out board-77 page and state (S03-T07).
 * The signed-in auth, setup and team pages are covered in setup.spec.ts, team.spec.ts and devices.spec.ts;
 * the valid reset link in tests/e2e-auth/auth-password.spec.ts.
 */
async function expectNoSeriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  ).toEqual([])
}

const PAGES = [
  '/sign-in',
  '/sign-in?error=personal_account',
  '/sign-in?error=wrong_domain',
  '/sign-in?error=not_invited',
  '/sign-in?error=email_unverified',
  '/sign-in?error=locked&minutes=12',
  '/sign-in?error=deactivated',
  '/sign-in?error=expired',
  '/sign-in?reason=session_ended&next=%2Fenquiries',
  '/sign-in?reason=session_revoked',
  '/sign-in/forgot',
  '/sign-in/two-factor',
  '/sign-in/two-factor/setup',
  '/sign-in/reset/abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
  '/sign-in/invite/abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
] as const

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('main')).toBeVisible()
    await expectNoSeriousViolations(page)
  })
}

test('keyboard: the sign-in card is reachable in order with Tab alone', async ({ page }) => {
  await page.goto('/sign-in')
  const order: string[] = []
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab')
    order.push(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        return el
          ? `${el.tagName.toLowerCase()}:${el.getAttribute('name') ?? el.textContent?.trim() ?? ''}`
          : ''
      })
    )
  }
  const google = order.findIndex((o) => o.includes('Continue with Google'))
  const email = order.findIndex((o) => o === 'input:email')
  const password = order.findIndex((o) => o === 'input:password')
  const submit = order.findIndex((o) => o === 'button:Sign in')
  expect(google).toBeGreaterThanOrEqual(0)
  expect(email).toBeGreaterThan(google)
  expect(password).toBeGreaterThan(email)
  expect(submit).toBeGreaterThan(password)
})
