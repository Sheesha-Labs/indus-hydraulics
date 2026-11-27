import { describe, expect, it } from 'vitest'
import type { StructuredResult } from '@indus/ops-ai'
import type { ExtractedLine, ExtractOutput } from '../assistant/prompts/extract-lines.v2'
import { toApi, unitReference } from '../assistant/prompts/extract-lines.v2'
import type { ActionAi } from '../assistant/types'
import { buildCandidates, numbersIn, unsureShare } from './candidates'
import {
  ESCALATION_MODEL,
  EXTRACT_MODEL,
  mergeChunks,
  planChunks,
  runExtraction,
  sameLine,
  splitChunk,
  startingModel,
  type Chunk,
} from './extract'
import { parsePdf } from './parse/pdf'
import { fixture } from './parse/fixtures'
import { spanSourceOf } from './spans'
import { uomTableOf, type UnitRow } from './units'

const UNITS: UnitRow[] = [
  { code: 'EA', label: 'Each', aliases: ['NOS', 'PCS'] },
  { code: 'M', label: 'Metre', aliases: ['MTR'] },
]
const NO_LEVEL: ExtractOutput['documentLevel'] = {
  clientRef: null,
  closingDate: null,
  deliveryTerms: null,
  currency: null,
  quoteValidity: null,
  partialAllowed: null,
  issuerName: null,
}

function line(over: Partial<ExtractedLine> & { page?: number }): ExtractedLine {
  const page = over.page ?? 1
  const base: ExtractedLine = {
    ord: 1,
    description: 'Ball valve 2" ANSI 300 RF',
    qtyPrinted: '10',
    qty: 10,
    uom: 'NOS',
    uomFromHeader: false,
    partNumber: 'TEST-0001',
    make: null,
    alternativeMake: false,
    spec: null,
    certification: null,
    clientRef: null,
    notes: null,
    evidence: [
      {
        field: 'description',
        quote: 'Ball valve 2" ANSI 300 RF',
        page,
        sheet: null,
        cellRef: null,
      },
      { field: 'qty', quote: '10', page, sheet: null, cellRef: null },
      { field: 'uom', quote: 'NOS', page, sheet: null, cellRef: null },
      { field: 'partNumber', quote: 'TEST-0001', page, sheet: null, cellRef: null },
    ],
    doubts: [],
  }
  const { page: _p, ...rest } = over
  return { ...base, ...rest }
}

const ok = (value: ExtractOutput, model = EXTRACT_MODEL): StructuredResult<unknown> => ({
  ok: true,
  value: toApi(value),
  usage: {} as never,
  costUsd: '0.010000',
  stopReason: 'end_turn',
  model,
  attempts: 1,
  callIds: ['call'],
})

function fakeAi(answer: (args: Parameters<ActionAi['call']>[0]) => StructuredResult<unknown>) {
  const calls: Array<Parameters<ActionAi['call']>[0]> = []
  const ai: ActionAi = {
    call: async (args) => {
      calls.push(args)
      return answer(args) as never
    },
  }
  return { ai, calls }
}

describe('planChunks', () => {
  it('a short PDF goes whole, as one document block with its pages', async () => {
    const bytes = fixture('rfq-3-pages.pdf')
    const doc = await parsePdf(bytes)
    const [c] = await planChunks(doc, bytes)
    expect(c!.pages).toEqual([1, 2, 3])
    expect(c!.attachments[0]).toMatchObject({ type: 'document', mediaType: 'application/pdf' })
    expect(startingModel(doc)).toBe(EXTRACT_MODEL)
  })
  it('over 15 pages starts on Opus', () => {
    expect(
      startingModel({
        kind: 'pdf',
        pageCount: 16,
        hasTextLayer: true,
        pages: [],
        encrypted: false,
        title: null,
      })
    ).toBe(ESCALATION_MODEL)
  })
})

