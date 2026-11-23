import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { DEMO_EMAILS, signInByEmail } from '../signed-in'

/**
 * Board 84 Team and 84b (S03-T03), against the seeded Owner and Helper. Nothing here changes the team:
 * the dialogs are opened and cancelled (inviting, removing or transferring would change who every
 * parallel spec signs in as). The write paths are covered against a real database in
 * src/server/access/team.db.test.ts and the Helper refusal of every Owner-only action in
 * src/lib/owner-only-actions.test.ts.
 */
async function signedInPage(browser: Browser, who: 'owner' | 'helper') {
  const context = await browser.newContext()
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

async function axeClean(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .include('#content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
  expect(serious, JSON.stringify(serious.map((v) => [v.id, v.nodes[0]?.target]))).toEqual([])
}

test('the Owner sees the team, the role table from the capability map, and #profile', async ({
  browser,
}) => {
  const a = await signedInPage(browser, 'owner')
  await a.page.goto('/settings/team')
  await expect(a.page.getByRole('heading', { name: 'Team, profile and devices' })).toBeVisible()
  const team = a.page.locator('#team')
  await expect(
    team.getByRole('heading', { name: /^Team · \d+ (person|people) and the Assistant$/ })
  ).toBeVisible()
  await expect(team.locator('[data-member="owner"]')).toHaveCount(1)
  await expect(
    team.locator('[data-member="owner"]').getByText('Owner', { exact: true })
  ).toBeVisible()
  await expect(team.getByText('Invites must be @', { exact: false }).first()).toBeVisible()
  // The one primary; with the seeded Helper active, one helper at a time.
  await expect(team.getByRole('button', { name: 'Invite a helper' })).toBeVisible()

  const roles = a.page.getByRole('region', { name: 'What each role can do' })
  await expect(roles.locator('tbody tr')).toHaveCount(7)
  for (const [row, helper] of [
    ['See enquiries, supplier quotes and costs', 'Yes'],
    ['Send client quotations', 'Never'],
    ['Approve supplier payments', 'Never'],
    ['Change Autopilot and settings', 'No · read only'],
  ] as const) {
    const tr = roles.locator('tr', { has: a.page.getByRole('rowheader', { name: row }) })
    await expect(tr.locator('td').nth(0)).toHaveText('Yes')
    await expect(tr.locator('td').nth(1)).toHaveText(helper)
  }
  await expect(
    roles.getByRole('rowheader', { name: /^Approve below the \d+(\.\d+)?% floor$/ })
  ).toBeVisible()

  const profile = a.page.locator('#profile')
  await expect(profile.getByText(/^Profile · /)).toBeVisible()
  await expect(profile.getByRole('link', { name: 'Preferences ↗' })).toHaveAttribute(
    'href',
    '/settings/notifications'
  )
  // No phone hand-off (84b, out of scope).
  await expect(a.page.getByText('Add a phone')).toHaveCount(0)
  await axeClean(a.page)
  await a.context.close()
})

test('Permissions opens the three toggles; Transfer ownership confirms after a recent sign-in', async ({
  browser,
}) => {
  const a = await signedInPage(browser, 'owner')
  await a.page.goto('/settings/team')
  const permissions = await hydrated(a.page, /^Permissions for /)
  await permissions.click()
  const dialog = a.page.getByRole('dialog')
  await expect(dialog.getByRole('switch')).toHaveCount(3)
  await expect(dialog.getByText('Edit chaser rules')).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()

  // Signed in a moment ago: inside the 10-minute window, so the confirm opens here.
  const transfer = await hydrated(a.page, 'Transfer ownership')
  await transfer.click()
  await expect(a.page).toHaveURL(/transfer=1/)
  const confirm = a.page.getByRole('alertdialog')
  await expect(confirm.getByText(/^Make .+ the Owner\?$/)).toBeVisible()
  await expect(confirm.getByText(/Both of you are signed out now/)).toBeVisible()
  await confirm.getByRole('button', { name: 'Cancel' }).click()
  await expect(confirm).toBeHidden()
  await a.context.close()
})

test('the Helper sees the page read-only and the setup banner', async ({ browser }) => {
  const a = await signedInPage(browser, 'helper')
  await a.page.goto('/settings/team')
  await expect(a.page.locator('#team [data-member="helper"]').first()).toBeVisible()
  for (const name of [
    'Invite a helper',
    'Transfer ownership',
    /^Permissions/,
    /^Remove/,
    /^Resend/,
  ]) {
    await expect(a.page.locator('#team').getByRole('button', { name })).toHaveCount(0)
  }
  const roles = a.page.getByRole('region', { name: 'What each role can do' })
  for (const toggle of await roles.getByRole('switch').all()) await expect(toggle).toBeDisabled()
  // 84b: setup is not finished in the e2e database, so the Helper is told who is setting up.
  await expect(a.page.getByText(/^Setup in progress by .+ · \d of 6\.$/)).toBeVisible()
  await axeClean(a.page)
  await a.context.close()
})

test('an invitation link that does not exist is a plain state with a way to sign in', async ({
  page,
}) => {
  await page.goto('/sign-in/invite/abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG')
  await expect(page.getByRole('heading', { name: 'Join Indus Operations' })).toBeVisible()
  await expect(
    page.getByText('This invitation link does not work.', { exact: false })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to sign-in' })).toHaveAttribute(
    'href',
    '/sign-in'
  )
})
