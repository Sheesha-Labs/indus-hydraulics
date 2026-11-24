import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'

/**
 * S06-T08 the Assistant panel's read on the local database: Waiting on you (proposed and Later cards on the
 * record), Doing now (queued and running, scheduled email, the Later clock's "Back in Review"), Earlier today
 * (ended since 00:00 Dubai, with Why?), only this record's rows, money masked for a Helper, three queries.
 */
const DB_URL = localDatabaseUrl()

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../server/assistant/state', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))

describe.skipIf(!DB_URL)('Assistant panel · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let panel: typeof import('./assistant-panel')
  let ref = ''
  let enquiryId = ''
  let otherId = ''
  const owner = { id: randomUUID(), role: 'owner' as const, canSeeMargins: true }
  const helper = { id: randomUUID(), role: 'helper' as const, canSeeMargins: false }
  const now = new Date()
  const tag = `P${Date.now().toString(36).toUpperCase()}`

  async function action(state: string, headline: string, over: Record<string, unknown> = {}) {
    return db.assistantAction.create({
      data: {
        ref: `A-PANEL-${tag}-${randomUUID().slice(0, 6)}`,
        actionKey: 'instruction',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        enquiryId,
        subjectType: 'enquiry',
        subjectId: enquiryId,
        headline,
        reasons: [],
        state: state as never,
        surface: 'review',
        ...over,
      },
      select: { id: true, ref: true },
    })
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    panel = await import('./assistant-panel')
    const mk = async (n: number) =>
      db.enquiry.create({
        data: {
          ref: `ENQ-2098-${n}${Date.now() % 100000}`,
          title: 'Panel test',
          receivedVia: 'manual',
          receivedAt: now,
        },
        select: { id: true, ref: true },
      })
    const e = await mk(1)
    ref = e.ref
    enquiryId = e.id
    otherId = (await mk(2)).id
    await action('proposed', 'Price line 2 at USD 1,690.00 each')
    await action('later', 'Hold line 4', { laterUntil: new Date(now.getTime() + 3 * 3_600_000) })
    await action('queued', 'Reply to the buyer')
    await action('done', 'Linked the email to this enquiry')
    await action('failed', 'Draft a chaser')
    await action('done', 'Something from yesterday', {
      updatedAt: new Date(now.getTime() - 2 * 86_400_000),
    })
    await db.assistantAction.create({
      data: {
        ref: `A-PANEL-${tag}-other`,
        actionKey: 'instruction',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        enquiryId: otherId,
        subjectType: 'enquiry',
        subjectId: otherId,
        headline: 'Another record’s card',
        reasons: [],
        state: 'proposed',
        surface: 'review',
      },
    })
  })

  afterAll(async () => {
    await db.assistantAction.updateMany({
      where: { ref: { startsWith: `A-PANEL-${tag}` }, state: { in: ['proposed', 'later', 'queued'] } },
      data: { state: 'cancelled' },
    })
    await db.$disconnect()
  })

  it('three sections for this record only, in three queries', async () => {
    const spies = [
      vi.spyOn(db.enquiry, 'findUnique'),
      vi.spyOn(db.assistantAction, 'findMany'),
      vi.spyOn(db.outboundEmail, 'findMany'),
    ]
    const f = await panel.getAssistantPanel(ref, owner, now)
    expect(spies.map((s) => s.mock.calls.length)).toEqual([1, 1, 1])
    for (const s of spies) s.mockRestore()

    expect(f.record?.ref).toBe(ref)
    expect(f.canInstruct).toBe(true)
    expect(f.waiting.map((w) => w.title)).toEqual(['Price line 2 at USD 1,690.00 each', 'Hold line 4'])
    expect(f.waiting[0]!.href).toMatch(/^\/review\?card=A-PANEL-/)
    expect(f.waiting[1]!.sub).toMatch(/^Later · back /)
    expect(f.doing.map((d) => d.text)).toEqual(['Sending: Reply to the buyer', 'Back in Review · Hold line 4'])
    expect(f.earlier.map((e) => e.text).sort()).toEqual(['Draft a chaser · failed', 'Linked the email to this enquiry'])
    expect(f.earlier.find((e) => e.text.startsWith('Draft'))!.actor).toBe('warn')
    expect(f.earlier.every((e) => e.whyId?.startsWith('A-PANEL-'))).toBe(true)
    expect(JSON.stringify(f)).not.toContain('Another record')
  })

  it('a Helper without margins sees money in headlines masked', async () => {
    const f = await panel.getAssistantPanel(ref, helper, now)
    expect(f.waiting[0]!.title).toBe('Price line 2 at USD Hidden each')
    expect(JSON.stringify(f)).not.toContain('1,690')
  })

  it('no record: nothing to show and the box is off with the reason', async () => {
    const f = await panel.getAssistantPanel(null, owner, now)
    expect(f).toMatchObject({ record: null, canInstruct: false, blocked: { kind: 'no_record' } })
  })

  it('whenText and dubaiDayStart', () => {
    const at = new Date('2026-11-24T05:00:00Z')
    expect(panel.whenText(at, at)).toBe('09:00')
    expect(panel.whenText(new Date('2026-11-25T05:00:00Z'), at)).toBe('Tomorrow 09:00')
    expect(panel.dubaiDayStart(new Date('2026-11-24T21:30:00Z')).toISOString()).toBe('2026-11-24T20:00:00.000Z')
  })
})
