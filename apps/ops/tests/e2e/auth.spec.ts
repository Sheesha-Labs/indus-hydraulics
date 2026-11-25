import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * Sign-in through the test provider (OPS_E2E_AUTH=1, never in production).
 *
 * Needs the disposable Postgres with one active Owner, OPS_E2E_OWNER_EMAIL
 * (default owner@example.test): see docs/runbook-s00.md. Without it these fail,
 * on purpose: a sign-in suite that skips itself proves nothing.
 */
const OWNER = process.env.OPS_E2E_OWNER_EMAIL ?? 'owner@example.test'

async function signIn(request: APIRequestContext, email: string) {
  const { csrfToken } = (await (await request.get('/api/auth/csrf')).json()) as {
    csrfToken: string
  }
  return request.post('/api/auth/callback/ops-test', {
    form: { csrfToken, email },
    maxRedirects: 0,
  })
}

test('an address that was never invited is refused and gets no session', async ({ page }) => {
  const res = await signIn(page.context().request, 'stranger@example.test')
  expect(res.status()).toBe(302)
  expect(res.headers()['location']).toContain('/sign-in?error=')
  const cookies = await page.context().cookies()
  expect(cookies.some((c) => c.name.includes('ops-session'))).toBe(false)
  await page.goto('/today')
  await expect(page).toHaveURL(/\/sign-in\?next=%2Ftoday$/)
})

test('the Owner signs in, reaches Today, and signs out', async ({ page }) => {
  const res = await signIn(page.context().request, OWNER)
  expect(res.status()).toBe(302)
  expect(res.headers()['location']).not.toContain('error=')

  const session = (await page.context().cookies()).find((c) => c.name.endsWith('ops-session'))
  expect(session?.httpOnly).toBe(true)
  expect(session?.sameSite).toBe('Lax')

  await page.goto('/today')
  // S07: Today greets the person (board 178); the sidebar names who is signed in.
  await expect(
    page.getByRole('heading', { level: 1, name: /^Good (morning|afternoon|evening), / })
  ).toBeVisible()
  await expect(page.getByText(/^Signed in as /)).toBeVisible()

  const health = await page.context().request.get('/api/health')
  expect(health.status()).toBe(200)
  expect(((await health.json()) as { db: { alert: boolean } }).db.alert).toBe(false)

  // Sign out is in the account menu (board 74): a server-action form. Open the menu once React has hydrated
  // the trigger, or the click can land before its handler is bound (S02-T09: intermittent).
  const menu = page.getByRole('button', { name: /account menu/ })
  await expect
    .poll(() => menu.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps'))))
    .toBe(true)
  await menu.click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in/)
  await page.goto('/today')
  await expect(page).toHaveURL(/\/sign-in\?next=%2Ftoday$/)
})
