import AxeBuilder from '@axe-core/playwright'
import { formatIban, withCheckDigits } from '@indus/ops-core'
import { opsDb as db } from '@indus/ops-db'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { expect, test } from '../signed-in'

/**
 * S11-T07 · board 213. The Owner adds a company document with an expiry and sees its status; reads the bank
 * block from a neutral estimate PDF, saves it and confirms it (until then the page says client documents cannot
 * be approved). The Helper reads the page without the buttons. Bank accounts are restored afterwards.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const tag = `e2edocs${Date.now()}`
// Built at run time: no IBAN-shaped literal in the repository.
const IBAN = withCheckDigits('AE', '0330000010000000003')
let before: { id: string; archivedAt: Date | null; isDefaultForCcy: boolean }[] = []

async function pdf(lines: string[]): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  lines.forEach((t, i) => page.drawText(t, { x: 40, y: 800 - i * 20, size: 11, font }))
  return Buffer.from(await doc.save())
}

test.beforeAll(async () => {
  before = await db.ownBankAccount.findMany({
    select: { id: true, archivedAt: true, isDefaultForCcy: true },
  })
  await db.ownBankAccount.updateMany({
    where: { archivedAt: null },
    data: { archivedAt: new Date(), isDefaultForCcy: false },
  })
})

test.afterAll(async () => {
  await db.ownBankAccount.updateMany({
    where: { id: { notIn: before.map((b) => b.id) }, archivedAt: null },
    data: { archivedAt: new Date(), isDefaultForCcy: false },
  })
  for (const b of before)
    await db.ownBankAccount.update({
      where: { id: b.id },
      data: { archivedAt: b.archivedAt, isDefaultForCcy: b.isDefaultForCcy },
    })
  await db.complianceDocument.updateMany({
    where: { companyId: null, title: { contains: tag } },
    data: { archivedAt: new Date() },
  })
})

test('board-213 · add a document with an expiry; read, save and confirm the bank block', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/settings/documents')
  await expect(
    page.getByText('Client documents cannot be approved until the bank block is confirmed', {
      exact: false,
    })
  ).toBeVisible()

  // Add a document expiring in 20 days.
  await page.getByRole('button', { name: 'Add document' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add document' })
  await dialog.getByRole('combobox', { name: 'Kind' }).selectOption('iso_certificate')
  await dialog.getByRole('textbox', { name: 'Title' }).fill(`ISO 9001 ${tag}`)
  await dialog.getByRole('textbox', { name: 'Issued by' }).fill('Example Registrar')
  const soon = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10)
  await dialog.getByLabel('Expires').fill(soon)
  await dialog.getByRole('checkbox', { name: 'Tender packs' }).check()
  await dialog.getByLabel('Document file').setInputFiles({
    name: 'iso.pdf',
    mimeType: 'application/pdf',
    buffer: await pdf(['CERTIFICATE', 'Example Registrar']),
  })
  await dialog.getByRole('button', { name: 'Add document' }).click()
  const row = page.getByRole('row', { name: new RegExp(`ISO 9001 ${tag}`) })
  await expect(row).toBeVisible()
  await expect(row.getByText(/^(19|20) days$/)).toBeVisible()

  // The bank block from a neutral estimate.
  await page.getByLabel('Zoho estimate PDF').setInputFiles({
    name: 'estimate.pdf',
    mimeType: 'application/pdf',
    buffer: await pdf([
      'ESTIMATE',
      'Bank Details',
      'Bank Name: TEST BANK',
      'Account Name: Example Trading LLC',
      `IBAN: ${formatIban(IBAN)}`,
      'SWIFT: TESTAEADXXX',
      'Currency: AED',
      'Terms & Conditions',
    ]),
  })
  const review = page.getByRole('form', { name: 'Review the bank block' })
  await expect(review.getByRole('textbox', { name: 'Bank' })).toHaveValue('TEST BANK')
  await expect(review.getByRole('textbox', { name: 'IBAN' })).toHaveValue(IBAN)
  await review.getByRole('button', { name: 'Save block' }).click()
  await expect(page.getByText('Awaiting confirmation')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm bank block' }).click()
  await expect(page.getByText(/^Confirmed /)).toBeVisible()
  await expect(page.getByText('Client documents cannot be approved', { exact: false })).toHaveCount(
    0
  )
  const acct = await db.ownBankAccount.findFirstOrThrow({
    where: { archivedAt: null, bankName: 'TEST BANK' },
  })
  expect(acct).toMatchObject({
    source: 'zoho_estimate',
    signoffStatus: 'signed_off',
    isDefaultForCcy: true,
  })
  expect(acct.printLines).toContain('Bank Name: TEST BANK')

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual(
    []
  )
})

test('board-213 · the Helper reads the page without the buttons', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/settings/documents')
  await expect(page.getByRole('heading', { name: 'Bank block' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add document' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Confirm bank block' })).toHaveCount(0)
  await expect(page.getByLabel('Zoho estimate PDF')).toHaveCount(0)
})
