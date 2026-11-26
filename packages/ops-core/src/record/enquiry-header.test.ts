import { describe, expect, it } from 'vitest'
import { ENQUIRY_STAGES } from '../state/labels'
import {
  needSentence,
  pastTense,
  resolveEnquiryHeader,
  type EnquiryHeaderCounts,
  type EnquiryHeaderInput,
} from './enquiry-header'

const COUNTS: EnquiryHeaderCounts = {
  linesTotal: 12,
  held: 0,
  noSource: 0,
  toFollow: 0,
  rfqsSent: 0,
  quotesCaptured: 0,
  openQuestions: 0,
  questionLines: 0,
}
const ID = '00000000-0000-7000-8000-000000000001'
const input = (over: Partial<EnquiryHeaderInput> = {}): EnquiryHeaderInput => ({
  id: ID,
  ref: 'ENQ-2026-0001',
  stage: 'new',
  tab: 'overview',
  counts: COUNTS,
  done: [],
  pending: 0,
  viewerRole: 'owner',
  ...over,
})
const R = '/enquiries/ENQ-2026-0001'

describe('resolveEnquiryHeader', () => {
  it.each([
    ['new', { label: 'Choose path', href: `${R}#qualification` }],
    ['qualifying', { label: 'Choose path', href: `${R}#qualification` }],
    ['sourcing', { label: 'Send RFQs', href: `${R}/rfqs` }],
    ['quotes_in', { label: 'Compare quotes', href: `${R}/compare` }],
    ['pricing', { label: 'Price', href: `${R}/pricing` }],
    ['quoted', { label: 'Log activity', href: '?log=1' }],
    ['negotiation', { label: 'Log activity', href: '?log=1' }],
    ['won', { label: 'Open order', href: `${R}/quotation` }],
    ['lost', { label: 'Reopen', href: `${R}?reopen=1` }],
    ['regretted', { label: 'Reopen', href: `${R}?reopen=1` }],
    ['closed', { label: 'Reopen', href: `${R}?reopen=1` }],
  ] as const)('%s → CTA %o', (stage, cta) => {
    expect(resolveEnquiryHeader(input({ stage })).cta).toEqual(cta)
  })

  it('won opens the order when there is one; a Helper gets no Reopen', () => {
    expect(resolveEnquiryHeader(input({ stage: 'won', orderRef: 'SO-0001' })).cta).toEqual({
      label: 'Open order',
      href: '/orders/SO-0001',
    })
    for (const stage of ['lost', 'regretted', 'closed'] as const)
      expect(resolveEnquiryHeader(input({ stage, viewerRole: 'helper' })).cta).toBeNull()
  })

  it('the Questions tab asks for a question while the enquiry is open', () => {
    expect(resolveEnquiryHeader(input({ stage: 'sourcing', tab: 'questions' })).cta).toEqual({
      label: 'Add question',
      href: `${R}/questions?add=1`,
    })
    expect(resolveEnquiryHeader(input({ stage: 'lost', tab: 'questions' })).cta?.label).toBe(
      'Reopen'
    )
  })

  it.each([
    [
      { openQuestions: 2, questionLines: 3 },
      { tone: 'warn', label: 'Waiting on client · 3 lines' },
    ],
    [
      { openQuestions: 1, questionLines: 1 },
      { tone: 'warn', label: 'Waiting on client · 1 line' },
    ],
    [{ noSource: 2 }, { tone: 'bad', label: 'No source · 2' }],
    [{ toFollow: 4 }, { tone: 'warn', label: '4 to follow' }],
    [{}, undefined],
  ])('chip for %o', (c, chip) => {
    expect(resolveEnquiryHeader(input({ counts: { ...COUNTS, ...c } })).chip).toEqual(chip)
  })

  it('did: up to three done actions in the past tense, else the creation sentence', () => {
    expect(resolveEnquiryHeader(input()).did).toBe('created with 12 lines')
    expect(resolveEnquiryHeader(input({ counts: { ...COUNTS, linesTotal: 1 } })).did).toBe(
      'created with 1 line'
    )
    expect(
      resolveEnquiryHeader(
        input({
          done: [
            'Acknowledge Sample Client LLC: ENQ-2026-0001, revert by 26 Sep',
            'Send 4 RFQs',
            'Chase Example Valve Co',
            'Link one email',
          ],
        })
      ).did
    ).toBe(
      'acknowledged Sample Client LLC: ENQ-2026-0001, revert by 26 Sep, sent 4 RFQs, chased Example Valve Co'
    )
  })

  it('need links Review filtered by the enquiry; a new enquiry asks for a path', () => {
    expect(resolveEnquiryHeader(input()).need).toEqual({
      count: 0,
      href: `${R}#qualification`,
      label: 'choose a path',
    })
    expect(resolveEnquiryHeader(input({ stage: 'sourcing' })).need).toBeNull()
    expect(resolveEnquiryHeader(input({ pending: 2 })).need).toEqual({
      count: 2,
      href: `/review?record=${encodeURIComponent(`enquiry:${ID}`)}`,
    })
    expect(needSentence(1)).toBe('1 thing needs you →')
    expect(needSentence(3)).toBe('3 things need you →')
  })

  it('stage track: current on the C7 word, done before it; ended stages light the last step', () => {
    const t = (stage: (typeof ENQUIRY_STAGES)[number]) =>
      resolveEnquiryHeader(input({ stage })).stageTrack.map((s) => `${s.label}:${s.state}`)
    expect(t('pricing')).toEqual([
      'Enquiry:done',
      'Sourcing:done',
      'Quotes in:current',
      'Quoted:todo',
      'Negotiation:todo',
      'Won:todo',
    ])
    expect(t('regretted').at(-1)).toBe('Regretted:current')
    expect(t('closed').at(-1)).toBe('Lost:current')
    expect(t('won').at(-1)).toBe('Won:current')
    expect(resolveEnquiryHeader(input({ stage: 'qualifying' })).stageLabel).toBe('Enquiry')
  })

  it('pastTense keeps unknown verbs, lower-cased', () => {
    expect(pastTense('Reply to Sample Buyer')).toBe('replied to Sample Buyer')
    expect(pastTense('Tidy RFQ')).toBe('tidy RFQ')
    expect(pastTense('')).toBe('')
  })
})
