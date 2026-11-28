import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { defaultTemplate, type TemplateDefinition } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl, memoryStorage } from '../mail-send/testing/fixture'

/**
 * Document templates on the local database (S11-T05): saving a draft checks its stamp and the kind's rules
 * (a crafted "cost" column is refused); publishing makes version n + 1 the published row, archives the
 * previous one and purges the kind's cache tag; only the Owner can publish; the next issued document uses
 * the new template and records it; a file issued before keeps its bytes.
 */
const DB_URL = localDatabaseUrl()
const purged: string[] = []
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: (tag: string) => purged.push(tag),
}))

const KIND = 'cn' as const
const RECORD = 'credit_note' as const

describe.skipIf(!DB_URL)('document templates · local database', () => {
  let t: typeof import('./templates')
  let issue: typeof import('./issue')
  let storage: typeof import('../storage/storage')
  const objects = new Map<string, Uint8Array>()
  let owner = { id: '', role: 'owner' }
  let fx: Record<string, import('@indus/ops-core').DocumentData>
  let v1Id = ''

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 5).toString('base64') })
    process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
    t = await import('./templates')
    issue = await import('./issue')
    const { renderFixtures } = await import('@indus/ops-core/src/document/__fixtures__/kinds')
    fx = Object.fromEntries(renderFixtures().map((f) => [f.name, f.data]))
    owner = {
      id: (
        await opsDb.user.findFirstOrThrow({
          where: { role: 'owner', status: 'active' },
          select: { id: true },
        })
      ).id,
      role: 'owner',
    }
    // Start from the seeded v1 only.
    const v1 = await opsDb.documentTemplate.findFirstOrThrow({
      where: { kind: RECORD, name: 'default', version: 1 },
      select: { id: true },
    })
    v1Id = v1.id
    await restore()
  })

  /** Back to the seed: v1 published, nothing else. */
  async function restore() {
    await opsDb.documentTemplate.updateMany({
      where: { kind: RECORD, NOT: { id: v1Id } },
      data: { status: 'archived', isActive: false },
    })
    await opsDb.documentVersion.updateMany({
      where: { template: { kind: RECORD, NOT: { id: v1Id } } },
      data: { templateId: v1Id },
    })
    await opsDb.documentTemplate.deleteMany({ where: { kind: RECORD, NOT: { id: v1Id } } })
    await opsDb.documentTemplate.update({
      where: { id: v1Id },
      data: { status: 'published', isActive: true, publishedAt: new Date('2026-11-28T00:00:00Z') },
    })
  }

  afterAll(async () => {
    await restore()
    storage.setStorageForTests(null)
    await opsDb.$disconnect()
  })

  const off = (d: TemplateDefinition, key: string): TemplateDefinition => ({
    ...d,
    blocks: d.blocks.map((b) => (b.key === key ? { ...b, on: false } : b)),
  })

  it('the editor shows the seeded v1, no draft, nobody using it yet', async () => {
    const e = await t.getTemplateEditor(KIND)
    expect(e.published).toMatchObject({ version: 1, signoffStatus: 'awaiting' })
    expect(e.published.definition).toEqual(defaultTemplate(KIND))
    expect(e.draft).toBeNull()
    expect(e.stamp).toBe('none')
    expect(e.usedOnOpen).toBe(0)
  })

  it('a crafted request with a cost column or an unknown key is refused before anything is written', async () => {
    const base = defaultTemplate(KIND)
    for (const bad of [
      { ...base, columns: [...base.columns, 'cost'] },
      { ...base, columns: [...base.columns, 'supplier'] },
      { ...base, margin: 12 },
    ])
      await expect(
        opsDb.$transaction((tx) => t.saveTemplateDraft(tx, KIND, bad, 'none'))
      ).rejects.toThrow(/not valid|not a column/)
    expect(await opsDb.documentTemplate.count({ where: { kind: RECORD, status: 'draft' } })).toBe(0)
  })

  it('saves a draft as v2, refuses a stale stamp, then the Owner publishes it', async () => {
    const draft = off({ ...defaultTemplate(KIND), columns: ['no', 'description', 'qty', 'origin', 'rate', 'amount'] }, 'terms')
    const saved = await opsDb.$transaction((tx) => t.saveTemplateDraft(tx, KIND, draft, 'none'))
    expect(saved.version).toBe(2)
    await expect(
      opsDb.$transaction((tx) => t.saveTemplateDraft(tx, KIND, draft, 'none'))
    ).rejects.toThrow(/changed this template/)
    const e = await t.getTemplateEditor(KIND)
    expect(e.draft?.definition).toEqual(draft)
    expect(e.stamp).toBe(saved.stamp)

    await expect(
      opsDb.$transaction((tx) => t.publishTemplate(tx, KIND, saved.stamp, { id: owner.id, role: 'helper' }))
    ).rejects.toThrow(/Only the Owner/)

    purged.length = 0
    const out = await opsDb.$transaction((tx) => t.publishTemplate(tx, KIND, saved.stamp, owner))
    t.purgeTemplate(KIND)
    expect(out).toMatchObject({ version: 2, previousVersion: 1 })
    expect(purged).toEqual([`ops:template:${KIND}`])
    const rows = await opsDb.documentTemplate.findMany({
      where: { kind: RECORD },
      orderBy: { version: 'asc' },
      select: { version: true, status: true, isActive: true, publishedById: true, signoffStatus: true },
    })
    expect(rows).toEqual([
      { version: 1, status: 'archived', isActive: false, publishedById: null, signoffStatus: 'awaiting' },
      { version: 2, status: 'published', isActive: true, publishedById: owner.id, signoffStatus: 'signed_off' },
    ])
    const active = await t.getActiveTemplate(KIND)
    expect(active.version).toBe(2)
  })

  it('the next issued credit note uses v2 and records it; nothing to publish without a draft', async () => {
    const active = await t.getActiveTemplate(KIND)
    const out = await issue.issueDocument({
      kind: KIND,
      data: fx['credit-note']!,
      number: `INDUS/CN-T${Date.now().toString(36)}`,
      subjectType: 'order',
      subjectId: randomUUID(),
      currency: 'USD',
      actor: { kind: 'user', id: owner.id },
    })
    const v = await opsDb.documentVersion.findFirstOrThrow({
      where: { documentId: out.documentId },
      select: { templateId: true, dataSnapshot: true },
    })
    expect(v.templateId).toBe(active.id)
    const blocks = (v.dataSnapshot as { blocks: { t: string }[] }).blocks.map((b) => b.t)
    expect(blocks).not.toContain('terms')
    await expect(
      opsDb.$transaction((tx) => t.publishTemplate(tx, KIND, 'none', owner))
    ).rejects.toThrow(/no changes/)
  })

  it('discarding a draft leaves the published template as it is', async () => {
    const saved = await opsDb.$transaction((tx) =>
      t.saveTemplateDraft(tx, KIND, { ...defaultTemplate(KIND), pageSize: 'Letter' }, 'none')
    )
    expect(saved.version).toBe(3)
    await opsDb.$transaction((tx) => t.discardTemplateDraft(tx, KIND, saved.stamp))
    expect((await t.getTemplateEditor(KIND)).draft).toBeNull()
    expect((await t.getActiveTemplate(KIND)).version).toBe(2)
  })

  it('the list shows each kind with its number pattern', async () => {
    const list = await t.listTemplates()
    expect(list).toHaveLength(9)
    expect(list.find((x) => x.kind === 'quotation')).toMatchObject({
      version: 1,
      pattern: 'INDUS/Q{n}',
      revisionPattern: '-R{n}',
    })
  })

  it('a draft preview builds the sample through the template', () => {
    const def = off(defaultTemplate('oa'), 'bank')
    const d = t.previewDocument('oa', def, { signer: { name: 'Owner Example', role: 'Owner' } })
    expect(d.layout).toBe('house')
    if (d.layout === 'house') expect(d.blocks.map((b) => b.t)).not.toContain('bank')
  })
})
