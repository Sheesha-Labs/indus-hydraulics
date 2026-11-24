import Anthropic, { APIConnectionError, APIError, BadRequestError } from '@anthropic-ai/sdk'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import type { Price } from './cost'
import { AiRequestError, ProviderUnavailableError } from './errors'
import type { AiCallRecord, AiLedger, ReserveInput } from './ledger'
import { MODELS } from './models'
import {
  SERVER_FALLBACK_BETA,
  structuredCall,
  type CreateBody,
  type Transport,
} from './structured-call'

const PRICE: Price = {
  inputPerM: '0.1000',
  outputPerM: '0.5000',
  cacheReadPerM: '0.0100',
  cacheWrite5mPerM: '0.1250',
  cacheWrite1hPerM: '0.2000',
  webSearchPerK: '10.0000',
}

class FakeLedger implements AiLedger {
  refuse = false
  reserves: ReserveInput[] = []
  settles: Array<[string, string]> = []
  calls: AiCallRecord[] = []
  async prices(): Promise<Price> {
    return PRICE
  }
  async reserve(input: ReserveInput): Promise<string | null> {
    this.reserves.push(input)
    return this.refuse ? null : `r${this.reserves.length}`
  }
  async settle(id: string, actual: string): Promise<void> {
    this.settles.push([id, actual])
  }
  async record(call: AiCallRecord): Promise<string | undefined> {
    this.calls.push(call)
    return undefined
  }
}

type Reply = Partial<Anthropic.Beta.Messages.BetaMessage> & { text?: string }

function message(r: Reply, model: string): Anthropic.Beta.Messages.BetaMessage {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model,
    content: [{ type: 'text', text: r.text ?? '{"label":"enquiry"}', citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: 1_000,
      output_tokens: 100,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: null,
      server_tool_use: null,
      service_tier: null,
    },
    ...r,
  } as Anthropic.Beta.Messages.BetaMessage
}

function fake(replies: Array<Reply | Error>): { transport: Transport; bodies: CreateBody[] } {
  const bodies: CreateBody[] = []
  const transport: Transport = async (body) => {
    bodies.push(body)
    const next = replies.shift()
    if (!next) throw new Error('no more fake replies')
    if (next instanceof Error) throw next
    return message(next, body.model)
  }
  return { transport, bodies }
}

const Label = z.strictObject({ label: z.enum(['enquiry', 'quote', 'other']) })

function call(
  ledger: FakeLedger,
  transport: Transport,
  extra: Partial<Parameters<typeof structuredCall>[0]> = {}
) {
  return structuredCall({
    route: 'classify',
    system: [{ id: 'rules', text: 'Classify the email.' }],
    user: 'Email: please quote 10 ball valves.',
    zod: Label,
    maxTokens: 1_000,
    promptVersion: 'classify-mail@1',
    actionId: 'a1',
    ledger,
    transport,
    now: () => new Date('2026-11-24T09:00:00Z'),
    ...extra,
  })
}

