import { expect, test, type Page } from '@playwright/test'
import { opsCookieNames } from '../../src/lib/auth-cookies'
import { TEXT } from '../../src/components/auth/states'
import { setGoogleClaims, type GoogleClaims } from '../google-mock'

/**
 * Board 77 · Continue with Google against the mock issuer (S03-T07). The dev server runs with
 * OPS_E2E_GOOGLE_ISSUER pointing at tests/global-setup.ts's server, so the real Google provider, its
 * PKCE/state/nonce checks and the real signIn callback (hd, email_verified, invited) run end to end.
 * Serial: the claims are one shared file.
 */
test.describe.configure({ mode: 'serial' })

const DOMAIN = process.env.GOOGLE_WORKSPACE_DOMAIN ?? 'example.test'

async function continueWithGoogle(page: Page, claims: GoogleClaims) {
  setGoogleClaims(claims)
  await page.goto('/sign-in')
  const google = page.getByRole('button', { name: /Continue with Google|Use another account/ })
  await expect(google).toBeVisible()
  await google.click()
}

test('an invited, active Workspace account signs in and lands per the landing rule', async ({ page }) => {
  await continueWithGoogle(page, { email: `owner@${DOMAIN}`, hd: DOMAIN })
  // The first redirect may land on a page the dev server is still compiling.
  await expect(page).toHaveURL(/\/(today|welcome)$/, { timeout: 30_000 })
  const cookies = await page.context().cookies()
  // Local http: no __Host- prefix; production uses the __Host- name (asserted from the same function).
  expect(cookies.map((c) => c.name)).toContain(opsCookieNames(false).session)
  expect(opsCookieNames(true).session).toBe('__Host-indus.ops-session')
})

test('a personal Google account is refused with the board copy', async ({ page }) => {
  await continueWithGoogle(page, { email: 'someone@gmail.com', hd: null })
  await expect(page).toHaveURL(/\/sign-in\?error=personal_account/)
  await expect(page.getByText(TEXT.personalAccount)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Use another account' })).toBeVisible()
})

test('another Workspace domain is refused', async ({ page }) => {
  await continueWithGoogle(page, { email: 'someone@other.test', hd: 'other.test' })
  await expect(page).toHaveURL(/\/sign-in\?error=wrong_domain/)
  await expect(page.getByText(TEXT.wrongDomain(DOMAIN))).toBeVisible()
})

test('an unverified address is refused', async ({ page }) => {
  await continueWithGoogle(page, { email: `owner@${DOMAIN}`, hd: DOMAIN, email_verified: false })
  await expect(page).toHaveURL(/\/sign-in\?error=email_unverified/)
  await expect(page.getByText(TEXT.emailUnverified)).toBeVisible()
})

test('a Workspace account nobody invited has no access', async ({ page }) => {
  await continueWithGoogle(page, { email: `stranger@${DOMAIN}`, hd: DOMAIN })
  await expect(page).toHaveURL(/\/sign-in\?error=not_invited/)
  await expect(page.getByText(TEXT.notInvited)).toBeVisible()
  // The refusal never echoes the address.
  await expect(page.getByText(`stranger@${DOMAIN}`)).toHaveCount(0)
})
