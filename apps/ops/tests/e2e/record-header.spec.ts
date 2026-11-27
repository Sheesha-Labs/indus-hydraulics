import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S09-T01 · the enquiry cockpit read on a seeded enquiry: the eleven tabs, the header's one primary from
 * resolveEnquiryHeader (Choose path on a new enquiry, Add question on the Questions tab, none for a Helper on a
 * regretted enquiry, Reopen for the Owner), the chip, and the Assistant strip ("choose a path →", or the count
 * of proposals waiting).
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const tag = `e2erh${Date.now()}`
const created: string[] = []
let ref = ''

test.beforeAll(async () => {
  const company = await db.company.create({ data: { name: `Sample Client LLC ${tag}` } })
  ref = `ENQ-2099-${String(Date.now()).slice(-7)}`
  const e = await db.enquiry.create({
    data: {
      ref,
      title: 'Plant turnaround spares',
      clientId: company.id,
      clientRef: 'SCL/MM/99-0001',
      receivedVia: 'email',
      receivedAt: new Date(),
      deadline: new Date(Date.now() + 30 * 86_400_000),
      lines: {
        create: [
          { no: 1, description: 'Gate valve', qty: 2, status: 'held', heldReason: 'trim' },
          { no: 2, description: 'Bearing', qty: 4 },
        ],
      },
    },
    select: { id: true, lines: { select: { id: true }, orderBy: { no: 'asc' } } },
  })
  created.push(e.id)
  await db.clientQuestion.create({
    data: {
      enquiryId: e.id,
      lineId: e.lines[0]!.id,
      question: 'Which trim?',
      status: 'sent',
      sentAt: new Date(),
    },
  })
})

test.afterAll(async () => {
  if (created.length)
    await db.enquiry.updateMany({
      where: { id: { in: created } },
      data: { closedReason: 'other', closeNote: 'e2e', closedAt: new Date() },
    })
})

test('record-header: tabs, primary, chip and strip follow the record', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${ref}`)
  const header = page.locator('[data-part="record-header"]')
  await expect(
    header.getByRole('heading', { level: 1, name: 'Plant turnaround spares' })
  ).toBeVisible()
  await expect(
    header.getByRole('navigation', { name: 'Enquiry sections' }).getByRole('link')
  ).toHaveCount(11)
  await expect(header.getByRole('link', { name: 'Choose path' })).toHaveAttribute(
    'href',
    `/enquiries/${ref}#qualification`
  )
  await expect(header.getByText('Waiting on client · 1 line')).toBeVisible()
  await expect(header.getByText(/working days left/)).toBeVisible()
  await expect(page.getByRole('link', { name: /choose a path/ })).toBeVisible()
  await expect(page.getByText('created with 2 lines')).toBeVisible()

  await page.goto(`/enquiries/${ref}/questions`)
  await expect(
    page.locator('[data-part="record-header"]').getByRole('link', { name: 'Add question' })
  ).toBeVisible()
  const axe = await new AxeBuilder({ page }).include('[data-part="record-header"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('record-header: an ended enquiry offers Reopen to the Owner and nothing to the Helper', async ({
  page,
  signedInAs,
}) => {
  await db.enquiry.updateMany({ where: { ref }, data: { stage: 'regretted' } as never })
  await signedInAs('owner')
  await page.goto(`/enquiries/${ref}/lines`)
  await expect(
    page.locator('[data-part="record-header"]').getByRole('link', { name: 'Reopen' })
  ).toHaveAttribute('href', `/enquiries/${ref}?reopen=1`)
  await page.context().clearCookies()
  await signedInAs('helper')
  await page.goto(`/enquiries/${ref}/lines`)
  const header = page.locator('[data-part="record-header"]')
  await expect(header.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(header.getByRole('link', { name: 'Reopen' })).toHaveCount(0)
  await expect(header.locator('[data-part="no-primary"]')).toHaveCount(1)
})
