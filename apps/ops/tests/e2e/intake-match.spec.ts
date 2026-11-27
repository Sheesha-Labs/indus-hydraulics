import AxeBuilder from '@axe-core/playwright'
import { opsDb as db, Prisma } from '@indus/ops-db'
import { DEMO_EMAILS, expect, test } from '../signed-in'

/**
 * S09-T04 · board-16 Match to client and lead. An upload from an unknown sender: the client is created inline and
 * the lines become a new lead (L-…). A formal RFQ for a known client: "Go straight to an enquiry" is chosen, with
 * its evidence, and creates the enquiry. A second apply returns the first result.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2emt${Date.now()}`
const batches: string[] = []

async function batch(over: Partial<Prisma.IntakeBatchUncheckedCreateInput> = {}) {
  const owner = await db.user.findFirstOrThrow({
    where: { email: DEMO_EMAILS.owner },
    select: { id: true },
  })
  const b = await db.intakeBatch.create({
    data: { source: 'upload', createdById: owner.id, ...over },
    select: { id: true },
  })
  batches.push(b.id)
  for (const ord of [1, 2])
    await db.intakeLineCandidate.create({
      data: {
        batchId: b.id,
        ord,
        description: `Hydraulic hose ${ord}/2" 2SN`,
        qty: new Prisma.Decimal(ord * 12),
        uom: 'EA',
        partNo: `HH-${tag}-${ord}`,
        confidence: 'sure',
        decision: 'accepted',
      },
    })
  return b.id
}

test.afterAll(async () => {
  await db.enquiry.updateMany({
    where: { intakeBatches: { some: { id: { in: batches } } } },
    data: { closedAt: new Date() },
  })
})

test('board-16: unknown sender → create client inline → create lead', async ({
  page,
  signedInAs,
}) => {
  const id = await batch({ clientRef: `SR-${tag}` })
  await signedInAs('owner')
  await page.goto(`/enquiries/intake/${id}/match`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Where should these 2 lines go?' })
  ).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.locator('[data-built="intake-match"][data-ready]')).toBeVisible()
  await expect(page.locator('[data-part="client-none"]')).toContainText('No client matched')
  // The client reference stands as RFQ evidence: the enquiry option is suggested.
  await expect(page.getByRole('radio', { name: /Go straight to an enquiry/ })).toBeChecked()
  await expect(
    page.getByText(`The document carries the client's RFQ reference SR-${tag}`)
  ).toBeVisible()
  const axe = await new AxeBuilder({ page }).include('[aria-labelledby="match-title"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await page.getByRole('button', { name: 'Choose or create client' }).click()
  await page.getByLabel('Create client').fill(`Sample Client LLC ${tag}`)
  await page.getByRole('button', { name: 'Create client', exact: true }).click()
  await expect(page.getByText(`Sample Client LLC ${tag}`)).toBeVisible()
  await page.getByRole('radio', { name: /Create a new lead/ }).check()
  await page.getByRole('button', { name: 'Create lead' }).click()
  await page.waitForURL(/\/enquiries\/leads\/L-\d{4,}/, { timeout: 60_000 })
  const b = await db.intakeBatch.findUniqueOrThrow({
    where: { id },
    select: { status: true, leadId: true },
  })
  expect(b.status).toBe('confirmed')
  const lead = await db.lead.findUniqueOrThrow({
    where: { id: b.leadId! },
    include: { lines: true, company: true },
  })
  expect(lead.company?.name).toBe(`Sample Client LLC ${tag}`)
  expect(lead.lines).toHaveLength(2)

  // The step, opened again, goes where it went.
  await page.goto(`/enquiries/intake/${id}/match`)
  await page.waitForURL(`**/enquiries/leads/${lead.ref}`)
})

test('board-16: a formal RFQ for a known client goes straight to an enquiry', async ({
  page,
  signedInAs,
}) => {
  const company = await db.company.create({
    data: { name: `Example Client ${tag}`, isClient: true },
  })
  const id = await batch({
    clientCompanyId: company.id,
    deadline: new Date(Date.now() + 10 * 86_400_000),
    terms: { closingDate: { text: 'x', quote: 'Closing date', page: 1 } },
  })
  await signedInAs('owner')
  await page.goto(`/enquiries/intake/${id}/match`)
  await expect(page.locator('[data-built="intake-match"][data-ready]')).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByText(`Example Client ${tag}`)).toBeVisible()
  await expect(page.getByRole('radio', { name: /Go straight to an enquiry/ })).toBeChecked()
  await expect(
    page.getByText(/formal RFQ with a deadline \(\d+ \w+ found on page 1\)/)
  ).toBeVisible()
  await page.getByRole('button', { name: 'Create enquiry' }).click()
  await page.waitForURL(/\/enquiries\/ENQ-\d{4}-\d+$/, { timeout: 60_000 })
  const e = await db.enquiry.findFirstOrThrow({ where: { intakeBatches: { some: { id } } } })
  expect(e.clientId).toBe(company.id)
})
