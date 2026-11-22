import { describe, expect, it } from 'vitest'
import {
  enquiryTrackStage,
  needLabel,
  ORDER_TRACK_STAGES,
  orderTrackStage,
  recordBaseHref,
  resolveHeaderState,
  reviewHrefForRecord,
  type HeaderMeta,
  type RecordHeaderInput,
} from './header-state'
import { ENQUIRY_STAGES, ORDER_STAGES } from './labels'

const META: readonly [HeaderMeta, HeaderMeta, HeaderMeta, HeaderMeta] = [
  { label: 'Client', value: 'Sample Client LLC' },
  { label: 'Client ref', value: 'SCL/0001' },
  { label: 'Received', value: '14 Sep' },
  { label: 'Client deadline', value: '30 Sep · 8 days left', tone: 'bad' },
]

const enquiry = (over: Partial<RecordHeaderInput> = {}): RecordHeaderInput => ({
  kind: 'enquiry',
  ref: 'ENQ-2026-0001',
  clientName: 'Sample Client LLC',
  clientHref: '/clients/1',
  title: 'Plant spares',
  meta: META,
  stage: 'new',
  ...over,
})

describe('C7 display stage', () => {
  it.each([
    ['new', 'Enquiry'],
    ['qualifying', 'Enquiry'],
    ['sourcing', 'Sourcing'],
    ['quotes_in', 'Quotes in'],
    ['pricing', 'Quotes in'],
    ['quoted', 'Quoted'],
    ['negotiation', 'Negotiation'],
    ['won', 'Won'],
    ['lost', 'Lost'],
    ['regretted', 'Regretted'],
    ['closed', 'Lost'],
  ] as const)('enquiry %s → %s', (stored, word) => {
    expect(enquiryTrackStage(stored)).toBe(word)
  })

  it('covers every stored enquiry stage', () => {
    for (const s of ENQUIRY_STAGES) expect(enquiryTrackStage(s)).toBeTruthy()
  })

  it('maps every stored order stage onto the nine-stage track', () => {
    for (const s of ORDER_STAGES) expect(ORDER_TRACK_STAGES).toContain(orderTrackStage(s))
    expect(orderTrackStage('freight')).toBe('Freight')
    expect(orderTrackStage('closed')).toBe('Paid')
    expect(orderTrackStage('cancelled')).toBe('Confirmed')
  })
})

describe('resolveHeaderState', () => {
  it('maps the stage by kind (closed is in both enums)', () => {
    expect(resolveHeaderState(enquiry({ stage: 'closed' })).stage).toEqual({
      flow: 'enquiry',
      current: 'Lost',
    })
    expect(
      resolveHeaderState(enquiry({ kind: 'order', ref: 'SO-0001', stage: 'closed' })).stage
    ).toEqual({ flow: 'order', current: 'Paid' })
    expect(resolveHeaderState(enquiry({ kind: 'tender', stage: 'pricing' })).stage).toEqual({
      flow: 'enquiry',
      current: 'Quotes in',
    })
  })

  it('refuses a stage from the other enum', () => {
    expect(() => resolveHeaderState(enquiry({ stage: 'freight' }))).toThrow('not an enquiry stage')
    expect(() => resolveHeaderState(enquiry({ kind: 'order', stage: 'pricing' }))).toThrow(
      'not an order stage'
    )
  })

  it('fills placeholders: crumb ref, Next step CTA, no need without a count', () => {
    const s = resolveHeaderState(enquiry())
    expect(s.enquiryRef).toBe('ENQ-2026-0001')
    expect(s.cta).toEqual({ label: 'Next step', href: '/enquiries/ENQ-2026-0001' })
    expect(s.need).toBeUndefined()
    expect(s.chip).toBeUndefined()
  })

  it('keeps the ENQ ref on an order and routes it by SO number (C11)', () => {
    const s = resolveHeaderState(
      enquiry({ kind: 'order', ref: 'SO-0001', enquiryRef: 'ENQ-2026-0001', stage: 'freight' })
    )
    expect(s.enquiryRef).toBe('ENQ-2026-0001')
    expect(s.cta).toEqual({ label: 'Next step', href: '/orders/SO-0001' })
  })

  it('links the need count to Review filtered by the record', () => {
    const s = resolveHeaderState(enquiry({ needCount: 2 }))
    expect(s.need).toEqual({ count: 2, href: '/review?record=ENQ-2026-0001' })
  })

  it('adds a Cancelled chip to a cancelled order unless a chip is given', () => {
    const o = enquiry({ kind: 'order', ref: 'SO-0001', stage: 'cancelled' })
    expect(resolveHeaderState(o).chip).toEqual({ label: 'Cancelled', tone: 'bad' })
    expect(resolveHeaderState({ ...o, chip: { label: 'Bank change', tone: 'warn' } }).chip).toEqual(
      { label: 'Bank change', tone: 'warn' }
    )
  })
})

describe('helpers', () => {
  it('builds hrefs and labels', () => {
    expect(reviewHrefForRecord('ENQ-2026-0001')).toBe('/review?record=ENQ-2026-0001')
    expect(recordBaseHref('tender', 'ENQ-2026-0001')).toBe('/enquiries/ENQ-2026-0001')
    expect(recordBaseHref('order', 'SO-0001')).toBe('/orders/SO-0001')
    expect(needLabel(1)).toBe('1 thing needs you')
    expect(needLabel(3)).toBe('3 things need you')
  })
})
