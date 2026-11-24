import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import type { ActionRequestedData } from './request'
import { idempotencyKeyOf } from './request'
import { registerAction, unregisterAction } from './registry'
import {
  basisHash,
  decideRun,
  effectRun,
  gatherRun,
  initialState,
  proposeRun,
  resolveRun,
  verifyRun,
} from './runner'
import type { ActionAi, ActionDefinition, Json } from './types'
import { writeTracked } from './write-tracked'

/**
 * The action runner end to end on the local database with a fake action (S05-T02): proposed and do-quietly
 * paths, blocked origin and pause, a budget refusal recorded as failed, immutable proposal columns, no DELETE,
 * one event per transition, tracked writes, and one action per idempotency key.
 */
const DB_URL = localDatabaseUrl()
const KEY = 'month_pack' // an S-later catalogue key no other test runs
const h = vi.hoisted(() => ({ paused: false }))

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))
vi.mock('./state', () => ({
  isAssistantPaused: async () => h.paused,
  assistantPauseState: async () =>
    h.paused ? { pausedAt: new Date().toISOString(), pausedById: null, note: null } : null,
}))

type In = { subject: string }
type Out = { label: string }

const fake: ActionDefinition<In, Out> = {
  key: KEY,
  group: 'money',
  aiPurpose: 'summarise',
  external: false,
  concurrencyGroup: 'test',
  surface: 'review',
  estimate: () => ({ chars: 100, maxTokens: 100 }),
  gather: async ({ request }) => ({
    input: { subject: request.subjectId },
    versions: { subject: 1, b: 'x' },
  }),
  propose: async () => ({
    ok: true,
    out: { label: 'done' },
    costUsd: '0.000150',
    model: 'claude-haiku-5-5',
    promptVersion: 'fake@1',
    callIds: [],
  }),
  verify: async (out) => ({
    out,
    checks: [{ label: 'Shape', status: 'pass' }],
    confidence: 'sure',
  }),
  toProposal: (v) => ({
    headline: `Label ${v.out.label}`,
    reasons: [{ text: 'Because the test says so' }],
    checks: v.checks,
    confidence: v.confidence,
  }),
  effect: async (tx, verified, ctx) => {
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'mail_message',
        subjectId: ctx.request.subjectId,
        changes: [
          { field: 'label', before: null, after: verified.out.label, kind: 'link' },
          { field: 'unchanged', before: 1, after: 1, kind: 'other' },
        ],
      },
      async () => undefined
    )
    return { note: 'labelled' }
  },
}

function request(over: Partial<ActionRequestedData> = {}): ActionRequestedData {
  const subjectId = randomUUID()
  const base = {
    actionKey: KEY,
    subjectType: 'mail_message' as const,
    subjectId,
    enquiryId: null,
    trigger: 'test',
    origin: 'live' as const,
    sourceVersion: 1,
    mailboxId: null,
    ...over,
  }
  return {
    ...base,
    idempotencyKey: idempotencyKeyOf(base),
    group: 'test',
    recordKey: `mail_message:${base.subjectId}`,
  }
}

const noAi: ActionAi = {
  call: async () => {
    throw new Error('no model calls in this test')
  },
}

async function runToDecide(data: ActionRequestedData, level: 'draft_and_ask' | 'do_quietly') {
  const g = await gatherRun(data)
  const p = await proposeRun(data, g.input, noAi)
  if (!p.ok) throw new Error('fake propose failed')
  const v = await verifyRun(data, p.out, g.input)
  return decideRun({
    data,
    resolved: { level, reasons: [`Set to ${level} in Autopilot`] },
    basisHash: g.basisHash,
    input: g.input,
    proposal: {
      ok: true,
      verified: v,
      costUsd: p.costUsd,
      model: p.model,
      promptVersion: p.promptVersion,
      callIds: [],
    },
  })
}

describe('runner pure parts', () => {
  it('hashes versions independent of key order', () => {
    expect(basisHash({ a: 1, b: 'x' })).toBe(basisHash({ b: 'x', a: 1 }))
    expect(basisHash({ a: 1 })).not.toBe(basisHash({ a: 2 }))
  })
  it('asks for suggest / draft and ask or anything unsure, runs otherwise', () => {
    expect(initialState('suggest', false)).toBe('proposed')
    expect(initialState('draft_and_ask', false)).toBe('proposed')
    expect(initialState('do_quietly', true)).toBe('proposed')
    expect(initialState('do_and_tell', false)).toBe('running')
    expect(initialState('do_quietly', false)).toBe('running')
  })
})

