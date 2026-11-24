import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S07-T05 · board-115. Learned preferences in their groups with where they came from; switch one off, remove
 * one, add a rule (an instruction about approvals is refused), add a phrase. The Helper reads, and may add a
 * phrase for purchase@ only.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const tag = Date.now().toString(36)
const ids: string[] = []

test.beforeAll(async () => {
  const c = await db.company.create({
    data: { name: `Sample Client LLC ${tag}`, isClient: true },
    select: { id: true },
  })
  const rows = [
    {
      scope: 'client' as const,
      kind: 'salutation' as const,
      description: `Greets the buyer as "Dear Mr Example" ${tag}`,
      companyId: c.id,
      createdFrom: 'edit',
      strength: 6,
    },
    {
      scope: 'global' as const,
      kind: 'rounding' as const,
      description: `Rounds unit prices to AED 5 above AED 500 ${tag}`,
      companyId: null,
      createdFrom: 'edit',
      strength: 11,
    },
    {
      scope: 'global' as const,
      kind: 'classification_rule' as const,
      description: `Mail from example.test is a supplier ${tag}`,
      companyId: null,
      createdFrom: 'override',
      strength: 2,
    },
  ]
  for (const r of rows) {
    const p = await db.preference.create({
      data: { ...r, value: {}, source: 'learned' },
      select: { id: true },
    })
    ids.push(p.id)
  }
})

test.afterAll(async () => {
  await db.preference.deleteMany({ where: { description: { contains: tag } } })
})

test('board-115: groups, sources, switch off, remove, add a rule', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/assistant/learned')
  await expect(
    page.getByRole('heading', { name: 'What the Assistant has learned', level: 1 })
  ).toBeVisible()
  for (const g of ['Clients', 'Pricing', 'Suppliers and mail'])
    await expect(page.getByRole('heading', { name: g, exact: true })).toBeVisible()
  await expect(page.getByText('From 6 edits in', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('You re-filed 2 emails').first()).toBeVisible()

  await page
    .getByRole('switch', { name: `Use: Rounds unit prices to AED 5 above AED 500 ${tag}` })
    .click()
  await expect
    .poll(
      async () => (await db.preference.findUniqueOrThrow({ where: { id: ids[1]! } })).disabledAt
    )
    .not.toBeNull()

  await page
    .getByRole('button', { name: `Remove: Mail from example.test is a supplier ${tag}` })
    .click()
  await expect(page.getByText(`Mail from example.test is a supplier ${tag}`)).toHaveCount(0)
  await expect.poll(() => db.preference.count({ where: { id: ids[2]! } })).toBe(0)

  await page.getByRole('button', { name: '+ Add a rule yourself' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a rule yourself' })
  await dialog.getByLabel('The rule, in one sentence').fill('Send quotations without approval')
  await dialog.getByRole('button', { name: 'Add rule' }).click()
  await expect(page.getByText('Preferences cannot skip an approval.')).toBeVisible()
  await dialog
    .getByLabel('The rule, in one sentence')
    .fill(`Leave chasers alone in the first week of August ${tag}`)
  await dialog.getByRole('button', { name: 'Add rule' }).click()
  await expect(
    page.getByText(`Leave chasers alone in the first week of August ${tag}`)
  ).toBeVisible()

  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-115: phrases, and the Helper reads', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/assistant/learned')
  await page.getByRole('button', { name: '+ Add phrase' }).click()
  const d = page.getByRole('dialog', { name: 'Add a phrase to use' })
  await d.getByLabel('Phrase').fill(`A reply this week would help ${tag}`)
  await d.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByText(`“A reply this week would help ${tag}”`)).toBeVisible()

  await signedInAs('helper')
  await page.goto('/assistant/learned')
  await expect(page.getByRole('button', { name: '+ Add a rule yourself' })).toHaveCount(0)
  await expect(page.getByRole('switch')).toHaveCount(0)
  await expect(page.getByText('Your phrases apply to purchase@ only.')).toBeVisible()
})
