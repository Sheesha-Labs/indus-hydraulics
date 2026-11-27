import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl, memoryStorage } from '../mail-send/testing/fixture'

/**
 * New-supplier onboarding on the local database (S10-T04): the draft is not selectable; the document request
 * stores only the token's SHA-256, expires, reminds every 4 days through the clock, and can be revoked; the /u page
 * shows states, never errors; uploads are checked by magic bytes and size; every link and address is rate-limited.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))
const requested: Array<{ actionKey: string; sourceVersion: string | number }> = []
vi.mock('../assistant/request', () => ({
  requestAction: async (r: { actionKey: string; sourceVersion: string | number }) => {
    requested.push(r)
    return 'id'
  },
  requestActionQuietly: async (r: { actionKey: string; sourceVersion: string | number }) => {
    requested.push(r)
    return true
  },
}))

const TAG = `onb${Date.now().toString(36)}`
const PDF = new TextEncoder().encode(
  '%PDF-1.7\n%âãÏÓ\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n'
)
const NOT_PDF = new TextEncoder().encode('MZ this is not a pdf at all, it is an executable header')

describe.skipIf(!DB_URL)('supplier onboarding · local database', () => {
  let onboarding: typeof import('./onboarding')
  let req: typeof import('./document-request')
  let storage: typeof import('../storage/storage')
  let ownerId = ''
  let supplierId = ''
  const objects = new Map<string, Uint8Array>()

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 9).toString('base64') })
    process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
    onboarding = await import('./onboarding')
    req = await import('./document-request')
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
    ownerId = (
      await opsDb.user.findFirstOrThrow({
        where: { role: 'owner', status: 'active' },
        select: { id: true },
      })
    ).id
    supplierId = (
      await opsDb.$transaction((tx) =>
        onboarding.createSupplierDraft(
          tx,
          { legalName: `Example Hidrolik ${TAG}`, country: 'TR', type: 'manufacturer' },
          { id: ownerId }
        )
      )
    ).id
    await opsDb.$transaction((tx) =>
      onboarding.upsertSupplierContact(
        tx,
        supplierId,
        { role: 'Sales', name: 'Pat Example', email: `sales.${TAG}@example.test` },
        { id: ownerId }
      )
    )
  })

  afterAll(async () => {
    storage.setStorageForTests(null)
    await opsDb.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
    await opsDb.$disconnect()
  })

  it('a draft supplier is not selectable', async () => {
    const p = await opsDb.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } })
    expect(p.onboardingStatus).toBe('draft')
    expect(onboarding.isSelectableSupplier(p)).toBe(false)
    expect(
      await opsDb.company.count({
        where: { id: supplierId, ...onboarding.SELECTABLE_SUPPLIER_WHERE },
      })
    ).toBe(0)
    await expect(onboarding.assertSelectableSupplier(supplierId)).rejects.toThrow(/being set up/)
    const docs = await onboarding.supplierRequiredDocuments(supplierId)
    expect(docs.rows).toHaveLength(9)
    expect(docs.of).toBe(8)
  })

  it('stores only the token hash, opens for 14 days and asks the Assistant to draft the email', async () => {
    const { requestId } = await req.createDocumentRequest(
      { supplierId, kinds: ['trade_licence', 'iso_certificate'] },
      { id: ownerId }
    )
    const row = await opsDb.supplierDocumentRequest.findUniqueOrThrow({ where: { id: requestId } })
    const token = req.tokenFor(requestId)
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(row.tokenHash).toBe(req.tokenHashOf(token))
    expect(JSON.stringify(row)).not.toContain(token)
    const days = (row.expiresAt.getTime() - row.createdAt.getTime()) / 86_400_000
    expect(Math.round(days)).toBe(14)
    expect(Math.round((row.nextReminderAt!.getTime() - row.createdAt.getTime()) / 86_400_000)).toBe(
      4
    )
    expect(requested.at(-1)).toMatchObject({
      actionKey: 'request_supplier_documents',
      sourceVersion: requestId,
    })
    expect(req.uploadLinkFor(requestId)).toMatch(new RegExp(`/u/${token}$`))
  })

  it('the /u page shows the requested kinds; uploads are checked; completion closes the link', async () => {
    const r = await opsDb.supplierDocumentRequest.findFirstOrThrow({
      where: { supplierId, status: 'open' },
    })
    const token = req.tokenFor(r.id)
    const view = await req.portalView(token, '198.51.100.7')
    expect(view.state).toBe('open')
    expect(view.kinds!.map((k) => k.kind)).toEqual(['trade_licence', 'iso_certificate'])
    expect(view.supplier).toContain('Example Hidrolik')

    // A file whose bytes are not a PDF is refused and removed.
    const bad = await req.portalUploadSlot(
      token,
      'trade_licence',
      { name: 'licence.pdf', size: NOT_PDF.length },
      '198.51.100.7'
    )
    objects.set(`ops-uploads/${bad.key}`, NOT_PDF)
    await expect(
      req.portalConfirmUpload(
        token,
        { kind: 'trade_licence', key: bad.key, filename: 'licence.pdf' },
        { ip: '198.51.100.7', userAgent: 'Mozilla' }
      )
    ).rejects.toThrow(/not the PDF or image/)
    expect(objects.has(`ops-uploads/${bad.key}`)).toBe(false)
    // Over 20 MB is refused before a URL is issued; a kind not asked for is refused.
    await expect(
      req.portalUploadSlot(
        token,
        'trade_licence',
        { name: 'big.pdf', size: 21 * 1024 * 1024 },
        '198.51.100.7'
      )
    ).rejects.toThrow(/over 20 MB/)
    await expect(
      req.portalUploadSlot(token, 'nda', { name: 'nda.pdf', size: 10 }, '198.51.100.7')
    ).rejects.toThrow(/not asked for/)

    for (const kind of ['trade_licence', 'iso_certificate']) {
      const slot = await req.portalUploadSlot(
        token,
        kind,
        { name: `${kind}.pdf`, size: PDF.length },
        '198.51.100.7'
      )
      expect(slot.key).toMatch(
        new RegExp(`^supplier/${supplierId}/request/${r.id}/[0-9a-f-]{36}\\.pdf$`)
      )
      objects.set(`ops-uploads/${slot.key}`, PDF)
      await req.portalConfirmUpload(
        token,
        {
          kind,
          key: slot.key,
          filename: `${kind}.pdf`,
          expiresAt: kind === 'iso_certificate' ? '2028-03-14' : null,
        },
        { ip: '198.51.100.7', userAgent: 'Mozilla/5.0 (iPhone)' }
      )
    }
    const done = await opsDb.supplierDocumentRequest.findUniqueOrThrow({ where: { id: r.id } })
    expect(done.status).toBe('completed')
    const iso = await opsDb.complianceDocument.findFirstOrThrow({
      where: { companyId: supplierId, kind: 'iso_certificate' },
    })
    expect(iso.status).toBe('received')
    expect(iso.expiresAt?.toISOString().slice(0, 10)).toBe('2028-03-14')
    const up = await opsDb.supplierDocumentUpload.findFirstOrThrow({ where: { requestId: r.id } })
    expect(up.ipHash).not.toContain('198.51')
    expect(up.userAgentClass).toBe('mobile')
    expect((await req.portalView(token, '198.51.100.7')).state).toBe('completed')
  })

  it('expired and revoked links are states; an unknown token is invalid', async () => {
    const { requestId } = await req.createDocumentRequest(
      { supplierId, kinds: ['nda'] },
      { id: ownerId }
    )
    const token = req.tokenFor(requestId)
    await opsDb.supplierDocumentRequest.update({
      where: { id: requestId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    })
    expect((await req.portalView(token, '198.51.100.8')).state).toBe('expired')
    await opsDb.$transaction((tx) => req.revokeRequest(tx, requestId, { id: ownerId }))
    expect((await req.portalView(token, '198.51.100.8')).state).toBe('revoked')
    expect((await req.portalView('A'.repeat(43), '198.51.100.8')).state).toBe('invalid')
  })

  it('the clock reminds every 4 days and expires the link', async () => {
    await import('../clocks/supplier-documents')
    const { runClock } = await import('../clocks/registry')
    const { requestId } = await req.createDocumentRequest(
      { supplierId, kinds: ['ownership_declaration'] },
      { id: ownerId }
    )
    await opsDb.supplierDocumentRequest.update({
      where: { id: requestId },
      data: { nextReminderAt: new Date(Date.now() - 1000) },
    })
    requested.length = 0
    await runClock('supplier_docs.reminder')
    expect(requested.find((x) => x.actionKey === 'remind_supplier_documents')?.sourceVersion).toBe(
      `request:${requestId}:1`
    )
    const moved = await opsDb.supplierDocumentRequest.findUniqueOrThrow({
      where: { id: requestId },
    })
    expect(moved.nextReminderAt!.getTime()).toBeGreaterThan(Date.now() + 3.9 * 86_400_000)
    await opsDb.supplierDocumentRequest.update({
      where: { id: requestId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    })
    await runClock('supplier_docs.expiry')
    expect(
      (await opsDb.supplierDocumentRequest.findUniqueOrThrow({ where: { id: requestId } })).status
    ).toBe('expired')
  })

  it('rate-limits a link and an address', async () => {
    const { requestId } = await req.createDocumentRequest(
      { supplierId, kinds: ['nda'] },
      { id: ownerId }
    )
    const token = req.tokenFor(requestId)
    let last = ''
    for (let i = 0; i < 32; i++) last = (await req.portalView(token, '203.0.113.9')).state
    expect(last).toBe('rate_limited')
  })
})
