import AxeBuilder from '@axe-core/playwright'
import { opsDb as db, Prisma } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S09-T05 · leads. Board 03: a new lead from the modal, and a CSV import that reports created and skipped rows.
 * Board 22: a spec note edited inline and the stage moved through the menu. Board 23: convert with one category
 * unticked (only the ticked lines carry, the lead closes as Converted); the modal traps Tab and closes on Escape
 * with focus back on "Convert to enquiry".
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2eld${Date.now()}`
let leadRef = ''
const enquiries: string[] = []

test.beforeAll(async () => {
  const company = await db.company.create({
    data: { name: `Sample Client LLC ${tag}`, isClient: true },
  })
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  const hoses = await db.trade.create({ data: { name: `Hoses ${tag}`, slug: `hoses-${tag}` } })
  const valves = await db.trade.create({ data: { name: `Valves ${tag}`, slug: `valves-${tag}` } })
  const id = (await db.$queryRaw<Array<{ id: string }>>`SELECT gen_random_uuid() AS id`)[0]!.id
  const [{ formatted }] = await db.$queryRaw<Array<{ formatted: string }>>`
    SELECT formatted FROM ops.allocate_number('lead', '', 'lead'::ops."RecordType", ${id}::uuid)`
  leadRef = formatted!
  await db.lead.create({
    data: {
      id,
      ref: leadRef,
      name: 'Sample Client LLC',
      companyId: company.id,
      title: `Example hydraulic refit ${tag}`,
      source: 'email',
      stage: 'new',
      ownerId: owner.id,
      clientRef: 'SC-RFQ-0921',
      lines: {
        create: [
          {
            no: 1,
            description: 'Hydraulic hose 1/2" 2SN',
            qty: new Prisma.Decimal(24),
            uom: 'EA',
            tradeId: hoses.id,
            specNotes: 'EN 853 2SN',
          },
          {
            no: 2,
            description: 'Hydraulic hose 3/4" 4SH',
            qty: new Prisma.Decimal(12),
            uom: 'EA',
            tradeId: hoses.id,
          },
          {
            no: 3,
            description: 'Ball valve 1" 3-pc',
            qty: new Prisma.Decimal(8),
            uom: 'EA',
            tradeId: valves.id,
          },
        ],
      },
    },
  })
})

test.afterAll(async () => {
  if (enquiries.length)
    await db.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedAt: new Date() },
    })
})

test('board-03: new lead, and a CSV import with a bad row', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/enquiries/leads')
  await expect(page.locator('[data-built="leads"]')).toBeVisible({ timeout: 90_000 })
  await expect(
    page.getByRole('navigation', { name: 'Stage' }).getByRole('link', { name: /^All/ })
  ).toBeVisible()
  const axe = await new AxeBuilder({ page }).include('[data-built="leads"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await page.getByRole('button', { name: 'New lead' }).click()
  const dialog = page.getByRole('dialog', { name: 'New lead' })
  await dialog.getByLabel('Name').fill(`Ann Sample ${tag}`)
  await dialog.getByLabel('Company').fill('Sample Works')
  await dialog.getByLabel('Requirement').fill('Pump station instrumentation')
  await dialog.getByRole('button', { name: 'Create lead' }).click()
  await page.waitForURL(/\/enquiries\/leads\/L-\d{4,}$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Pump station instrumentation' })
  ).toBeVisible()

  await page.goto('/enquiries/leads')
  await page.getByRole('button', { name: 'Import CSV' }).click()
  const csv = [
    'name,company,email',
    `Bo ${tag},Sample Co,bo@example.test`,
    `Cy ${tag},,not-email`,
  ].join('\n')
  await page
    .getByLabel('CSV file')
    .setInputFiles({ name: 'leads.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  await expect(page.locator('[data-part="csv-preview"]')).toContainText('2 rows')
  await page.getByRole('button', { name: 'Import 2 rows' }).click()
  await expect(page.locator('[data-part="csv-result"]')).toContainText('1 created · 1 skipped')
  await expect(page.locator('[data-part="csv-result"]')).toContainText(
    'Row 3: email is not an address'
  )
  expect(await db.lead.count({ where: { name: `Bo ${tag}`, source: 'import' } })).toBe(1)
})

test('board-22: edit a spec note and move the stage', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/leads/${leadRef}`)
  await expect(page.locator('[data-built="lead-specs"]')).toBeVisible({ timeout: 90_000 })
  await expect(
    page.getByRole('navigation', { name: 'Lead sections' }).getByRole('link')
  ).toHaveCount(4)
  const spec = page.getByLabel('Material or spec, line 2')
  await spec.fill('EN 856 4SH')
  await spec.press('Enter')
  await expect
    .poll(
      async () =>
        (await db.leadLine.findFirstOrThrow({ where: { lead: { ref: leadRef }, no: 2 } })).specNotes
    )
    .toBe('EN 856 4SH')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Stage' }).click()
  await page.getByRole('menuitem', { name: 'Mark contacted' }).click()
  await expect
    .poll(async () => (await db.lead.findUniqueOrThrow({ where: { ref: leadRef } })).stage)
    .toBe('contacted')
  await expect(page.getByText(`${leadRef} marked contacted`)).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.goto(`/enquiries/leads/${leadRef}/activity`)
  await expect(page.locator('[data-built="lead-activity"]')).toContainText('Stage: new → contacted')
})

test('board-23: convert with one category unticked; the modal traps focus and closes on Escape', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/leads/${leadRef}`)
  const convert = page.getByRole('button', { name: 'Convert to enquiry' })
  await convert.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText(`Convert lead ${leadRef}`)
  await expect(dialog).toContainText('Lines to carry · 3 of 3')
  // Tab stays inside the dialog.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page).not.toHaveURL(/convert=1/)
  await expect(convert).toBeFocused()

  await convert.click()
  await dialog.getByRole('checkbox', { name: new RegExp(`Valves ${tag}`) }).uncheck()
  await expect(dialog).toContainText('Lines to carry · 2 of 3')
  await dialog.getByRole('button', { name: 'Create enquiry' }).click()
  await page.waitForURL(/\/enquiries\/ENQ-\d{4}-\d+$/, { timeout: 60_000 })
  const lead = await db.lead.findUniqueOrThrow({
    where: { ref: leadRef },
    select: {
      stage: true,
      convertedEnquiry: {
        select: { id: true, clientRef: true, lines: { select: { description: true } } },
      },
    },
  })
  enquiries.push(lead.convertedEnquiry!.id)
  expect(lead.stage).toBe('converted')
  expect(lead.convertedEnquiry!.clientRef).toBe('SC-RFQ-0921')
  expect(lead.convertedEnquiry!.lines.map((l) => l.description).sort()).toEqual([
    'Hydraulic hose 1/2" 2SN',
    'Hydraulic hose 3/4" 4SH',
  ])
  await page.goto(`/enquiries/leads/${leadRef}`)
  await expect(page.getByRole('link', { name: /^Open ENQ-/ })).toBeVisible()
})
