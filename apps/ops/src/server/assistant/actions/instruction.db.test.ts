import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { InstructionOutput } from '@indus/ops-core'
import { localDatabaseUrl } from '../../mail-send/testing/fixture'
import type { ActionDefinition } from '../types'

/**
 * S06-T08 `instruction` on the local database with a fake model: each intent becomes a proposal (state
 * proposed, Review) and nothing on the record changes before approval; an invalid line becomes "I could not
 * turn this into an action" with no approve; approval writes the change through writeTracked and undo puts
 * it back; request_action asks for the target only after approval, as that action's own request.
 */
const DB_URL = localDatabaseUrl()
const h = vi.hoisted(() => ({
  emitted: [] as Array<{ name: string; data: Record<string, unknown> }>,
}))

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../../inngest/emit', () => ({
  emitEvent: async (e: { name: string; data: Record<string, unknown> }) => (
    h.emitted.push(e),
    true
  ),
  emitEventOrThrow: async (e: { name: string; data: Record<string, unknown> }) =>
    void h.emitted.push(e),
}))
vi.mock('../state', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))

describe.skipIf(!DB_URL)('instruction · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let runner: typeof import('../runner')
  let request: typeof import('../request')
  let registry: typeof import('../registry')
  let d: typeof import('../decisions')
  let undo: typeof import('../undo')
  let enquiryId = ''
  let ownerId = ''
  let owner: import('../decisions').Decider

  // A requestable action on enquiries (the real ones arrive in later sprints).
  const fakeRequestable: ActionDefinition<Record<string, never>, Record<string, never>> = {
    key: 'chase_suppliers',
    group: 'sourcing',
    aiPurpose: 'other',
    external: false,
    concurrencyGroup: 'test',
    surface: 'review',
    requestableOn: ['enquiry'],
    estimate: () => ({ chars: 0, maxTokens: 0 }),
    gather: async () => ({ input: {}, versions: {} }),
    propose: async () => ({
      ok: true,
      out: {},
      costUsd: '0',
      model: null,
      promptVersion: null,
      callIds: [],
    }),
    verify: async (out) => ({ out, checks: [], confidence: 'sure' }),
    toProposal: () => ({ headline: 'Chase', reasons: [], checks: [], confidence: 'sure' }),
    effect: async () => ({ note: 'Chased' }),
  }

  async function propose(text: string, out: InstructionOutput) {
    const data = request.actionRequestEvent({
      actionKey: 'instruction',
      subjectType: 'enquiry',
      subjectId: enquiryId,
      enquiryId,
      trigger: 'panel',
      origin: 'live',
      sourceVersion: `instruction:${randomUUID()}`,
      hint: text,
      requestedById: ownerId,
    }).data
    const g = await runner.gatherRun(data)
    const ai = {
      call: async () => ({
        ok: true as const,
        value: out,
        costUsd: '0',
        model: 'claude-sonnet-5-5',
        callIds: [],
      }),
    }
    const p = await runner.proposeRun(data, g.input, ai as never)
    if (!p.ok) throw new Error('propose failed')
    const v = await runner.verifyRun(data, p.out, g.input)
    const resolved = await runner.resolveRun(data)
    const decided = await runner.decideRun({
      data,
      resolved,
      basisHash: g.basisHash,
      input: g.input,
      proposal: {
        ok: true,
        verified: v,
        costUsd: '0',
        model: p.model,
        promptVersion: p.promptVersion,
        callIds: [],
      },
    })
    return db.assistantAction.findUniqueOrThrow({ where: { id: decided.actionId } })
  }

  const line = (no: number) =>
    db.enquiryLine.findFirstOrThrow({
      where: { enquiryId, no },
      select: { status: true, heldReason: true },
    })

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    runner = await import('../runner')
    request = await import('../request')
    registry = await import('../registry')
    d = await import('../decisions')
    undo = await import('../undo')
    await import('./index')
    registry.registerAction(fakeRequestable)
    const o = await db.user.findFirstOrThrow({
      where: { role: 'owner' },
      select: { id: true, initials: true },
    })
    ownerId = o.id
    owner = {
      id: o.id,
      initials: o.initials,
      role: 'owner',
      canSendSupplierMail: true,
      canSeeMargins: true,
    }
    const e = await db.enquiry.create({
      data: {
        ref: `ENQ-2099-${Math.floor(1000 + Math.random() * 8999)}${Date.now() % 1000}`,
        title: 'Instruction test enquiry',
        receivedVia: 'manual',
        receivedAt: new Date(),
        lines: {
          create: [
            { no: 1, description: 'Ball valve 2 inch', qty: 10 },
            { no: 4, description: 'Control valve trim', qty: 2 },
          ],
        },
      },
      select: { id: true },
    })
    enquiryId = e.id
  })

  afterAll(async () => {
    await db.assistantAction.updateMany({
      where: { enquiryId, state: { in: ['proposed', 'later'] } },
      data: { state: 'cancelled' },
    })
    registry.unregisterAction('chase_suppliers')
    await db.$disconnect()
  })

  it('hold_line: a proposal first, the line unchanged; approve holds it; undo puts it back', async () => {
    const a = await propose('hold line 4 until the client confirms the trim', {
      params: {
        intent: 'hold_line',
        lineNo: 4,
        until: 'answer',
        note: 'until the client confirms the trim',
      },
      reasons: [{ text: 'You asked to hold line 4', quote: 'hold line 4' }],
    })
    expect(a).toMatchObject({
      state: 'proposed',
      surface: 'review',
      levelAtTime: 'draft_and_ask',
      headline: 'Hold line 4 until the client confirms the trim',
    })
    expect(a.onApproveText).toContain('Sets line 4 to Held')
    expect(await line(4)).toEqual({ status: 'open', heldReason: null })

    const out = await d.approve({ actionId: a.id, version: a.version }, owner)
    expect(out.state).toBe('done')
    expect(await line(4)).toEqual({
      status: 'held',
      heldReason: 'until the client confirms the trim',
    })

    const u = await undo.undoAction(a.id, owner)
    expect(u.undone).toBe(true)
    expect(await line(4)).toEqual({ status: 'open', heldReason: null })
  })

  it('an invalid line becomes "I could not turn this into an action", with nothing to approve', async () => {
    const a = await propose('hold line 9', {
      params: { intent: 'hold_line', lineNo: 9, until: 'answer', note: 'x' },
      reasons: [],
    })
    expect(a.headline).toBe('I could not turn this into an action')
    expect(a.onApproveText).toBeNull()
    expect(a.confidence).toBe('unsure')
    expect(a.unsureAbout).toContain('There is no line 9')
  })

  it('add_task and add_note write only on approve', async () => {
    const before = await db.task.count({ where: { enquiryId } })
    const t = await propose('ask the helper to call the buyer', {
      params: { intent: 'add_task', title: 'Call the buyer about delivery', assignee: 'helper' },
      reasons: [],
    })
    expect(await db.task.count({ where: { enquiryId } })).toBe(before)
    await d.approve({ actionId: t.id, version: t.version }, owner)
    const task = await db.task.findFirstOrThrow({ where: { enquiryId, createdByActionId: t.id } })
    expect(task).toMatchObject({
      title: 'Call the buyer about delivery',
      source: 'assistant',
      createdById: ownerId,
    })

    const n = await propose('note: prefers sea freight', {
      params: { intent: 'add_note', text: 'Client prefers sea freight' },
      reasons: [],
    })
    expect(await db.activityEvent.count({ where: { actionId: n.id } })).toBe(0)
    await d.approve({ actionId: n.id, version: n.version }, owner)
    expect(
      await db.activityEvent.findFirstOrThrow({ where: { actionId: n.id, field: 'note' } })
    ).toMatchObject({ after: 'Client prefers sea freight', subjectType: 'enquiry' })
  })

  it('request_action asks for the target only after approve, as its own request', async () => {
    h.emitted.length = 0
    const a = await propose('chase the suppliers', {
      params: { intent: 'request_action', targetKey: 'chase_suppliers' },
      reasons: [],
    })
    expect(a.headline).toMatch(/^Ask the Assistant to /)
    expect(h.emitted.filter((e) => e.data.actionKey === 'chase_suppliers')).toEqual([])
    const out = await d.approve({ actionId: a.id, version: a.version }, owner)
    expect(out.state).toBe('done')
    const asked = h.emitted.filter((e) => e.data.actionKey === 'chase_suppliers')
    expect(asked).toHaveLength(1)
    expect(asked[0]!.data).toMatchObject({
      subjectType: 'enquiry',
      subjectId: enquiryId,
      trigger: 'instruction',
    })
  })
})
