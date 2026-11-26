import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { seedBoard05 } from '../../src/server/enquiry/testing/overview-seed'
import { DEMO_EMAILS, expect, test } from '../signed-in'

/**
 * S09-T03 · board-05 Enquiry Overview on the board-shaped seed: line filters in the URL, coverage, the C38
 * snapshot, the facts editor (save, then a stale save that offers Keep theirs / Keep mine), and the Helper
 * without canSeeMargins seeing no cost and no estimate.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2eov${Date.now()}`
let ref = ''
let enquiryId = ''

test.beforeAll(async () => {
  ref = `ENQ-2093-${String(Date.now()).slice(-7)}`
  const s = await seedBoard05(db, { tag, ref, rfqPrefix: `97${String(Date.now()).slice(-2)}` })
  enquiryId = s.enquiryId
})

test.afterAll(async () => {
  await db.enquiry.update({ where: { id: enquiryId }, data: { closedAt: new Date() } })
})

test('board-05: lines, filters, coverage and estimate', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${ref}`)
  const table = page.locator('[data-part="line-table"]')
  await expect(table.locator('[data-line]')).toHaveCount(12)
  await expect(table.locator('[data-line="1"]')).toContainText('Quoted · 2')
  await expect(table.locator('[data-line="1"]')).toContainText('$1,690 · TES')
  await expect(table.locator('[data-line="12"]')).toContainText('Awaiting')
  await table.getByRole('link', { name: 'Awaiting 1' }).click()
  await expect(page).toHaveURL(/\?lines=awaiting/)
  await expect(table.locator('[data-line]')).toHaveCount(1)
  await table.getByRole('link', { name: 'Multi-source 4' }).click()
  await expect(table.locator('[data-line]')).toHaveCount(4)
  await table.getByRole('link', { name: 'All' }).click()
  await expect(table.locator('[data-line]')).toHaveCount(12)
  await expect(page.getByRole('region', { name: 'Coverage' })).toContainText('11 / 12')
  await expect(page.getByRole('region', { name: 'Coverage' })).toContainText(
    'Line 12 awaiting Mock Instruments Co.'
  )
  await expect(page.locator('[data-part="estimate"]')).toContainText('11 priced lines, ex VAT')
  await expect(page.locator('[data-part="estimate"]')).toContainText('%')
  await expect(
    page.getByRole('region', { name: 'Supplier RFQs' }).getByRole('listitem')
  ).toHaveCount(5)
  const axe = await new AxeBuilder({ page }).include('[data-built="enquiry-overview"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-05: facts save, and a stale save offers Keep theirs / Keep mine', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${ref}`)
  await page.getByRole('button', { name: 'Edit facts' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Title').fill('Turnaround spares, phase 1')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Turnaround spares, phase 1' })
  ).toBeVisible()

  // Someone else changes the enquiry while the modal is open.
  await page.getByRole('button', { name: 'Edit facts' }).click()
  await dialog.getByLabel('Client ref').fill('SC/MM/26-0002')
  await db.enquiry.update({
    where: { id: enquiryId },
    data: { title: 'Changed elsewhere', version: { increment: 1 } },
  })
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog.locator('[data-part="facts-conflict"]')).toContainText(
    'while you were editing'
  )
  await dialog.getByRole('button', { name: 'Keep mine' }).click()
  await expect(page.getByText('Facts saved')).toBeVisible()
  await expect
    .poll(async () => (await db.enquiry.findUniqueOrThrow({ where: { id: enquiryId } })).clientRef)
    .toBe('SC/MM/26-0002')
  const ev = await db.activityEvent.findFirst({
    where: { subjectId: enquiryId, field: 'clientRef' },
  })
  expect(ev).not.toBeNull()
})

test('board-05: the Helper without canSeeMargins sees no cost', async ({ page, signedInAs }) => {
  const helper = await db.user.findFirstOrThrow({ where: { email: DEMO_EMAILS.helper } })
  await db.user.update({ where: { id: helper.id }, data: { canSeeMargins: false } })
  try {
    await signedInAs('helper')
    await page.goto(`/enquiries/${ref}`)
    await expect(page.locator('[data-part="estimate"]')).toContainText(
      'Margins hidden for your role.'
    )
    await expect(page.locator('[data-part="line-table"] [data-line="1"]')).toContainText('Hidden')
    await expect(page.locator('body')).not.toContainText('$1,690')
  } finally {
    await db.user.update({
      where: { id: helper.id },
      data: { canSeeMargins: helper.canSeeMargins },
    })
  }
})
