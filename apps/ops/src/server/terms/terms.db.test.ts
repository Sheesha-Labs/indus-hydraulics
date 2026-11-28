import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { localDatabaseUrl, memoryStorage } from '../mail-send/testing/fixture'

/**
 * The offer terms library on the local database (S11-T06): a locked clause's wording is refused to the
 * Assistant and allowed to a person (whose edit signs it off); versions are checked; exactly one preset is the
 * default for new clients; preset values are checked against the clause; assigning a preset to a client is
 * tracked on the client; a preset resolves to upper-case printed terms with approval flags; and an imported
 * offer becomes candidates only, each a clause only once a person accepts it.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEventOrThrow: async () => undefined,
  emitEvent: async () => true,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

const TAG = `s11t${Date.now().toString(36)}`

/** A neutral offer PDF with a terms section. */
async function offerPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const lines = [
    'QUOTATION',
    'INDUS/Q10077',
    'Bill To Sample Client LLC',
    '1 Gate valve 2 pcs 100.00',
    'Terms & Conditions',
    'PAYMENT: 40% ADVANCE, BALANCE 45 DAYS FROM INVOICE',
    'DELIVERY: EX-WORKS DUBAI',
    'Authorized Signature',
  ]
  lines.forEach((t, i) => page.drawText(t, { x: 40, y: 800 - i * 20, size: 11, font }))
  return doc.save()
}

