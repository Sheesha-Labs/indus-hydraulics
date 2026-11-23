import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { codeAt } from '../../src/server/access/totp-core'
import { TEXT } from '../../src/components/auth/states'
import { DEMO_EMAILS, signInByEmail } from '../signed-in'
import { latestSinkMail, resetDemoAuth } from './demo-auth'

/**
 * Board 77 password + authenticator fallback, end to end (S03-T07): enrol an authenticator, set a
 * password in Settings › Security, sign in with password + code and with a backup code (once), reset the
 * password from an emailed link (every other session ends), and lock out after five wrong attempts.
 * Serial, after the parallel suite: saving and resetting a password sign the person out everywhere.
 */
test.describe.configure({ mode: 'serial' })

const HELPER = DEMO_EMAILS.helper
const FIRST_PASSWORD = 'Orbit-cactus-lantern-2026'
const RESET_PASSWORD = 'Harbour-violet-compass-77'

let secret = ''
let backupCodes: string[] = []

test.beforeAll(() => {
  resetDemoAuth([DEMO_EMAILS.owner, HELPER])
})

/** A code for a time step the server has not seen yet (the replay guard refuses a reused step). */
async function freshCode(page: Page, lastUsedStep: { value: number }): Promise<string> {
  let step = Math.floor(Date.now() / 30_000)
  while (step <= lastUsedStep.value) {
    await page.waitForTimeout(1_000)
    step = Math.floor(Date.now() / 30_000)
  }
  lastUsedStep.value = step
  return codeAt(secret, Math.floor(Date.now() / 1000))
}
const lastStep = { value: 0 }

/** A button React has hydrated (a click before hydration submits the bare form). */
async function hydrated(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name, exact: typeof name === 'string' }).first()
  await expect
    .poll(() => button.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__react'))), {
      timeout: 30_000,
    })
    .toBe(true)
  return button
}

async function signedInContext(browser: import('@playwright/test').Browser): Promise<BrowserContext> {
  const context = await browser.newContext()
  const res = await signInByEmail(context.request, HELPER)
  expect(res.status()).toBe(302)
  return context
}

async function passwordStep(page: Page, password: string) {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(HELPER)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await (await hydrated(page, 'Sign in')).click()
}

test('enrol an authenticator, then set a password in Settings › Security', async ({ browser }) => {
  const context = await signedInContext(browser)
  const page = await context.newPage()
  await page.goto('/sign-in/two-factor/setup')
  await (await hydrated(page, 'Start')).click()
  const key = page.getByText(/^([A-Z2-7]{4} ?)+$/).first()
  await expect(key).toBeVisible({ timeout: 15_000 })
  secret = ((await key.textContent()) ?? '').replace(/\s/g, '')
  expect(secret.length).toBeGreaterThanOrEqual(16)

  // The six-digit field submits its form by itself once six digits are in (CodeInput).
  await hydrated(page, 'Turn on two-step verification')
  await page.getByLabel('Six-digit code from your authenticator app').fill(await freshCode(page, lastStep))
  const codes = page.getByRole('list', { name: 'Backup codes' }).getByRole('listitem')
  await expect(codes).toHaveCount(10)
  backupCodes = (await codes.allTextContents()).map((c) => c.trim())
  await (await hydrated(page, 'I have saved these')).click()

  await page.goto('/settings/team#security')
  await (await hydrated(page, /^(Set a password|Change password)$/)).click()
  await page.getByLabel(/^(New password|Password)$/).fill(FIRST_PASSWORD)
  await (await hydrated(page, 'Save password')).click()
  await expect(page.getByText(/saved|Password changed|signed out/i).first()).toBeVisible()
  await context.close()
})

test('password + authenticator code signs in; a password alone never does', async ({ page }) => {
  await passwordStep(page, FIRST_PASSWORD)
  await expect(page).toHaveURL(/\/sign-in\/two-factor/, { timeout: 15_000 })
  // Without the second factor there is no session.
  expect((await page.request.get('/api/health')).status()).toBe(401)
  await hydrated(page, 'Continue')
  await page.getByLabel('Six-digit code from your authenticator app').fill(await freshCode(page, lastStep))
  await expect(page).toHaveURL(/\/(today|welcome)/, { timeout: 30_000 })
})

test('a backup code works once', async ({ browser }) => {
  const code = backupCodes[0] ?? ''
  for (const attempt of ['first', 'second'] as const) {
    const context = await browser.newContext()
    const page = await context.newPage()
    await passwordStep(page, FIRST_PASSWORD)
    await (await hydrated(page, 'Use a backup code')).click()
    await page.getByLabel('Backup code').fill(code)
    await (await hydrated(page, 'Continue')).click()
    if (attempt === 'first') {
      await expect(page).toHaveURL(/\/(today|welcome)/, { timeout: 30_000 })
    } else {
      await expect(page.getByText(TEXT.wrongCode)).toBeVisible()
    }
    await context.close()
  }
})

test('reset from the emailed link ends every other session', async ({ browser, page }) => {
  const other = await signedInContext(browser)
  const otherPage = await other.newPage()
  await otherPage.goto('/today')
  await expect(otherPage).toHaveURL(/\/today/)

  await page.goto('/sign-in/forgot')
  await page.getByLabel('Email').fill(HELPER)
  await (await hydrated(page, 'Send link')).click()
  await expect(page.getByText('If that account exists, a link is on its way.', { exact: false })).toBeVisible()

  let link = ''
  await expect
    .poll(() => {
      const mail = latestSinkMail(HELPER, 'auth_password_reset')
      link = mail?.text.match(/https?:\/\/\S+\/sign-in\/reset\/\S+/)?.[0] ?? ''
      return link
    })
    .not.toBe('')
  await page.goto(new URL(link).pathname)
  const save = await hydrated(page, 'Save and sign in')
  await page.getByLabel('New password').fill(RESET_PASSWORD)
  await page.getByLabel('Authenticator code').fill(await freshCode(page, lastStep))
  await save.click()
  await expect(page).toHaveURL(/\/(today|welcome|sign-in\?reason=password_saved)/, { timeout: 30_000 })

  await otherPage.goto('/enquiries')
  await expect(otherPage).toHaveURL(/\/sign-in/)
  await other.close()
})

test('five wrong passwords lock the account for 15 minutes; the right one is refused meanwhile', async ({
  page,
}) => {
  for (let i = 0; i < 4; i += 1) {
    await passwordStep(page, `wrong-password-${i}-xyz`)
    await expect(page.getByText(TEXT.invalid)).toBeVisible()
  }
  await passwordStep(page, 'wrong-password-5-xyz')
  await expect(page.getByText(TEXT.locked(15))).toBeVisible()
  await passwordStep(page, RESET_PASSWORD)
  await expect(page.getByText(/Too many attempts\. Try again in/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Reset password' })).toBeVisible()
})

test.afterAll(() => {
  if (!process.env.OPS_E2E_KEEP_AUTH) resetDemoAuth([DEMO_EMAILS.owner, HELPER])
})
