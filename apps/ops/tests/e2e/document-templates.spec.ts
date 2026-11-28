import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S11-T05 · board 57. The Owner opens the order acknowledgement's template, adds the Origin column, moves the
 * bank details above the terms, saves a draft and publishes it: the live preview shows the change, the
 * database has version 2 published and version 1 archived, and the draft PDF preview answers. The Helper sees
 * the same page read only. The seeded v1 is restored afterwards.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const RECORD = 'order_acknowledgement' as const
let v1Id = ''

async function restore() {
  await db.documentTemplate.updateMany({
    where: { kind: RECORD, NOT: { id: v1Id } },
    data: { status: 'archived', isActive: false },
  })
  await db.documentVersion.updateMany({
    where: { template: { kind: RECORD, NOT: { id: v1Id } } },
    data: { templateId: v1Id },
  })
  await db.documentTemplate.deleteMany({ where: { kind: RECORD, NOT: { id: v1Id } } })
  await db.documentTemplate.update({
    where: { id: v1Id },
    data: { status: 'published', isActive: true },
  })
}

test.beforeAll(async () => {
  v1Id = (
    await db.documentTemplate.findFirstOrThrow({
      where: { kind: RECORD, name: 'default', version: 1 },
      select: { id: true },
    })
  ).id
  await restore()
})
test.afterAll(restore)

test('board-57 · the nine templates are listed with their number patterns', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/settings/document-templates')
  const list = page.getByRole('list').filter({ hasText: 'Client quotation' })
  await expect(list.getByRole('link')).toHaveCount(9)
  await expect(page.getByRole('link', { name: /Client quotation INDUS\/Q\{n\} · revision -R\{n\}/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Settings › Numbering' })).toBeVisible()
})

test('board-57 · the Owner adds Origin, puts the bank above the terms, saves and publishes', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/settings/document-templates')
  await page.getByRole('link', { name: /Order acknowledgement/ }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Order acknowledgement' })).toBeVisible()
  await expect(page.getByText(/Version 1 · /)).toBeVisible()
  const preview = page.getByRole('complementary', { name: 'Layout preview' })
  await expect(preview.getByText('Origin', { exact: true })).toHaveCount(0)

  // One primary per view: Publish; disabled until there is a saved draft.
  const publish = page.getByRole('button', { name: 'Publish' })
  await expect(publish).toBeDisabled()

  await page.getByRole('checkbox', { name: 'Origin' }).check()
  await expect(preview.getByText('Origin', { exact: true })).toBeVisible()
  // Required blocks are locked on; the keyboard path moves a block.
  await expect(page.getByRole('switch', { name: 'Line table' })).toHaveAttribute('aria-disabled', 'true')
  await page.getByRole('button', { name: 'Move Bank details up' }).click()
  const order = await page.locator('[data-block]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-block'))
  )
  expect(order.indexOf('bank')).toBeLessThan(order.indexOf('terms'))

  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText(/draft version 2 not published/)).toBeVisible()
  await expect(publish).toBeEnabled()
  const pdf = await page.context().request.get('/api/documents/template-preview/oa')
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()['content-type']).toBe('application/pdf')

  await publish.click()
  await expect(page.getByText(/Version 2 · published/)).toBeVisible()
  const rows = await db.documentTemplate.findMany({
    where: { kind: RECORD },
    orderBy: { version: 'asc' },
    select: { version: true, status: true, definition: true },
  })
  expect(rows.map((r) => [r.version, r.status])).toEqual([
    [1, 'archived'],
    [2, 'published'],
  ])
  expect((rows[1]!.definition as { columns: string[] }).columns).toContain('origin')
  await expect(preview.getByText('Origin', { exact: true })).toBeVisible()

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([])
})

test('board-57 · the Helper sees the template read only', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/settings/document-templates/oa')
  await expect(page.getByText('Only the Owner changes document templates.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Publish' })).toHaveCount(0)
  await expect(page.getByRole('checkbox', { name: 'Origin' })).toBeDisabled()
  await expect(page.getByRole('button', { name: /Move .* up/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Preview with an enquiry' })).toBeVisible()
})
