import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { DEMO_EMAILS, signInByEmail } from '../signed-in'

/**
 * Board 84 Devices and Security (S03-T02). Two browsers signed in as the same person: the first signs
 * the second out from Devices, and the second's very next page load lands on sign-in with "You were
 * signed out from another device". The second browser has its own user agent, so its row is told apart
 * from the sessions other specs open in parallel ("Firefox on Linux"). Sign out everywhere is opened and
 * cancelled only: confirming it would end every parallel spec's session.
 */
const FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0'

async function signedInPage(browser: Browser, who: 'owner' | 'helper', userAgent?: string) {
  const context = await browser.newContext(userAgent ? { userAgent } : {})
  const res = await signInByEmail(context.request, DEMO_EMAILS[who])
  expect(res.status(), `sign-in as ${who}`).toBe(302)
  expect(res.headers()['location'] ?? '').not.toContain('error=')
  return { context, page: await context.newPage() }
}

async function hydrated(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name }).first()
  await expect
    .poll(() => button.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps'))))
    .toBe(true)
  return button
}

test('signing out another device ends its session on its next page load', async ({ browser }) => {
  const a = await signedInPage(browser, 'helper')
  const b = await signedInPage(browser, 'helper', FIREFOX)

  await b.page.goto('/today')
  await expect(b.page).toHaveURL(/\/today/)

  await a.page.goto('/settings/team#devices')
  const devices = a.page.locator('#devices')
  await expect(devices.getByText('Devices and sessions')).toBeVisible()
  // This device first, with its tag and no Sign out.
  const first = devices.locator('li').first()
  await expect(first).toHaveAttribute('data-session', 'current')
  await expect(first.getByText('This device')).toBeVisible()
  await expect(first.getByText(/Active now/)).toBeVisible()

  const signOut = await hydrated(a.page, 'Sign out Firefox on Linux')
  await signOut.click()
  await expect(a.page.getByText('Signed out Firefox on Linux.')).toBeVisible()

  // The other browser: refused at once by the page's own check (and by the proxy once its cache
  // refreshes), with its reason.
  await b.page.goto('/enquiries')
  await expect(b.page).toHaveURL(/\/sign-in\?reason=session_revoked/)
  await expect(b.page.getByText('You were signed out from another device.')).toBeVisible()
  // Its server actions are refused too: Today's data reads go through requireOpsUser.
  const health = await b.context.request.get('/api/health')
  expect(health.status()).toBe(401)

  // The first browser is still signed in.
  await a.page.goto('/today')
  await expect(a.page).toHaveURL(/\/today/)
  await a.context.close()
  await b.context.close()
})

test('Security shows two-step state and the last sign-ins; Sign out everywhere confirms first', async ({
  browser,
}) => {
  const a = await signedInPage(browser, 'owner')
  await a.page.goto('/settings/team#security')
  const security = a.page.locator('#security')
  await expect(security.getByText('Two-step verification', { exact: true })).toBeVisible()
  await expect(
    security.getByText('Always on for password sign-in. Google sign-in uses Google’s own 2-step.')
  ).toBeVisible()
  await expect(security.getByText('Last sign-in')).toBeVisible()
  await expect(security.getByText(/Today \d\d:\d\d/).first()).toBeVisible()
  await expect(security.getByRole('button', { name: 'Download my data ↗' })).toBeDisabled()
  await expect(security.getByText('Arrives with Data settings')).toBeVisible()

  const everywhere = await hydrated(a.page, 'Sign out everywhere')
  await everywhere.click()
  const dialog = a.page.getByRole('alertdialog')
  await expect(dialog.getByText('This device stays signed in.')).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()

  const axe = await new AxeBuilder({ page: a.page })
    .include('#devices')
    .include('#security')
    .analyze()
  const serious = axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([])
  await a.context.close()
})

test('changing the password asks for a recent sign-in, then opens the form', async ({
  browser,
}) => {
  const a = await signedInPage(browser, 'helper')
  await a.page.goto('/settings/team#security')
  const button = await hydrated(a.page, /^(Change password|Set a password)$/)
  await button.click()
  // Just signed in: within the 10-minute window, so the form opens here.
  await expect(a.page).toHaveURL(/security=password/)
  await expect(a.page.locator('#security').getByLabel(/^(New password|Password)$/)).toBeVisible()
  await a.context.close()
})
