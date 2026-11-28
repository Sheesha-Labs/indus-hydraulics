import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { formatIban, withCheckDigits } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { localDatabaseUrl, memoryStorage } from '../mail-send/testing/fixture'

/**
 * Company documents and the bank block on the local database (S11-T07): an Indus document is added, replaced
 * (the old one archived) and shown with its expiry status; the bank block is read from a neutral estimate PDF,
 * saved, confirmed by the Owner only, and from then on the gate allows client documents and the letterhead
 * prints exactly the confirmed lines; an edit of the printed lines takes the confirmation away.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

// Built at run time: no IBAN-shaped literal in the repository.
const IBAN = withCheckDigits('AE', '0330000010000000002')
const UUID = () => crypto.randomUUID()

async function estimatePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const lines = [
    'ESTIMATE',
    'Total AED 1,000.00',
    'Bank Details',
    'Bank Name: TEST BANK',
    'Account Name: Example Trading LLC',
    `IBAN: ${formatIban(IBAN)}`,
    'SWIFT: TESTAEADXXX',
    'Currency: AED',
    'Terms & Conditions',
  ]
  lines.forEach((t, i) => page.drawText(t, { x: 40, y: 800 - i * 20, size: 11, font }))
  return doc.save()
}

describe.skipIf(!DB_URL)('company documents and bank block · local database', () => {
  let docs: typeof import('./documents')
  let bank: typeof import('./bank')
  let assets: typeof import('../documents/assets')
  let storage: typeof import('../storage/storage')
  const objects = new Map<string, Uint8Array>()
  let owner = { id: '', role: 'owner' }
  const made: string[] = []
  const madeAccounts: string[] = []
  let before: { id: string; archivedAt: Date | null }[] = []

  beforeAll(async () => {
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
    docs = await import('./documents')
    bank = await import('./bank')
    assets = await import('../documents/assets')
    owner = {
      id: (
        await opsDb.user.findFirstOrThrow({
          where: { role: 'owner', status: 'active' },
          select: { id: true },
        })
      ).id,
      role: 'owner',
    }
    // Work on a clean slate of bank accounts; put them back afterwards.
    before = await opsDb.ownBankAccount.findMany({ select: { id: true, archivedAt: true } })
    await opsDb.ownBankAccount.updateMany({
      where: { archivedAt: null },
      data: { archivedAt: new Date(), isDefaultForCcy: false },
    })
  })

  afterAll(async () => {
    await opsDb.complianceDocument.updateMany({
      where: { id: { in: made } },
      data: { archivedAt: new Date() },
    })
    await opsDb.ownBankAccount.updateMany({
      where: { id: { in: madeAccounts } },
      data: { archivedAt: new Date(), isDefaultForCcy: false },
    })
    for (const b of before)
      await opsDb.ownBankAccount.update({ where: { id: b.id }, data: { archivedAt: b.archivedAt } })
    storage.setStorageForTests(null)
    await opsDb.$disconnect()
  })

  it('adds an Indus document, replaces it (the old one archived), and shows its status', async () => {
    const key = `company/docs/${UUID()}.pdf`
    objects.set(`ops-uploads/${key}`, await estimatePdf())
    const soon = new Date(Date.now() + 16 * 86_400_000).toISOString().slice(0, 10)
    const a = await docs.saveCompanyDocument(
      {
        kind: 'iso_certificate',
        title: 'ISO 9001:2015',
        number: 'TEST-0001',
        issuer: 'Example Registrar',
        expiresAt: soon,
        usedIn: ['Tender packs'],
        upload: { key, filename: 'iso.pdf' },
      },
      owner
    )
    made.push(a.id)
    let rows = await docs.listCompanyDocuments()
    expect(rows.find((r) => r.id === a.id)).toMatchObject({
      title: 'ISO 9001:2015',
      detail: 'Example Registrar · TEST-0001',
      status: { tone: 'warn', label: '16 days' },
    })
    const later = new Date(Date.now() + 400 * 86_400_000).toISOString().slice(0, 10)
    const b = await docs.saveCompanyDocument(
      {
        kind: 'iso_certificate',
        title: 'ISO 9001:2015',
        number: 'TEST-0002',
        issuer: 'Example Registrar',
        expiresAt: later,
        usedIn: ['Tender packs'],
        upload: null,
        replaces: a.id,
      },
      owner
    )
    made.push(b.id)
    rows = await docs.listCompanyDocuments()
    expect(rows.some((r) => r.id === a.id)).toBe(false)
    expect(rows.find((r) => r.id === b.id)).toMatchObject({
      status: { tone: 'ok', label: 'Valid' },
    })
    const nb = await opsDb.complianceDocument.findUniqueOrThrow({ where: { id: b.id } })
    expect(nb.note).toBe(`Replaces ISO 9001:2015 (${a.id})`)
    expect(nb.fileId).not.toBeNull()
    expect(docs.companyDocStatus(null)).toEqual({ tone: 'ok', label: 'Current' })
    expect(docs.companyDocStatus(new Date('2020-01-01'))).toEqual({ tone: 'bad', label: 'Expired' })
  })

  it('reads, saves and confirms the bank block; the gate and the letterhead follow the confirmation', async () => {
    expect(await bank.bankGateFor('quotation', 'AED')).toMatchObject({ allowed: false })
    expect(await assets.bankLines('AED')).toEqual([])

    const key = `company/estimate/${UUID()}.pdf`
    objects.set(`ops-uploads/${key}`, await estimatePdf())
    await expect(
      bank.parseZohoEstimateBankBlock(
        { key, filename: 'estimate.pdf' },
        { id: owner.id, role: 'helper' }
      )
    ).rejects.toThrow(/Only the Owner/)
    const { fileId, block } = await bank.parseZohoEstimateBankBlock(
      { key, filename: 'estimate.pdf' },
      owner
    )
    expect(block).toMatchObject({
      bankName: 'TEST BANK',
      accountName: 'Example Trading LLC',
      iban: IBAN,
      ibanValid: true,
      swift: 'TESTAEADXXX',
      currency: 'AED',
    })
    const saved = await opsDb.$transaction((tx) =>
      bank.saveOwnBankAccount(
        tx,
        {
          bankName: block.bankName!,
          accountName: block.accountName!,
          currency: 'AED',
          iban: block.iban!,
          swift: block.swift,
          branch: null,
          printLines: block.printLines,
          sourceFileId: fileId,
        },
        owner
      )
    )
    madeAccounts.push(saved.id)
    // Saved but not confirmed: still refused, still nothing printed.
    expect(await bank.bankGateFor('invoice', 'AED')).toMatchObject({ allowed: false })
    expect(await assets.bankLines('AED')).toEqual([])
    await expect(
      opsDb.$transaction((tx) =>
        bank.confirmBankBlock(tx, saved.id, { id: owner.id, role: 'helper' })
      )
    ).rejects.toThrow(/Only the Owner/)
    await opsDb.$transaction((tx) => bank.confirmBankBlock(tx, saved.id, owner))
    expect(await bank.bankGateFor('quotation', 'USD')).toEqual({ allowed: true })
    expect(await bank.bankGateFor('po', 'USD')).toEqual({ allowed: true })
    expect(await assets.bankLines('USD')).toEqual(block.printLines)
    expect((await bank.getCompanyDocumentsStatus()).bankBlockConfirmed).toBe(true)

    // The history never holds the IBAN, only its last four.
    const events = await opsDb.activityEvent.findMany({
      where: { field: 'own_bank_account', after: { path: ['bankName'], equals: 'TEST BANK' } },
      select: { after: true },
    })
    expect(JSON.stringify(events)).not.toContain(IBAN)

    // An edit of the printed lines takes the confirmation away.
    const out = await opsDb.$transaction((tx) =>
      bank.saveOwnBankAccount(
        tx,
        {
          id: saved.id,
          bankName: 'TEST BANK',
          accountName: 'Example Trading LLC',
          currency: 'AED',
          iban: IBAN,
          swift: 'TESTAEADXXX',
          branch: null,
          printLines: [...block.printLines.slice(0, 2), 'Changed line'],
        },
        owner
      )
    )
    expect(out.unconfirmed).toBe(true)
    expect(await bank.bankGateFor('quotation', 'AED')).toMatchObject({ allowed: false })
  })

  it('refuses an IBAN that fails its check digits', () => {
    expect(
      bank.bankAccountSchema.safeParse({
        bankName: 'TEST BANK',
        accountName: 'Example Trading LLC',
        currency: 'AED',
        iban: 'AE00 0000 0000 0000 0000 000',
        swift: null,
        branch: null,
        printLines: ['x'],
      }).success
    ).toBe(false)
  })
})