describe('structuredCall', () => {
  it('returns the validated value, records one ai_call and settles the actual cost', async () => {
    const ledger = new FakeLedger()
    const { transport, bodies } = fake([{}])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({
      ok: true,
      value: { label: 'enquiry' },
      model: MODELS.haiku,
      attempts: 1,
    })
    // 1,000 × 0.1 / 1M + 100 × 0.5 / 1M = 0.00015
    expect(res.costUsd).toBe('0.000150')
    expect(ledger.reserves).toEqual([
      { month: '2026-11-01', estUsd: expect.any(String), purpose: 'classify', actionId: 'a1' },
    ])
    expect(ledger.settles).toEqual([['r1', '0.000150']])
    expect(ledger.calls).toHaveLength(1)
    expect(ledger.calls[0]).toMatchObject({
      model: MODELS.haiku,
      purpose: 'classify',
      promptVersion: 'classify-mail@1',
      effort: 'low',
      ok: true,
      stopReason: 'end_turn',
      reservationId: 'r1',
      costUsd: '0.000150',
    })
    const body = bodies[0]!
    expect(body.output_config).toMatchObject({ effort: 'low', format: { type: 'json_schema' } })
    expect(body).not.toHaveProperty('temperature')
    expect(body).not.toHaveProperty('top_p')
    expect(body).not.toHaveProperty('tool_choice')
    expect(body).not.toHaveProperty('thinking')
    // Haiku has no server-side fallback
    expect(body).not.toHaveProperty('fallbacks')
    expect(body.system).toEqual([
      {
        type: 'text',
        text: 'Classify the email.',
        cache_control: { type: 'ephemeral', ttl: '1h' },
      },
    ])
  })

  it('makes no API request when the budget refuses the reservation', async () => {
    const ledger = new FakeLedger()
    ledger.refuse = true
    const { transport, bodies } = fake([{}])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({ ok: false, reason: 'budget', attempts: 0, costUsd: '0.000000' })
    expect(bodies).toHaveLength(0)
    expect(ledger.calls).toHaveLength(0)
  })

  it('reruns a Haiku refusal once on Sonnet, with the server fallback', async () => {
    const ledger = new FakeLedger()
    const { transport, bodies } = fake([{ stop_reason: 'refusal', text: '' }, {}])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({ ok: true, model: MODELS.sonnet, attempts: 2 })
    expect(bodies.map((b) => b.model)).toEqual([MODELS.haiku, MODELS.sonnet])
    expect(bodies[1]).toMatchObject({ betas: [SERVER_FALLBACK_BETA], fallbacks: 'default' })
    expect(ledger.calls.map((c) => [c.model, c.ok, c.stopReason])).toEqual([
      [MODELS.haiku, false, 'refusal'],
      [MODELS.sonnet, true, 'end_turn'],
    ])
  })

  it('returns refusal when the rerun refuses too, without reading content', async () => {
    const ledger = new FakeLedger()
    const { transport } = fake([
      { stop_reason: 'refusal', text: 'not json' },
      {
        stop_reason: 'refusal',
        text: 'not json',
        stop_details: { type: 'refusal', category: 'cyber', explanation: null },
      } as Reply,
    ])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({
      ok: false,
      reason: 'refusal',
      detail: 'Refused (cyber)',
      attempts: 2,
    })
    expect(ledger.calls).toHaveLength(2)
  })

  it('treats a Sonnet refusal as final (the server fallback already ran)', async () => {
    const ledger = new FakeLedger()
    const { transport, bodies } = fake([{ stop_reason: 'refusal', text: '' }])
    const res = await call(ledger, transport, { route: 'extract' })
    expect(res).toMatchObject({ ok: false, reason: 'refusal', attempts: 1 })
    expect(bodies[0]).toMatchObject({ model: MODELS.sonnet, fallbacks: 'default' })
  })

  it('reruns max_tokens once with double the budget, then fails without parsing', async () => {
    const ledger = new FakeLedger()
    const { transport, bodies } = fake([
      { stop_reason: 'max_tokens', text: '{"label":"enq' },
      { stop_reason: 'max_tokens', text: '{"label":"enq' },
    ])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({ ok: false, reason: 'max_tokens', attempts: 2 })
    expect(bodies.map((b) => b.max_tokens)).toEqual([1_000, 2_000])
    expect(ledger.calls.every((c) => c.stopReason === 'max_tokens' && !c.ok)).toBe(true)
  })

  it('succeeds when the doubled max_tokens is enough', async () => {
    const ledger = new FakeLedger()
    const { transport } = fake([{ stop_reason: 'max_tokens', text: '{' }, {}])
    expect(await call(ledger, transport)).toMatchObject({ ok: true, attempts: 2 })
  })

  it('retries invalid output once with the validation error in the user turn', async () => {
    const ledger = new FakeLedger()
    const { transport, bodies } = fake([{ text: '{"label":"invoice"}' }, {}])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({ ok: true, attempts: 2 })
    const retryUser = bodies[1]!.messages[0]!.content as string
    expect(retryUser).toContain('please quote 10 ball valves')
    expect(retryUser).toContain('did not match the required schema')
    expect(retryUser).toContain('label')
  })

  it('returns invalid after the retry also fails, and on non-JSON', async () => {
    const ledger = new FakeLedger()
    const { transport } = fake([{ text: 'Sure! Here it is' }, { text: '{"label":1}' }])
    const res = await call(ledger, transport)
    expect(res).toMatchObject({ ok: false, reason: 'invalid', attempts: 2 })
    expect(ledger.calls).toHaveLength(2)
  })

  it('throws ProviderUnavailableError on 529 and records the failed call at zero cost', async () => {
    const ledger = new FakeLedger()
    const overloaded = new APIError(529, { type: 'error' }, 'Overloaded', new Headers())
    const { transport } = fake([overloaded])
    await expect(call(ledger, transport)).rejects.toBeInstanceOf(ProviderUnavailableError)
    expect(ledger.settles).toEqual([['r1', '0.000000']])
    expect(ledger.calls).toEqual([
      expect.objectContaining({
        ok: false,
        costUsd: '0.000000',
        error: expect.stringContaining('529'),
      }),
    ])
  })

  it('throws ProviderUnavailableError on a dropped connection and AiRequestError on a 400', async () => {
    const dropped = new APIConnectionError({ message: 'socket hang up' })
    await expect(call(new FakeLedger(), fake([dropped]).transport)).rejects.toBeInstanceOf(
      ProviderUnavailableError
    )
    const bad = new BadRequestError(400, { type: 'error' }, 'bad', new Headers())
    const ledger = new FakeLedger()
    await expect(call(ledger, fake([bad]).transport)).rejects.toBeInstanceOf(AiRequestError)
    expect(ledger.calls).toHaveLength(1)
  })

  it('prices a fallback-served reply at the serving model and sums every attempt', async () => {
    const ledger = new FakeLedger()
    const { transport } = fake([{ text: '{"label":"nope"}' }, {}])
    const res = await call(ledger, transport)
    expect(res.costUsd).toBe('0.000300')
  })
})