describe('mergeChunks', () => {
  it('maps chunk pages to the document and drops a repeat on the overlap page', () => {
    const merged = mergeChunks([
      {
        out: {
          lines: [
            line({ page: 1 }),
            line({ page: 2, partNumber: 'TEST-0002', description: 'Gate valve' }),
          ],
          documentLevel: NO_LEVEL,
        },
        pages: [1, 2],
      },
      // Chunk 2 covers pages 2–3; its page 1 is the document's page 2.
      {
        out: {
          lines: [
            line({ page: 1, partNumber: 'TEST-0002', description: 'Gate valve' }),
            line({ page: 2, partNumber: 'TEST-0003', description: 'Gasket' }),
          ],
          documentLevel: { ...NO_LEVEL, clientRef: { value: 'SC-1', quote: 'SC-1', page: 2 } },
        },
        pages: [2, 3],
      },
    ])
    expect(merged.lines.map((l) => l.partNumber)).toEqual(['TEST-0001', 'TEST-0002', 'TEST-0003'])
    expect(merged.lines.map((l) => l.ord)).toEqual([1, 2, 3])
    expect(merged.lines[2]!.evidence[0]!.page).toBe(3)
    expect(merged.documentLevel.clientRef).toEqual({ value: 'SC-1', quote: 'SC-1', page: 3 })
  })
  it('sameLine', () => {
    expect(sameLine(line({}), line({}))).toBe(true)
    expect(sameLine(line({}), line({ qtyPrinted: '12' }))).toBe(false)
    expect(sameLine(line({}), line({ partNumber: 'TEST-9' }))).toBe(false)
  })
})

describe('runExtraction', () => {
  const units = unitReference(UNITS)
  const text: Chunk = {
    describe: 'Spreadsheet',
    text: '--- SHEET: S ---\nR1\tA:No\nR2\tA:1\nR3\tA:2\nR4\tA:3\nR5\tA:4',
    attachments: [],
    pages: null,
  }

  it('reads every chunk, three at a time, and sums the cost', async () => {
    const { ai, calls } = fakeAi(() => ok({ lines: [line({})], documentLevel: NO_LEVEL }))
    const r = await runExtraction({
      chunks: [text, text, text, text],
      ai,
      model: EXTRACT_MODEL,
      today: 'Wednesday',
      units,
    })
    expect(r.ok && r.lines).toHaveLength(4)
    expect(r.costUsd).toBe('0.040000')
    expect(calls[0]!.system.map((p) => p.id)).toEqual(['extract-rules', 'extract-units'])
    expect(calls[0]!.promptVersion).toBe('extract_lines@2')
  })

  it('a refusal fails the read', async () => {
    const { ai } = fakeAi(() => ({
      ok: false,
      reason: 'refusal',
      detail: 'Refused',
      costUsd: '0.001000',
      attempts: 1,
      callIds: [],
    }))
    expect(
      await runExtraction({ chunks: [text], ai, model: EXTRACT_MODEL, today: 'x', units })
    ).toMatchObject({ ok: false, reason: 'refusal' })
  })

  it('max_tokens splits a text chunk in two and reads both halves', async () => {
    let first = true
    const { ai, calls } = fakeAi(() => {
      if (first) {
        first = false
        return {
          ok: false,
          reason: 'max_tokens',
          detail: 'too long',
          costUsd: '0',
          attempts: 2,
          callIds: [],
        }
      }
      return ok({ lines: [line({})], documentLevel: NO_LEVEL })
    })
    const r = await runExtraction({ chunks: [text], ai, model: EXTRACT_MODEL, today: 'x', units })
    expect(r.ok).toBe(true)
    expect(calls).toHaveLength(3)
    // Both halves keep the sheet heading and its first row.
    expect(calls[1]!.user).toContain('R1\tA:No')
    expect(calls[2]!.user).toContain('R1\tA:No')
  })

  it('max_tokens on a PDF splits by pages', async () => {
    const bytes = fixture('rfq-3-pages.pdf')
    const [c] = await planChunks(await parsePdf(bytes), bytes)
    const halves = await splitChunk(c!)
    expect(halves!.map((h) => h.pages)).toEqual([[1, 2], [3]])
  })
})

