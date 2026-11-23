import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * S03-T05 · First-run welcome (board 78) and Setup 1 Company and documents (board 79), as the Owner:
 * fill fictional values, watch the live preview, autosave, upload a logo through the signed-URL flow
 * (the local Storage stand-in when no Supabase is configured), reload and find everything kept, see
 * Today's "Finish setup · 1 of 6", and a stamp whose bytes are not a PNG refused. The test puts the
 * company details back to empty at the end, so the step returns to to-do.
 *
 * Needs the seeded demo users (SEED_DEMO=1 bun run --filter @indus/ops-db db:seed). Serial: it edits the
 * one company profile.
 */

test.describe.configure({ mode: 'serial' })

/** A 1 × 1 transparent PNG. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)
/** JPEG magic bytes under a .png name. */
const NOT_PNG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array.from({ length: 64 }, () => 1)])

const KNOWN_CSP = [
  /^Applying inline style violates the following Content Security Policy directive 'style-src /,
]

function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !KNOWN_CSP.some((re) => re.test(msg.text())))
      errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

async function blocking(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/** Every change shows "saving…" at once; wait until the last one is stored. */
async function saved(page: Page) {
  const label = page.locator('[data-saved-label]')
  await expect(label).toHaveAttribute('data-state', 'saved')
  await expect(label).toContainText(/saved \d+ s ago/)
}

async function fill(page: Page, label: string, value: string) {
  const field = page.getByLabel(label, { exact: true })
  await field.fill(value)
}

test('setup · welcome (78): the six steps, Start setup opens step 1; axe clean', async ({
  page,
  signedInAs,
}) => {
  const errors = watchErrors(page)
  await signedInAs('owner')
  await page.goto('/welcome')
  await expect(page.locator('[data-template="T11"][data-layout="split"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Indus Operations' })).toBeVisible()
  await expect(page.getByText('Welcome, Owner')).toBeVisible()
  for (const promise of [
    'Your mailboxes read for you',
    'Supplier RFQs drafted for you',
    'Quotations ready for your approval',
  ])
    await expect(page.getByText(promise)).toBeVisible()
  await expect(
    page.getByText('The Assistant never sends prices to clients or moves money without you.')
  ).toBeVisible()
  await expect(page.locator('li[data-step]')).toHaveCount(6)
  await expect(page.locator('li[data-step="history"]')).toContainText('2 min to choose')
  expect(await blocking(page)).toEqual([])
  await page.getByRole('button', { name: 'Start setup' }).click()
  await expect(page).toHaveURL(/\/setup\/company$/)
  expect(errors).toEqual([])
})

test('setup · a Helper is sent to Today from welcome and setup', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/welcome')
  await expect(page).toHaveURL(/\/today$/)
  await page.goto('/setup/company')
  await expect(page).toHaveURL(/\/today$/)
})

test('setup · company (79): autosave, preview, logo upload, reload keeps it, Today counts it', async ({
  page,
  signedInAs,
}) => {
  const errors = watchErrors(page)
  await signedInAs('owner')
  await page.goto('/setup/company')
  await expect(page.locator('[data-template="T9"][data-layout="rail"]')).toBeVisible()
  await expect(page.getByRole('link', { name: /Company and documents/ })).toHaveAttribute(
    'aria-current',
    'step'
  )
  await expect(
    page.getByText('Bank details are confirmed in Settings › Bank accounts')
  ).toBeVisible()
  // No bank inputs on Setup 1 (open item 1, S11); the preview says so.
  await expect(page.getByLabel(/IBAN|Account/i)).toHaveCount(0)
  const preview = page.locator('[data-letterhead-preview]')
  await expect(preview).toContainText('Bank details · confirmed later')

  // A TRN that is not 15 digits is shown, not saved.
  await fill(page, 'TRN', '1234')
  await expect(page.getByText('A TRN is 15 digits.')).toBeVisible()

  await fill(page, 'Legal name', 'Example Valve Co')
  await fill(page, 'TRN', '000000000000000')
  await fill(page, 'Address', 'Unit 1, Example Street, Example Area, Dubai')
  await fill(page, 'Phone', '+971 0 000 0000')
  await expect(preview).toContainText('Example Valve Co')
  await expect(preview).toContainText('TRN 000000000000000')
  await expect(preview).toContainText('Example Area, Dubai · +971 0 000 0000')
  await saved(page)

  // Logo: signed upload URL, PUT, confirm (magic bytes), then company.assets.
  await page
    .locator('[data-image-slot="logo"] input[type="file"]')
    .setInputFiles({ name: 'example-logo.png', mimeType: 'image/png', buffer: PNG })
  await expect(page.locator('[data-image-slot="logo"]')).toContainText('example-logo.png')
  await expect(
    page.locator('[data-image-slot="logo"]').getByRole('button', { name: 'Replace' })
  ).toBeVisible()

  // A stamp whose bytes are not a PNG is refused (and deleted from Storage).
  await page
    .locator('[data-image-slot="stamp"] input[type="file"]')
    .setInputFiles({ name: 'not-a-png.png', mimeType: 'image/png', buffer: NOT_PNG })
  await expect(page.locator('[data-image-slot="stamp"]').getByRole('alert')).toContainText(
    'That file is not a PNG image.'
  )

  await page.reload()
  await expect(page.getByLabel('Legal name', { exact: true })).toHaveValue('Example Valve Co')
  await expect(page.getByLabel('Address', { exact: true })).toHaveValue(
    'Unit 1, Example Street, Example Area, Dubai'
  )
  await expect(page.locator('[data-image-slot="logo"]')).toContainText('example-logo.png')
  // The refused file was never recorded.
  await expect(page.locator('[data-image-slot="stamp"]')).not.toContainText('not-a-png.png')
  await expect(page.locator('a[data-step="company"]')).toHaveAttribute('data-status', 'done')
  expect(await blocking(page)).toEqual([])

  // Today: the Owner's banner counts the finished step.
  await page.getByRole('link', { name: 'Save and finish later' }).click()
  await expect(page).toHaveURL(/\/today$/)
  const banner = page.locator('[data-slot="banner"]')
  await expect(banner).toContainText('Finish setup · 1 of 6.')
  await expect(banner).toContainText('Next: Connect mailboxes.')

  // Put the company back as the test found it: empty details, step to do.
  await page.goto('/setup/company')
  for (const label of ['Legal name', 'TRN', 'Address', 'Phone']) await fill(page, label, '')
  await saved(page)
  await page.goto('/today')
  await expect(page.locator('[data-slot="banner"]')).toContainText('Finish setup · 0 of 6.')
  expect(errors).toEqual([])
})
