import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { askedBecauseOf } from '../../data/proposal-mapper'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { creditHoldContext, forgetGuardrails, loadGuardrails } from './guardrail-context'
import { idempotencyKeyOf, type ActionRequestedData } from './request'
import { registerAction, unregisterAction } from './registry'
import { decideRun, gatherRun, proposeRun, resolveRun, verifyRun } from './runner'
import type { ActionAi, ActionDefinition } from './types'

/**
 * S07-T01 on the local database: the full resolver in the runner. A send to a client on credit hold resolves
 * to Draft and ask with the guardrail named; the decided row carries the guardrail key, a guardrail_trigger
 * row counts it for board 100, and the Review card prints "Asked because: …". A saved threshold changes the
 * result on the next resolve (the 60-second cache is cleared on save).
 */
const DB_URL = localDatabaseUrl()
const KEY = 'tender_query_draft' // an external S-later catalogue key no other test runs

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))
vi.mock('./state', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))

const h = vi.hoisted(() => ({ ctx: {} as Record<string, unknown> }))

const fake: ActionDefinition<{ s: string }, { ok: true }> = {
  key: KEY,
  group: 'quotes',
  aiPurpose: 'draft',
  external: true,
  concurrencyGroup: 'test',
  surface: 'review',
  estimate: () => ({ chars: 10, maxTokens: 10 }),
  gather: async ({ request }) => ({ input: { s: request.subjectId }, versions: { s: 1 } }),
  propose: async () => ({
    ok: true,
    out: { ok: true },
    costUsd: '0',
    model: null,
    promptVersion: null,
    callIds: [],
  }),
  verify: async (out) => ({ out, checks: [], confidence: 'sure' }),
  toProposal: () => ({
    headline: 'Draft a tender query',
    reasons: [],
    checks: [],
    confidence: 'sure',
  }),
  effect: async () => ({ note: 'nothing' }),
  guardrailContext: async (request) => ({ ...(await creditHoldContext(request)), ...h.ctx }),
}

const noAi: ActionAi = {
  call: async () => {
    throw new Error('no model calls')
  },
}

describe.skipIf(!DB_URL)('guardrails in the runner · local database', () => {
  let companyId = ''
  let enquiryId = ''
  let savedThreshold: unknown = null
  let savedLevel: string | null = null

  beforeAll(async () => {
    registerAction(fake as never)
    const company = await opsDb.company.create({
      data: {
        name: 'Sample Client LLC',
        isClient: true,
        clientProfile: { create: { creditHold: true } },
      },
      select: { id: true },
    })
    companyId = company.id
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2099-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        title: 'Guardrail test',
        receivedVia: 'email',
        receivedAt: new Date(),
        clientId: companyId,
      },
      select: { id: true },
    })
    enquiryId = e.id
    const g = await opsDb.guardrail.findUniqueOrThrow({
      where: { key: 'value_threshold_quotation' },
    })
    savedThreshold = g.params
    const s = await opsDb.autopilotSetting.findUniqueOrThrow({ where: { actionKey: KEY } })
    savedLevel = s.level
    await opsDb.autopilotSetting.update({
      where: { actionKey: KEY },
      data: { level: 'do_and_tell' },
    })
    forgetGuardrails()
  })

  afterAll(async () => {
    unregisterAction(KEY)
    if (savedThreshold)
      await opsDb.guardrail.update({
        where: { key: 'value_threshold_quotation' },
        data: { params: savedThreshold as never },
      })
    if (savedLevel)
      await opsDb.autopilotSetting.update({
        where: { actionKey: KEY },
        data: { level: savedLevel as never },
      })
    forgetGuardrails()
  })

  function request(): ActionRequestedData {
    const base = {
      actionKey: KEY,
      subjectType: 'enquiry' as const,
      subjectId: enquiryId,
      enquiryId,
      trigger: 'test',
      origin: 'live' as const,
      sourceVersion: randomUUID(),
      mailboxId: null,
    }
    return {
      ...base,
      idempotencyKey: idempotencyKeyOf(base),
      group: 'test',
      recordKey: `enquiry:${enquiryId}`,
    }
  }

  it('reads the twelve seeded guardrails', async () => {
    const rows = await loadGuardrails(opsDb)
    expect(rows.map((r) => r.key)).toEqual(
      expect.arrayContaining([
        'value_threshold_quotation',
        'value_threshold_rfq',
        'first_contact',
        'margin_floor',
        'credit_hold',
        'working_hours',
        'holiday_calendar',
        'daily_send_cap',
        'fixed_client_prices',
        'fixed_no_money',
      ])
    )
  })

  it('a client on credit hold makes a Do and tell send ask, and the trigger is counted', async () => {
    h.ctx = {}
    const data = request()
    const resolved = await resolveRun(data)
    expect(resolved.level).toBe('draft_and_ask')
    expect(resolved.hits.map((x) => x.key)).toContain('credit_hold')
    const g = await gatherRun(data)
    const p = await proposeRun(data, g.input, noAi)
    if (!p.ok) throw new Error('propose failed')
    const v = await verifyRun(data, p.out, g.input)
    const d = await decideRun({
      data,
      resolved,
      basisHash: g.basisHash,
      input: g.input,
      proposal: {
        ok: true,
        verified: v,
        costUsd: '0',
        model: null,
        promptVersion: null,
        callIds: [],
      },
    })
    expect(d.state).toBe('proposed')
    const row = await opsDb.assistantAction.findUniqueOrThrow({
      where: { id: d.actionId },
      select: { guardrails: true, levelReasons: true },
    })
    expect(row.guardrails).toContain('credit_hold')
    expect(askedBecauseOf(row.levelReasons)).toContain('Sample Client LLC is on credit hold')
    const triggers = await opsDb.guardrailTrigger.findMany({ where: { actionId: d.actionId } })
    expect(triggers.map((t) => t.guardrailKey)).toContain('credit_hold')
  })

  it('raising the saved quotation threshold changes the next resolve', async () => {
    await opsDb.clientProfile.update({ where: { companyId }, data: { creditHold: false } })
    h.ctx = { valueAed: 250_000 }
    forgetGuardrails()
    expect((await resolveRun(request())).level).toBe('draft_and_ask')
    await opsDb.guardrail.update({
      where: { key: 'value_threshold_quotation' },
      data: { params: { appliesTo: 'quotation', currency: 'AED', amount: 300_000 } },
    })
    forgetGuardrails()
    expect((await resolveRun(request())).level).toBe('do_and_tell')
  })
})