describe('buildCandidates on the PDF fixture', () => {
  it('spans with boxes, code-read quantities, units and confidence', async () => {
    const doc = await parsePdf(fixture('rfq-3-pages.pdf'))
    const source = spanSourceOf(doc, '00000000-0000-0000-0000-000000000001')!
    const lines = [
      line({ page: 1 }),
      // The model's 12 disagrees with the printed 4: Unsure, with both readings offered.
      line({
        page: 1,
        description: 'Gate valve 4" class 150',
        partNumber: 'TEST-0002',
        qtyPrinted: '4',
        qty: 12,
        evidence: [
          {
            field: 'description',
            quote: 'Gate valve 4" class 150',
            page: 1,
            sheet: null,
            cellRef: null,
          },
          { field: 'qty', quote: '4', page: 1, sheet: null, cellRef: null },
        ],
      }),
      // A quote that is not on the page: Unsure.
      line({
        page: 2,
        description: 'Pressure relief valve',
        partNumber: null,
        evidence: [
          {
            field: 'description',
            quote: 'Pressure relief valve 3"',
            page: 2,
            sheet: null,
            cellRef: null,
          },
        ],
      }),
    ]
    const c = buildCandidates(lines, { source, units: uomTableOf(UNITS) })
    expect(c[0]).toMatchObject({
      confidence: 'sure',
      qty: '10',
      uom: 'EA',
      uomMethod: 'alias',
      sourcePage: 1,
      partMatch: 'pattern',
    })
    expect(c[0]!.spans.find((s) => s.field === 'partNumber')!.bbox).not.toBeNull()
    expect(c[1]!.confidence).toBe('unsure')
    expect(c[1]!.unsure!.options.map((o) => o.value)).toEqual(['4', '12'])
    expect(c[2]!.confidence).toBe('unsure')
    expect(c[2]!.reasons).toContain('Description not found in the document')
    expect(unsureShare(c)).toBeCloseTo(2 / 3)
  })

  it('look-alike part numbers become a choice', () => {
    const source = {
      kind: 'email' as const,
      sourceId: '00000000-0000-0000-0000-000000000002',
      text: 'Please quote 2 nos part 1O-44 bearing',
      textHash: null,
    }
    const l = line({
      description: 'bearing',
      partNumber: '1O-44',
      qtyPrinted: '2',
      qty: 2,
      evidence: [
        { field: 'description', quote: 'bearing', page: null, sheet: null, cellRef: null },
        { field: 'qty', quote: '2 nos', page: null, sheet: null, cellRef: null },
        { field: 'partNumber', quote: '1O-44', page: null, sheet: null, cellRef: null },
      ],
    })
    const match = {
      norm: '1O44',
      method: 'none' as const,
      partId: null,
      catalogueProductId: null,
      score: 0,
      seenOnRfqs: 0,
      alternatives: [],
    }
    const variant = {
      ...match,
      norm: '1044',
      method: 'exact' as const,
      partId: 'p1',
      score: 1,
      seenOnRfqs: 3,
    }
    const [c] = buildCandidates([l], {
      source,
      units: uomTableOf(UNITS),
      matches: new Map([['1O44', match]]),
      lookalikes: new Map([['1O44', [variant]]]),
    })
    expect(c!.confidence).toBe('unsure')
    expect(c!.unsure).toEqual({
      field: 'partNumber',
      question: 'Line 1 · which part number is right?',
      options: [
        { value: '1044', label: '1044', sub: 'seen on 3 past RFQs' },
        { value: '1O-44', label: '1O-44', sub: 'as read' },
      ],
    })
  })

  it('numbersIn reads the choices out of a doubt', () => {
    expect(numbersIn('Quantity is handwritten: 8 or 10?')).toEqual(['8', '10'])
  })
})
