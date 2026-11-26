import { describe, expect, it } from 'vitest'
import {
  columnTotal,
  compactMoney,
  pipelineCoverage,
  pipelineMoves,
  pipelineRefusal,
  type PipelineCardInput,
} from './pipeline-card'

const base: PipelineCardInput = {
  stageGroup: 'enquiry',
  linesTotal: 6,
  linesSent: 0,
  linesQuoted: 0,
  quotationNumber: null,
  quotationStatus: null,
  quotationClientStatus: null,
  clientPoRef: null,
}

describe('pipelineCoverage (board 04)', () => {
  it.each([
    [{}, { pct: 0, label: '0 / 6 sent' }],
    [
      { stageGroup: 'sourcing', linesTotal: 34, linesSent: 25 },
      { pct: 74, label: '25 / 34 sent' },
    ],
    [
      { stageGroup: 'quotes_in', linesTotal: 12, linesQuoted: 11 },
      { pct: 92, label: '11 / 12 quoted' },
    ],
    [
      { stageGroup: 'quoted', quotationNumber: 'INDUS/Q10001', quotationStatus: 'sent' },
      { pct: 100, label: 'INDUS/Q10001 sent' },
    ],
    [
      { stageGroup: 'quoted', quotationNumber: 'INDUS/Q10001-R2', quotationStatus: 'viewed' },
      { pct: 100, label: 'INDUS/Q10001-R2 viewed' },
    ],
    [
      { stageGroup: 'quoted', linesTotal: 7, linesQuoted: 7 },
      { pct: 100, label: '7 / 7 quoted' },
    ],
    [
      {
        stageGroup: 'negotiation',
        quotationNumber: 'INDUS/Q10002-R2',
        quotationClientStatus: 'asked_for_discount',
      },
      { pct: 100, label: 'INDUS/Q10002-R2 · price review' },
    ],
    [
      { stageGroup: 'negotiation', quotationNumber: 'INDUS/Q10002' },
      { pct: 100, label: 'INDUS/Q10002' },
    ],
    [{ stageGroup: 'negotiation' }, { pct: 100, label: 'In negotiation' }],
    [
      { stageGroup: 'won', clientPoRef: 'PO-SCL-0001' },
      { pct: 100, label: 'PO-SCL-0001' },
    ],
    [{ stageGroup: 'won' }, { pct: 100, label: 'Won' }],
    [{ stageGroup: 'ended' }, { pct: 0, label: 'Closed' }],
    [
      { stageGroup: 'sourcing', linesTotal: 0 },
      { pct: 0, label: '0 / 0 sent' },
    ],
  ] as const)('%o → %o', (over, want) => {
    expect(pipelineCoverage({ ...base, ...over })).toEqual(want)
  })
})

describe('compact money', () => {
  it.each([
    ['86000.0000', 'USD', '$86K'],
    ['1250000', 'USD', '$1.3M'],
    ['2000000', 'EUR', '€2M'],
    ['999', 'GBP', '£999'],
    ['450000', 'AED', 'AED 450K'],
  ])('%s %s → %s', (a, c, want) => expect(compactMoney(a, c)).toBe(want))
  it('null without a value', () => {
    expect(compactMoney(null, 'USD')).toBeNull()
    expect(compactMoney('1', null)).toBeNull()
    expect(compactMoney('abc', 'USD')).toBeNull()
  })
  it('column totals per currency, exact before rounding', () => {
    expect(
      columnTotal([
        { amount: '86000.40', currency: 'USD' },
        { amount: '142000.60', currency: 'USD' },
        { amount: '90000', currency: 'AED' },
        { amount: null, currency: 'USD' },
        { amount: 'x', currency: 'USD' },
      ])
    ).toBe('$228K + AED 90K')
    expect(columnTotal([])).toBe('—')
    expect(columnTotal([{ amount: '-5.4', currency: 'USD' }])).toBe('$-5')
  })
})

describe('pipelineMoves', () => {
  it('lists only the columns the machine allows', () => {
    expect(pipelineMoves('new', {})).toEqual([])
    expect(pipelineMoves('new', { chosenPath: 'quote_fully' })).toEqual(['sourcing'])
    expect(pipelineMoves('sourcing', {})).toEqual(['quotes_in'])
    expect(pipelineMoves('quotes_in', {})).toEqual([])
    expect(pipelineMoves('pricing', { hasSentQuotation: true })).toEqual(['quoted'])
    expect(pipelineMoves('quoted', {})).toEqual(['negotiation'])
    expect(pipelineMoves('negotiation', {})).toEqual(['quotes_in'])
    expect(pipelineMoves('lost', { actorRole: 'owner', reopen: true })).toEqual(['enquiry'])
    expect(pipelineMoves('won', {})).toEqual([])
  })
  it('refusals carry the reason', () => {
    expect(pipelineRefusal('new', 'won', {})).toBe('Record the client PO to mark it Won')
    expect(pipelineRefusal('new', 'quoted', {})).toBe('New cannot move to Quoted')
    expect(pipelineRefusal('new', 'sourcing', {})).toBe(
      'Choose a path on the qualification card first'
    )
    expect(pipelineRefusal('sourcing', 'quotes_in', {})).toBeNull()
  })
})
