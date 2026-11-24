import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'

/**
 * Record history on the local database (S06-T06): newest first with keyset pages, the Assistant/total strip
 * count, Money and Documents filters, Why? ids, the Helper mask (the value never leaves the server), and
 * which Assistant rows can be reverted.
 */
const DB_URL = localDatabaseUrl()

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

describe.skipIf(!DB_URL)('record history · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let h: typeof import('./history')
  const owner = { role: 'owner' as const, canSeeMargins: true }
  const helper = { role: 'helper' as const, canSeeMargins: false }
  const subjectId = randomUUID()
  let ownerId = ''
  let ref = ''

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    h = await import('./history')
    ownerId = (await db.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })).id
    ref = `A-HIST-${randomUUID().slice(0, 8)}`
    const a = await db.assistantAction.create({
      data: {
        ref,
        actionKey: 'link_mail',
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'company',
        subjectId,
        headline: 'Linked',
        reasons: [],
        state: 'done',
        surface: 'review',
      },
      select: { id: true },
    })
    const t0 = Date.now() - 60 * 60_000
    const at = (m: number) => new Date(t0 + m * 60_000)
    await db.activityEvent.createMany({
      data: [
        { at: at(1), actorKind: 'assistant', actionId: a.id, subjectType: 'company', subjectId, kind: 'link', field: 'link', after: 'enquiry:x' },
        { at: at(2), actorKind: 'assistant', actionId: a.id, subjectType: 'company', subjectId, kind: 'money', field: 'line.4.margin', before: '18.0%', after: '9.8%', sensitive: true },
        { at: at(3), actorKind: 'user', actorId: ownerId, subjectType: 'company', subjectId, kind: 'documents', field: 'document', before: 'v1', after: 'v2', note: 'New datasheet' },
        { at: at(4), actorKind: 'user', actorId: ownerId, subjectType: 'company', subjectId, kind: 'terms', field: 'payment_terms', before: '30 days', after: '45 days' },
      ],
    })
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  const scope = () => ({ subjectType: 'company' as const, subjectId })

  it('lists newest first with the strip count, Why? ids and who', async () => {
    const p = await h.listHistory({ scope: scope(), kind: 'all' }, owner)
    expect(p.counts).toEqual({ total: 4, assistant: 2 })
    expect(p.rows.map((r) => r.field)).toEqual(['Payment terms', 'Document', 'Line 4 · margin', 'Link'])
    expect(p.rows[0]!.who).toMatchObject({ assistant: false })
    expect(p.rows[0]!.evidenceId).toMatch(/^ae_/)
    expect(p.rows[2]!.who).toEqual({ assistant: true, ref })
    expect(p.rows[2]!.evidenceId).toBe(`${ref}~fline.4.margin`)
    expect(p.rows[2]).toMatchObject({ before: '18.0%', after: '9.8%' })
    expect(p.rows[1]!.note).toBe('New datasheet')
  })

  it('filters Money only and Documents only; the strip still counts everything', async () => {
    const money = await h.listHistory({ scope: scope(), kind: 'money' }, owner)
    expect(money.rows.map((r) => r.kind)).toEqual(['money'])
    expect(money.counts.total).toBe(4)
    const docs = await h.listHistory({ scope: scope(), kind: 'documents' }, owner)
    expect(docs.rows.map((r) => r.kind)).toEqual(['documents'])
  })

  it('a Helper without margins gets sensitive rows as Hidden, the value never sent', async () => {
    const p = await h.listHistory({ scope: scope(), kind: 'all' }, helper)
    const margin = p.rows.find((r) => r.kind === 'money')!
    expect(margin).toMatchObject({ before: 'Hidden', after: 'Hidden', revertible: false })
    expect(JSON.stringify(p)).not.toContain('9.8%')
    expect(JSON.stringify(p)).not.toContain('18.0%')
  })

  it('Assistant rows of an internal, done action are revertible; people’s rows are not', async () => {
    const p = await h.listHistory({ scope: scope(), kind: 'all' }, owner)
    expect(p.rows.filter((r) => r.revertible).map((r) => r.field)).toEqual(['Line 4 · margin', 'Link'])
  })

  it('pages by keyset', async () => {
    const all = await h.listHistory({ scope: scope(), kind: 'all' }, owner)
    expect(all.nextCursor).toBeNull()
    expect(h.decodeCursor('junk')).toBeNull()
  })
})
