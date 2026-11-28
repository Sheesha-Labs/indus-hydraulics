import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderFixtures } from '@indus/ops-core/src/document/__fixtures__/kinds'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl, memoryStorage } from '../mail-send/testing/fixture'

/**
 * The documents service on the local database (S11-T04): issuing renders once and stores one immutable object
 * with its SHA-256; the trigger refuses any update or delete of that file; cancel keeps the file; reissue makes
 * a new revision pointing at the old one; a sent tax invoice is never cancelled or reissued; a tampered object
 * is caught on verify; previews are never stored; the mappers are signatures until their sprint.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

const TAG = Date.now().toString(36)
const fx = Object.fromEntries(renderFixtures().map((f) => [f.name, f.data]))

describe.skipIf(!DB_URL)('documents service · local database', () => {
  let issue: typeof import('./issue')
  let reissue: typeof import('./reissue')
  let verify: typeof import('./verify')
  let render: typeof import('./render')
  let mappers: typeof import('./mappers')
  let storage: typeof import('../storage/storage')
  const objects = new Map<string, Uint8Array>()
  let ownerId = ''
  const subjectId = randomUUID()

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 4).toString('base64') })
    process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
    issue = await import('./issue')
    reissue = await import('./reissue')
    verify = await import('./verify')
    render = await import('./render')
    mappers = await import('./mappers')
    ownerId = (
      await opsDb.user.findFirstOrThrow({
        where: { role: 'owner', status: 'active' },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    storage.setStorageForTests(null)
    await opsDb.$disconnect()
  })

  const owner = () => ({ kind: 'user' as const, id: ownerId })
  const oaNumber = `INDUS/OA-${TAG}`

  it('issues an OA: one object at the numbered key with its SHA-256, an approved document and version 1', async () => {
    const out = await issue.issueDocument({
      kind: 'oa',
      data: fx.oa!,
      number: oaNumber,
      subjectType: 'order',
      subjectId,
      currency: 'USD',
      actor: owner(),
      now: new Date('2026-11-28T10:00:00Z'),
    })
    expect(out.key).toMatch(
      new RegExp(`^order_acknowledgement/2026/indus-oa-${TAG}-r1-[0-9a-f]{8}\\.pdf$`)
    )
    expect(out.key).toContain(out.sha256.slice(0, 8))
    const bytes = objects.get(`ops-documents/${out.key}`)!
    expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe('%PDF-')
    const doc = await opsDb.document.findUniqueOrThrow({
      where: { id: out.documentId },
      include: { versions: { include: { file: true } } },
    })
    expect(doc).toMatchObject({
      kind: 'order_acknowledgement',
      status: 'approved',
      number: oaNumber,
      revision: 1,
    })
    expect(doc.versions).toHaveLength(1)
    expect(doc.versions[0]).toMatchObject({ version: 1, sha256: out.sha256 })
    expect(doc.versions[0]!.file).toMatchObject({
      bucket: 'ops-documents',
      path: out.key,
      sha256: out.sha256,
      source: 'generated',
      mimeType: 'application/pdf',
      filename: `INDUS-OA-${TAG}.pdf`,
      pageCount: 1,
    })
    expect(
      await opsDb.activityEvent.count({
        where: { subjectType: 'document', subjectId: out.documentId },
      })
    ).toBe(1)
  })

  it('refuses a second issue of the same number and revision, leaving no orphan object; never overwrites a key', async () => {
    const before = objects.size
    await expect(
      issue.issueDocument({
        kind: 'oa',
        data: fx.oa!,
        number: oaNumber,
        subjectType: 'order',
        subjectId,
        currency: 'USD',
        actor: owner(),
      })
    ).rejects.toThrow(/Unique constraint/)
    expect(objects.size).toBe(before)
    // Storage reporting an object already at the key is an error, never an overwrite.
    const real = memoryStorage(objects)
    storage.setStorageForTests({ ...real, upload: async () => ({ existed: true }) })
    try {
      await expect(
        issue.issueDocument({
          kind: 'oa',
          data: fx.oa!,
          number: `${oaNumber}-X`,
          subjectType: 'order',
          subjectId,
          currency: 'USD',
          actor: owner(),
        })
      ).rejects.toBeInstanceOf(issue.DocumentKeyTaken)
    } finally {
      storage.setStorageForTests(real)
    }
  })

  it('the file of an issued document can be neither updated nor deleted', async () => {
    const doc = await opsDb.document.findFirstOrThrow({
      where: { number: oaNumber, revision: 1 },
      select: { versions: { select: { fileId: true } } },
    })
    const fileId = doc.versions[0]!.fileId!
    await expect(
      opsDb.storedFile.update({ where: { id: fileId }, data: { filename: 'x.pdf' } })
    ).rejects.toThrow(/immutable/)
    await expect(opsDb.storedFile.delete({ where: { id: fileId } })).rejects.toThrow(/immutable/)
  })

  it('reissue: the old one is superseded with its file untouched; the new one is R2 under the same number', async () => {
    const old = await opsDb.document.findFirstOrThrow({
      where: { number: oaNumber, revision: 1 },
      select: {
        id: true,
        versions: { select: { file: { select: { path: true, sha256: true } } } },
      },
    })
    const before = objects.get(`ops-documents/${old.versions[0]!.file!.path}`)!
    const out = await reissue.reissueDocument({
      documentId: old.id,
      reason: 'wrong_address',
      note: 'Delivery address corrected',
      actor: owner(),
    })
    const [prev, next] = await Promise.all([
      opsDb.document.findUniqueOrThrow({ where: { id: old.id } }),
      opsDb.document.findUniqueOrThrow({
        where: { id: out.documentId },
        include: { versions: true },
      }),
    ])
    expect(prev).toMatchObject({ status: 'superseded', reissueReason: 'wrong_address' })
    expect(next).toMatchObject({
      status: 'approved',
      number: oaNumber,
      revision: 2,
      supersedesId: old.id,
    })
    expect((next.versions[0]!.dataSnapshot as { no: string }).no).toBe(`${oaNumber}-R2`)
    expect(out.key).toMatch(/-r2-[0-9a-f]{8}\.pdf$/)
    expect(objects.get(`ops-documents/${old.versions[0]!.file!.path}`)).toBe(before)
    // A superseded document is final.
    await expect(
      reissue.reissueDocument({ documentId: old.id, reason: 'typo', actor: owner() })
    ).rejects.toThrow()
  })

  it('a sent tax invoice is never cancelled or reissued; an approved one is replaced under a new number', async () => {
    const inv = await issue.issueDocument({
      kind: 'invoice',
      data: fx.invoice!,
      number: `INDUS/INV-${TAG}`,
      subjectType: 'order',
      subjectId,
      currency: 'USD',
      actor: owner(),
    })
    await expect(
      reissue.reissueDocument({ documentId: inv.documentId, reason: 'typo', actor: owner() })
    ).rejects.toThrow(/new number/)
    const replaced = await reissue.reissueDocument({
      documentId: inv.documentId,
      reason: 'typo',
      newNumber: `INDUS/INV-${TAG}-2`,
      actor: owner(),
    })
    const next = await opsDb.document.findUniqueOrThrow({ where: { id: replaced.documentId } })
    expect(next).toMatchObject({
      number: `INDUS/INV-${TAG}-2`,
      revision: 1,
      supersedesId: inv.documentId,
    })
    await opsDb.document.update({
      where: { id: replaced.documentId },
      data: { status: 'sent', sentAt: new Date() },
    })
    await expect(reissue.cancelDocument(replaced.documentId, 'wrong', owner())).rejects.toThrow(
      /credit note/
    )
    await expect(
      reissue.reissueDocument({
        documentId: replaced.documentId,
        reason: 'typo',
        newNumber: 'X',
        actor: owner(),
      })
    ).rejects.toThrow(/credit note/)
  })

  it('cancel: approved → cancelled, the file unchanged', async () => {
    const po = await issue.issueDocument({
      kind: 'po',
      data: fx.po!,
      number: `INDUS/PO-${TAG}`,
      subjectType: 'supplier_po',
      subjectId,
      actor: owner(),
    })
    await reissue.cancelDocument(po.documentId, 'Order withdrawn', owner())
    expect(await opsDb.document.findUniqueOrThrow({ where: { id: po.documentId } })).toMatchObject({
      status: 'cancelled',
      cancelledById: ownerId,
    })
    expect((await verify.verifyIssuedFile(po.fileId)).ok).toBe(true)
  })

  it('verifyIssuedFile catches a tampered object', async () => {
    const pi = await issue.issueDocument({
      kind: 'pi',
      data: fx.pi!,
      number: `INDUS/PI-${TAG}`,
      subjectType: 'order',
      subjectId,
      currency: 'USD',
      actor: owner(),
    })
    const ok = await verify.verifyIssuedFile(pi.fileId)
    expect(ok).toMatchObject({ ok: true, sha256: pi.sha256 })
    objects.set(`ops-documents/${pi.key}`, new TextEncoder().encode('%PDF-1.4 replaced'))
    expect(await verify.verifyIssuedFile(pi.fileId)).toMatchObject({
      ok: false,
      reason: 'tampered',
      expected: pi.sha256,
    })
  })

  it('a preview is a PDF that is never stored', async () => {
    const files = await opsDb.storedFile.count()
    const before = objects.size
    const bytes = await render.renderPreviewPdf('quotation', fx['quotation-draft']!)
    expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe('%PDF-')
    expect(await opsDb.storedFile.count()).toBe(files)
    expect(objects.size).toBe(before)
  })

  it('the mappers are signatures until their sprint', async () => {
    await expect(mappers.toClientSafeQuotation(subjectId)).rejects.toThrow(/S17/)
    await expect(mappers.toSupplierSafeRfq(subjectId)).rejects.toThrow(/S12/)
    await expect(mappers.toSupplierSafePo(subjectId)).rejects.toThrow(/S24/)
    await expect(mappers.toClientSafeOrderDoc('oa', subjectId)).rejects.toThrow(/S24/)
  })
})
