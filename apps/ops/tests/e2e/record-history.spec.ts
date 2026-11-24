import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S06-T06 · board-113 Record history on the demo enquiry ENQ-2026-0001 (the header fixture; the row is
 * created here if missing): the Assistant strip, the table, Money only, a Why? link, Export for the Owner;
 * a Helper sees the margin as Hidden (not in the page source) and is refused the export. Rows are
 * append-only, so each run uses its own field names.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const REF = 'ENQ-2026-0001'
const RUN = Date.now().toString(36)
const MARGIN_AFTER = `9.${RUN.length}${RUN.slice(-2)}%`
const ids: Record<string, string> = {}

test.beforeAll(async () => {
  const e = await db.enquiry.upsert({
    where: { ref: REF },
    create: {
      ref: REF,
      title: 'Plant turnaround spares',
      receivedVia: 'email',
      receivedAt: new Date(Date.now() - 10 * 86_400_000),
    },
    update: {},
    select: { id: true },
  })
  ids.enquiry = e.id
  const owner = await db.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })
  ids.ref = `A-E2E-S06H-${RUN}`
  const a = await db.assistantAction.create({
    data: {
      ref: ids.ref,
      actionKey: 'link_mail',
      levelAtTime: 'do_quietly',
      guardrails: [],
      enquiryId: e.id,
      subjectType: 'enquiry',
      subjectId: e.id,
      headline: `Set line 4 margin (${RUN})`,
      reasons: [{ text: 'After your decision on the judgement card' }],
      state: 'done',
      surface: 'review',
    },
    select: { id: true },
  })
  await db.activityEvent.createMany({
    data: [
      {
        actorKind: 'assistant',
        actionId: a.id,
        enquiryId: e.id,
        subjectType: 'enquiry_line',
        subjectId: e.id,
        kind: 'money',
        field: `line.4.margin_${RUN}`,
        before: '18.0%',
        after: MARGIN_AFTER,
        note: 'After your decision on the judgement card',
        sensitive: true,
      },
      {
        actorKind: 'user',
        actorId: owner.id,
        enquiryId: e.id,
        subjectType: 'enquiry',
        subjectId: e.id,
        kind: 'quantity',
        field: `line.12.quantity_${RUN}`,
        before: 6,
        after: 4,
        note: 'Client email: 4 off, not 6',
      },
    ],
  })
})

test('board-113: history with the strip, filters, Why? and Export (Owner)', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${REF}/activity`)
  const table = page.getByRole('region', { name: 'History of changes' })
  await expect(table).toBeVisible({ timeout: 90_000 })
  await expect(page.locator('[data-part="history-strip"]')).toContainText(
    /made \d+ of the \d+ changes on this enquiry/
  )
  await expect(table.getByText(`Line 4 · margin ${RUN}`)).toBeVisible()
  await expect(table.getByText(MARGIN_AFTER)).toBeVisible()
  await expect(table.getByText('Client email: 4 off, not 6').first()).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Document versions' })).toBeVisible()

  const { violations } = await new AxeBuilder({ page }).include('main').analyze()
  expect(
    violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => v.id)
  ).toEqual([])

  await page.getByRole('link', { name: 'Money only' }).click()
  await expect(page).toHaveURL(/kind=money/)
  await expect(table.getByText(`Line 12 · quantity ${RUN}`)).toHaveCount(0)
  await expect(table.getByText(`Line 4 · margin ${RUN}`)).toBeVisible()

  // The Assistant row's Why? opens the field's evidence over the page.
  const row = table.locator('li', { hasText: `Line 4 · margin ${RUN}` })
  await row.getByRole('link', { name: 'Why?' }).click()
  await expect(page.getByRole('dialog', { name: `Set line 4 margin (${RUN})` })).toBeVisible({
    timeout: 60_000,
  })
  await page.keyboard.press('Escape')

  const exportLink = page.getByRole('link', { name: 'Export history' })
  const href = await exportLink.getAttribute('href')
  expect(href).toBe(`/api/records/enquiry/${REF}/history/export?kind=money`)
  const res = await page.request.get(href!)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/csv')
  expect(await res.text()).toContain(MARGIN_AFTER)
})

test('board-113: a Helper sees margins as Hidden and cannot export', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('helper')
  await page.goto(`/enquiries/${REF}/activity`)
  const table = page.getByRole('region', { name: 'History of changes' })
  await expect(table).toBeVisible({ timeout: 90_000 })
  const row = table.locator('li', { hasText: `Line 4 · margin ${RUN}` })
  await expect(row.getByText('Hidden').first()).toBeVisible()
  expect(await page.content()).not.toContain(MARGIN_AFTER)
  await expect(page.getByRole('link', { name: 'Export history' })).toHaveCount(0)
  const res = await page.request.get(`/api/records/enquiry/${REF}/history/export`)
  expect(res.status()).toBe(403)
})
