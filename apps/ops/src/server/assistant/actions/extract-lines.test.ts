import { describe, expect, it, vi } from 'vitest'
import type { StructuredResult } from '@indus/ops-ai'
import { toApi, type ExtractOutput } from '../prompts/extract-lines.v2'
import type { ActionAi } from '../types'

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
const { extractLinesDefinition: def } = await import('./extract-lines')

/**
 * Action #5's propose (S08-T02): the escalation rules on an email body (no Storage, no database). A Sonnet read
 * with more than 20 % Unsure lines is read again on Opus 5.5; a body with nothing to read makes no call.
 */
const LEVEL: ExtractOutput['documentLevel'] = {
  clientRef: null,
  closingDate: null,
  deliveryTerms: null,
  currency: null,
  quoteValidity: null,
  partialAllowed: null,
  issuerName: null,
}
const body =
  'Please quote:\n1. Ball valve 2" TEST-0001 - 10 nos\n2. Gate valve 4" TEST-0002 - 4 nos\n3. Gasket TEST-0003 - 24 pcs'

const input = {
  intakeFileId: '00000000-0000-0000-0000-00000000000a',
  batchId: '00000000-0000-0000-0000-00000000000b',
  filename: 'Email body',
  kind: 'email',
  sizeBytes: body.length,
  sha256: null,
  textHash: 'h',
  file: null,
  email: { bodyText: body, bodyTextHash: 'h', subject: 'RFQ' },
  sourceId: '00000000-0000-0000-0000-00000000000c',
  today: 'Wednesday, 25 November 2026',
  anchor: '2026-11-25T08:00:00.000Z',
  units: [{ code: 'EA', label: 'Each', aliases: ['NOS', 'PCS'] }],
}

const lineOf = (desc: string, part: string, qty: string, doubt = false) => ({
  ord: 1,
  description: desc,
  qtyPrinted: qty,
  qty: Number(qty),
  uom: 'nos',
  uomFromHeader: false,
  partNumber: part,
  make: null,
  alternativeMake: false,
  spec: null,
  certification: null,
  clientRef: null,
  notes: null,
  evidence: [
    { field: 'description' as const, quote: desc, page: null, sheet: null, cellRef: null },
    { field: 'qty' as const, quote: `${qty} nos`, page: null, sheet: null, cellRef: null },
    { field: 'partNumber' as const, quote: part, page: null, sheet: null, cellRef: null },
  ],
  doubts: doubt ? [{ field: 'qty', question: `Quantity smudged: ${qty} or 1${qty}?` }] : [],
})

function ai(byModel: Record<string, ExtractOutput>) {
  const models: string[] = []
  const a: ActionAi = {
    call: async (args) => {
      models.push(args.model!)
      const value = toApi(byModel[args.model!]!)
      return {
        ok: true,
        value,
        usage: {},
        costUsd: '0.020000',
        stopReason: 'end_turn',
        model: args.model!,
        attempts: 1,
        callIds: [args.model!],
      } as unknown as StructuredResult<never>
    },
  }
  return { a, models }
}

describe('extract_lines propose', () => {
  it('Sonnet with more than 20 % Unsure is read again on Opus 5.5', async () => {
    const sonnet = {
      lines: [
        lineOf('Ball valve 2"', 'TEST-0001', '10', true),
        lineOf('Gate valve 4"', 'TEST-0002', '4', true),
        lineOf('Gasket', 'TEST-0003', '24'),
      ],
      documentLevel: LEVEL,
    }
    const opus = {
      lines: [
        lineOf('Ball valve 2"', 'TEST-0001', '10'),
        lineOf('Gate valve 4"', 'TEST-0002', '4'),
        lineOf('Gasket', 'TEST-0003', '24'),
      ],
      documentLevel: LEVEL,
    }
    const { a, models } = ai({ 'claude-sonnet-5-5': sonnet, 'claude-opus-5-5': opus })
    const r = await def.propose(input, a)
    expect(models).toEqual(['claude-sonnet-5-5', 'claude-opus-5-5'])
    if (!r.ok) throw new Error(r.detail)
    expect(r.out.escalated).toBe('unsure_share')
    expect(r.out.model).toBe('claude-opus-5-5')
    expect(r.out.lines.every((l) => l.doubts.length === 0)).toBe(true)
    expect(r.costUsd).toBe('0.040000')
    expect(r.callIds).toEqual(['claude-sonnet-5-5', 'claude-opus-5-5'])
  })

  it('a clean Sonnet read is kept', async () => {
    const clean = { lines: [lineOf('Ball valve 2"', 'TEST-0001', '10')], documentLevel: LEVEL }
    const { a, models } = ai({ 'claude-sonnet-5-5': clean })
    const r = await def.propose(input, a)
    expect(models).toEqual(['claude-sonnet-5-5'])
    expect(r.ok && r.out.escalated).toBeNull()
  })

  it('an empty body is unreadable: no model call', async () => {
    const { a, models } = ai({})
    const r = await def.propose(
      { ...input, email: { bodyText: '', bodyTextHash: null, subject: null } },
      a
    )
    expect(models).toEqual([])
    expect(r.ok && r.out.failure).toMatchObject({ kind: 'unreadable' })
  })
})