describe.skipIf(!DB_URL)('action runner · local database', () => {
  beforeAll(() => registerAction(fake))

  afterAll(async () => {
    unregisterAction(KEY)
    await opsDb.$disconnect()
  })

  it('resolve blocks backfilled mail and a paused Assistant, and reads the catalogue level otherwise', async () => {
    expect((await resolveRun(request({ origin: 'backfill' }))).blocked).toBe('origin')
    h.paused = true
    expect((await resolveRun(request())).blocked).toBe('paused')
    h.paused = false
    const r = await resolveRun(request())
    expect(['origin', 'paused', 'budget', 'never']).not.toContain(r.blocked)
    expect(r.reasons.length).toBeGreaterThan(0)
  })

  it('draft and ask → one proposed action with an immutable proposal and one create event', async () => {
    const data = request()
    const d = await runToDecide(data, 'draft_and_ask')
    expect(d).toMatchObject({ state: 'proposed', created: true })
    expect(d.ref).toMatch(/^A-\d{2}-\d{2}-\d{2}-\d{4,}$/)
    const row = await opsDb.assistantAction.findUniqueOrThrow({ where: { id: d.actionId } })
    expect(row).toMatchObject({
      headline: 'Label done',
      origin: 'live',
      surface: 'review',
      promptVersion: 'fake@1',
      model: 'claude-haiku-5-5',
      basisHash: basisHash({ subject: 1, b: 'x' }),
      idempotencyKey: data.idempotencyKey,
      version: 0,
    })
    expect(row.costUsd.toFixed(6)).toBe('0.000150')
    const events = await opsDb.assistantActionEvent.findMany({ where: { actionId: d.actionId } })
    expect(events.map((e) => [e.fromState, e.toState, e.actorKind])).toEqual([
      [null, 'proposed', 'assistant'],
    ])

    await expect(
      opsDb.assistantAction.update({ where: { id: d.actionId }, data: { headline: 'changed' } })
    ).rejects.toThrow(/immutable/)
    await expect(
      opsDb.assistantAction.update({ where: { id: d.actionId }, data: { basisHash: 'changed' } })
    ).rejects.toThrow(/immutable/)
    await expect(opsDb.assistantAction.delete({ where: { id: d.actionId } })).rejects.toThrow()

    // a state change appends one event and bumps the version
    await opsDb.assistantAction.update({ where: { id: d.actionId }, data: { state: 'later' } })
    const after = await opsDb.assistantAction.findUniqueOrThrow({ where: { id: d.actionId } })
    expect(after.version).toBe(1)
    expect(await opsDb.assistantActionEvent.count({ where: { actionId: d.actionId } })).toBe(2)
  })

  it('replaying the same idempotency key returns the same action', async () => {
    const data = request()
    const a = await runToDecide(data, 'draft_and_ask')
    const b = await runToDecide(data, 'draft_and_ask')
    expect(b).toMatchObject({ actionId: a.actionId, created: false })
    expect(
      await opsDb.assistantAction.count({ where: { idempotencyKey: data.idempotencyKey } })
    ).toBe(1)
  })

  it('do quietly → running → effect → done with tracked writes and an undo window', async () => {
    const data = request()
    const d = await runToDecide(data, 'do_quietly')
    expect(d.state).toBe('running')
    expect(await effectRun(d.actionId)).toEqual({ state: 'done' })
    // a retried effect step does nothing
    expect(await effectRun(d.actionId)).toEqual({ state: 'skipped' })
    const row = await opsDb.assistantAction.findUniqueOrThrow({ where: { id: d.actionId } })
    expect(row.state).toBe('done')
    expect(row.undoUntil!.getTime()).toBeGreaterThan(Date.now())
    const activity = await opsDb.activityEvent.findMany({ where: { actionId: d.actionId } })
    expect(activity.map((a) => [a.field, a.after, a.actorKind])).toEqual([
      ['label', 'done', 'assistant'],
    ])
    const events = await opsDb.assistantActionEvent.findMany({
      where: { actionId: d.actionId },
      orderBy: { at: 'asc' },
    })
    expect(events.map((e) => e.toState)).toEqual(['running', 'done'])
  })

  it('a budget refusal is recorded as a failed action with its reason, and no effect runs', async () => {
    const data = request()
    const g = await gatherRun(data)
    const d = await decideRun({
      data,
      resolved: { level: 'do_quietly', reasons: [] },
      basisHash: g.basisHash,
      input: g.input,
      proposal: {
        ok: false,
        reason: 'budget',
        detail: 'The monthly AI budget refused this call',
        costUsd: '0.000000',
        callIds: [],
      },
    })
    expect(d.state).toBe('failed')
    const row = await opsDb.assistantAction.findUniqueOrThrow({ where: { id: d.actionId } })
    expect(row.failureReason).toBe('budget')
    expect(await effectRun(d.actionId)).toEqual({ state: 'skipped' })
  })

  it('an effect that throws leaves the action failed with a reason', async () => {
    const boom: ActionDefinition<Json, Json> = {
      ...(fake as unknown as ActionDefinition<Json, Json>),
      effect: async () => {
        throw new Error('mailbox disconnected')
      },
    }
    unregisterAction(KEY)
    registerAction(boom)
    try {
      const d = await runToDecide(request(), 'do_quietly')
      expect(await effectRun(d.actionId)).toEqual({
        state: 'failed',
        failureReason: 'mailbox disconnected',
      })
      const row = await opsDb.assistantAction.findUniqueOrThrow({ where: { id: d.actionId } })
      expect(row).toMatchObject({ state: 'failed', failureReason: 'mailbox disconnected' })
    } finally {
      unregisterAction(KEY)
      registerAction(fake)
    }
  })
})