describe.skipIf(!DB_URL)('offer terms · local database', () => {
  let clauses: typeof import('./clauses')
  let presets: typeof import('./presets')
  let imp: typeof import('./import')
  let storage: typeof import('../storage/storage')
  const objects = new Map<string, Uint8Array>()
  let ownerId = ''
  const owner = () => ({ kind: 'user' as const, id: ownerId })
  const made: string[] = []
  let companyId = ''
  let defaultBefore = ''

  beforeAll(async () => {
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
    clauses = await import('./clauses')
    presets = await import('./presets')
    imp = await import('./import')
    ownerId = (
      await opsDb.user.findFirstOrThrow({
        where: { role: 'owner', status: 'active' },
        select: { id: true },
      })
    ).id
    defaultBefore = (await presets.defaultPresetId())!
    companyId = (
      await opsDb.company.create({
        data: {
          name: `Sample Client ${TAG}`,
          isClient: true,
          domains: [`${TAG}.example.test`],
          clientProfile: { create: {} },
        },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await opsDb.$transaction((tx) => presets.setDefaultPreset(tx, defaultBefore, owner()))
    await opsDb.clientProfile.update({ where: { companyId }, data: { termsPresetId: null } })
    await opsDb.termsClause.deleteMany({ where: { id: { in: made } } })
    storage.setStorageForTests(null)
    await opsDb.$disconnect()
  })

  it('a locked clause: the Assistant cannot change its wording; a person can, and that signs it off', async () => {
    const started = new Date()
    const c = await opsDb.$transaction((tx) =>
      clauses.createClause(
        tx,
        {
          category: 'payment',
          title: `Test ${TAG}`,
          body: '{days} days from delivery',
          defaults: { days: 30 },
          approvalRule: { kind: 'payment_days_over', days: 60 },
          locked: true,
        },
        owner()
      )
    )
    made.push(c.id)
    expect(c.code).toMatch(/^P\d+$/)
    await expect(
      opsDb.$transaction((tx) =>
        clauses.updateClause(tx, c.id, { body: '{days} days net' }, 0, { kind: 'assistant' })
      )
    ).rejects.toBeInstanceOf(clauses.ClauseLockedError)
    await expect(
      opsDb.$transaction((tx) =>
        clauses.updateClause(tx, c.id, { locked: false }, 0, { kind: 'assistant' })
      )
    ).rejects.toBeInstanceOf(clauses.ClauseLockedError)
    // The Assistant may still change what is not wording (a default), and the version moves.
    await opsDb.$transaction((tx) =>
      clauses.updateClause(tx, c.id, { defaults: { days: 45 } }, 0, { kind: 'assistant' })
    )
    await expect(
      opsDb.$transaction((tx) => clauses.updateClause(tx, c.id, { body: 'x days' }, 0, owner()))
    ).rejects.toThrow(/changed this clause/)
    await opsDb.$transaction((tx) =>
      clauses.updateClause(tx, c.id, { body: '{days} days net from delivery' }, 1, owner())
    )
    expect(await opsDb.termsClause.findUniqueOrThrow({ where: { id: c.id } })).toMatchObject({
      body: '{days} days net from delivery',
      version: 2,
      variables: { days: 45 },
    })
    await expect(
      opsDb.$transaction((tx) =>
        clauses.updateClause(tx, c.id, { body: '{dayz} days' }, 2, owner())
      )
    ).rejects.toThrow(/not a variable/)
    expect(
      await opsDb.activityEvent.count({
        where: {
          subjectType: 'settings',
          subjectId: clauses.clauseSubjectId(c.code),
          at: { gte: started },
        },
      })
    ).toBe(3)
  })

  it('a seeded clause edited by a person is signed off', async () => {
    const seeded = await opsDb.termsClause.create({
      data: {
        category: 'packing',
        code: `KT${Date.now().toString().slice(-6)}`,
        title: 'Test',
        body: 'Standard packing',
        signoffStatus: 'awaiting',
      },
      select: { id: true },
    })
    made.push(seeded.id)
    await opsDb.$transaction((tx) =>
      clauses.updateClause(tx, seeded.id, { body: 'Standard export packing' }, 0, owner())
    )
    expect(await opsDb.termsClause.findUniqueOrThrow({ where: { id: seeded.id } })).toMatchObject({
      signoffStatus: 'signed_off',
      signedOffById: ownerId,
    })
  })

  it('exactly one preset is the default for new clients', async () => {
    const tpi = await opsDb.termsPreset.findUniqueOrThrow({ where: { name: 'Oil & gas · TPI' } })
    await opsDb.$transaction((tx) => presets.setDefaultPreset(tx, tpi.id, owner()))
    const defaults = await opsDb.termsPreset.findMany({
      where: { isDefaultForNewClient: true, archivedAt: null },
      select: { name: true },
    })
    expect(defaults).toEqual([{ name: 'Oil & gas · TPI' }])
    // The database refuses a second default whatever the code does.
    await expect(
      opsDb.termsPreset.update({ where: { id: defaultBefore }, data: { isDefaultForNewClient: true } })
    ).rejects.toThrow(/Unique constraint/)
  })

  it('preset values are checked against the clause; a preset resolves to printed terms', async () => {
    const tpi = await opsDb.termsPreset.findUniqueOrThrow({ where: { name: 'Oil & gas · TPI' } })
    const p2 = await opsDb.termsClause.findUniqueOrThrow({ where: { code: 'P2' } })
    await expect(
      opsDb.$transaction((tx) =>
        presets.setPresetValues(tx, tpi.id, p2.id, { advance_pct: 30, days: 5 }, owner())
      )
    ).rejects.toThrow(/not used by P2/)
    await expect(
      opsDb.$transaction((tx) =>
        presets.setPresetValues(tx, tpi.id, p2.id, { advance_pct: 130, balance_days: 60 }, owner())
      )
    ).rejects.toThrow(/at most 100/)
    const terms = await presets.resolvePresetTerms(tpi.id, { site: 'Example site' })
    expect(terms[0]).toMatchObject({
      code: 'P2',
      text: '30% ADVANCE AGAINST PROFORMA INVOICE; BALANCE 60 DAYS FROM INVOICE',
      needsApproval: false,
    })
    expect(terms.find((t) => t.code === 'D2')?.text).toBe('DAP EXAMPLE SITE')
    const over = await presets.resolvePresetTerms(tpi.id, { site: 'X' }, { P2: { balance_days: 90 } })
    expect(over[0]!.needsApproval).toBe(false)
    const exp = await opsDb.termsPreset.findUniqueOrThrow({ where: { name: 'Export · USD' } })
    const late = await presets.resolvePresetTerms(exp.id, { port: 'Example port' }, { P4: { days: 90 } })
    expect(late.find((t) => t.code === 'P4')).toMatchObject({
      text: '90 DAYS FROM DELIVERY',
      needsApproval: true,
    })
  })

  it('assigning a preset to a client is tracked on the client; a non-client is refused', async () => {
    const tpi = await opsDb.termsPreset.findUniqueOrThrow({ where: { name: 'Oil & gas · TPI' } })
    const out = await opsDb.$transaction((tx) =>
      presets.assignPresetToClients(tx, tpi.id, [companyId], owner())
    )
    expect(out.changed).toBe(1)
    expect(
      (await opsDb.clientProfile.findUniqueOrThrow({ where: { companyId } })).termsPresetId
    ).toBe(tpi.id)
    expect(
      await opsDb.activityEvent.count({
        where: { subjectType: 'company', subjectId: companyId, field: 'client_profile.termsPreset' },
      })
    ).toBe(1)
    await expect(
      opsDb.$transaction((tx) =>
        presets.assignPresetToClients(tx, tpi.id, ['0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5b'], owner())
      )
    ).rejects.toThrow(/Only clients/)
  })

  it('an imported offer becomes candidates only; accepting one makes a clause "From Offer …"', async () => {
    const key = `terms-import/0193a5b2-7c1d-7e3f-8a9b-${Date.now().toString(16).padStart(12, '0').slice(-12)}.pdf`
    objects.set(`ops-uploads/${key}`, await offerPdf())
    const { importId } = await imp.startTermsImport(key, 'offer.pdf', { id: ownerId })
    await import('../assistant/actions/index')
    const { default: def } = await import('../assistant/actions/import-terms')
    const request = {
      actionKey: 'import_terms',
      subjectType: 'settings' as const,
      subjectId: importId,
      trigger: 'person',
      origin: 'live' as const,
      sourceVersion: 1,
    }
    const { input } = await def.gather({ request })
    expect(input).toMatchObject({ offerRef: 'INDUS/Q10077', problem: null })
    expect(input.section).toContain('40% ADVANCE')
    const clausesBefore = await opsDb.termsClause.count()
    // A fake model: the offer's own words, one with a variable, one with an unknown name.
    const fake = {
      call: async () => ({
        ok: true as const,
        value: {
          clauses: [
            {
              category: 'payment',
              title: 'Advance and balance',
              body: '{advance_pct}% advance, balance {balance_days} days from invoice',
            },
            { category: 'delivery', title: 'Ex-works', body: 'Ex-works Dubai {cityy}' },
          ],
        },
        costUsd: '0.001000',
        model: 'claude-sonnet-5-5',
        callIds: [],
      }),
    }
    const proposed = await def.propose(input, fake as never)
    expect(proposed.ok).toBe(true)
    if (!proposed.ok) return
    const verified = await def.verify(proposed.out, input)
    await opsDb.$transaction((tx) =>
      def.effect(tx, verified, {
        actionId: '0193a5b2-7c1d-7e3f-8a9b-000000000001',
        ref: 'A-test',
        request,
        level: 'do_quietly',
      })
    )
    const [view] = (await imp.openImports()).filter((x) => x.id === importId)
    expect(view).toMatchObject({ status: 'ready', offerRef: 'INDUS/Q10077' })
    expect(view!.candidates.map((c) => [c.category, c.body, c.variables])).toEqual([
      ['payment', '{advance_pct}% advance, balance {balance_days} days from invoice', ['advance_pct', 'balance_days']],
      ['delivery', 'Ex-works Dubai cityy', []],
    ])
    expect(await opsDb.termsClause.count()).toBe(clausesBefore)

    const accepted = await opsDb.$transaction((tx) =>
      imp.acceptCandidate(tx, view!.candidates[0]!.id, { defaults: { advance_pct: 40, balance_days: 45 } }, { id: ownerId })
    )
    const clause = await opsDb.termsClause.findUniqueOrThrow({ where: { code: accepted.code } })
    made.push(clause.id)
    expect(clause).toMatchObject({ sourceRef: 'From Offer INDUS/Q10077', locked: false, category: 'payment' })
    await opsDb.$transaction((tx) => imp.skipCandidate(tx, view!.candidates[1]!.id, { id: ownerId }))
    expect((await opsDb.termsImport.findUniqueOrThrow({ where: { id: importId } })).status).toBe('closed')
    await expect(
      opsDb.$transaction((tx) => imp.skipCandidate(tx, view!.candidates[1]!.id, { id: ownerId }))
    ).rejects.toThrow(/already decided/)
  })
})
