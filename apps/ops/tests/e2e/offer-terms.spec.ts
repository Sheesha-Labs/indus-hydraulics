import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S11-T06 · board 39. The Owner picks the Oil & gas · TPI preset: the P2 card shows its values and a live
 * preview; changing balance_days updates the preview and saves; the payment category's lock switch locks every
 * payment clause; the preset is given to a test client. The Helper reads the library without the buttons.
 * Seeded values and assignments are restored afterwards.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const tag = `e2eterms${Date.now()}`
let companyId = ''
let tpiId = ''
let p2Id = ''
let lockedBefore: { id: string; locked: boolean; version: number }[] = []

test.beforeAll(async () => {
  tpiId = (await db.termsPreset.findUniqueOrThrow({ where: { name: 'Oil & gas · TPI' } })).id
  p2Id = (await db.termsClause.findUniqueOrThrow({ where: { code: 'P2' } })).id
  lockedBefore = await db.termsClause.findMany({
    where: { category: 'payment' },
    select: { id: true, locked: true, version: true },
  })
  companyId = (
    await db.company.create({
      data: {
        name: `Sample Client ${tag}`,
        isClient: true,
        domains: [`${tag}.example.test`],
        clientProfile: { create: {} },
      },
      select: { id: true },
    })
  ).id
})

test.afterAll(async () => {
  await db.termsPresetClause.update({
    where: { presetId_clauseId: { presetId: tpiId, clauseId: p2Id } },
    data: { variableValues: { advance_pct: 30, balance_days: 60 } },
  })
  for (const c of lockedBefore)
    await db.termsClause.update({ where: { id: c.id }, data: { locked: c.locked } })
  await db.clientProfile.update({ where: { companyId }, data: { termsPresetId: null } })
})

test('board-39 · a preset’s values preview live and save; the lock switch; give the preset to a client', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/settings/terms')
  await expect(page.getByRole('heading', { level: 2, name: 'Payment' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Clause categories' }).getByRole('link')).toHaveCount(12)
  // One primary: New clause.
  await expect(page.getByRole('button', { name: 'New clause' })).toBeVisible()

  await page.getByRole('link', { name: /Oil & gas · TPI/ }).click()
  await expect(page).toHaveURL(/preset=/)
  const p2 = page.getByRole('article', { name: /^P2 / })
  await expect(p2.getByText(/30% ADVANCE AGAINST PROFORMA INVOICE; BALANCE 60 DAYS FROM INVOICE/)).toBeVisible()
  const days = p2.getByRole('textbox', { name: 'balance_days' })
  await days.fill('45')
  await expect(p2.getByText(/BALANCE 45 DAYS FROM INVOICE/)).toBeVisible()
  await p2.getByRole('button', { name: 'Save values' }).click()
  await expect(page.getByText('Oil & gas · TPI values saved')).toBeVisible()
  await expect
    .poll(async () =>
      (
        await db.termsPresetClause.findUniqueOrThrow({
          where: { presetId_clauseId: { presetId: tpiId, clauseId: p2Id } },
        })
      ).variableValues
    )
    .toEqual({ advance_pct: 30, balance_days: 45 })

  // The category's lock: every payment clause locked.
  const lock = page.getByRole('switch', { name: 'Lock wording so the Assistant cannot change it' })
  if ((await lock.getAttribute('aria-checked')) === 'true') {
    await lock.click()
    await expect(lock).toHaveAttribute('aria-checked', 'false')
  }
  await lock.click()
  await expect(lock).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(async () => db.termsClause.count({ where: { category: 'payment', locked: false } }))
    .toBe(0)

  // Give the preset to the test client.
  await page.getByRole('button', { name: 'Give to clients' }).click()
  const dialog = page.getByRole('dialog', { name: 'Give Oil & gas · TPI to clients' })
  await dialog.getByRole('searchbox', { name: 'Find a client' }).fill(tag)
  await dialog.getByRole('checkbox', { name: `Sample Client ${tag}` }).check()
  await dialog.getByRole('button', { name: 'Give to 1 client' }).click()
  await expect
    .poll(async () => (await db.clientProfile.findUniqueOrThrow({ where: { companyId } })).termsPresetId)
    .toBe(tpiId)

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([])
})

test('board-39 · New clause refuses an unknown variable and adds a clause', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/settings/terms?category=packing')
  await page.getByRole('button', { name: 'New clause' }).click()
  const dialog = page.getByRole('dialog', { name: 'New clause' })
  await dialog.getByRole('textbox', { name: 'Title' }).fill(`Test ${tag}`)
  await dialog.getByRole('textbox', { name: 'Wording' }).fill('Crates within {weekz} weeks')
  await expect(dialog.getByText('{weekz} is not a variable.')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Add clause' })).toBeDisabled()
  await dialog.getByRole('textbox', { name: 'Wording' }).fill('Crates within {weeks} weeks')
  await dialog.getByRole('textbox', { name: 'Default {weeks}' }).fill('3')
  await dialog.getByRole('button', { name: 'Add clause' }).click()
  await expect.poll(async () => db.termsClause.count({ where: { title: `Test ${tag}` } })).toBe(1)
  const made = await db.termsClause.findFirstOrThrow({ where: { title: `Test ${tag}` } })
  await expect(page.getByRole('article', { name: `${made.code} Test ${tag}` })).toBeVisible()
  expect(made).toMatchObject({ category: 'packing', body: 'Crates within {weeks} weeks', variables: { weeks: 3 } })
  await db.termsClause.delete({ where: { id: made.id } })
})

test('board-39 · the Helper reads the library without the buttons', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/settings/terms')
  await expect(page.getByRole('heading', { level: 2, name: 'Payment' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New clause' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Import from offer' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Edit / })).toHaveCount(0)
})
