import { describe, expect, it } from 'vitest'
import { locateQuote } from './locate-quote'
import { desiredLabels, handledState, labelDiff, MANAGED_LABEL_KINDS } from './pipeline-rules'

describe('handledState', () => {
  it.each([
    [
      { classification: 'client_enquiry', confidence: 'unsure', linked: 0, openProposal: true },
      'unsure',
    ],
    [{ classification: 'unclassified', confidence: null, linked: 0, openProposal: true }, 'unsure'],
    [
      { classification: 'client_enquiry', confidence: 'sure', linked: 1, openProposal: true },
      'needs_you',
    ],
    [
      { classification: 'not_business', confidence: 'sure', linked: 0, openProposal: false },
      'handled',
    ],
    [
      { classification: 'auto_reply', confidence: 'sure', linked: 0, openProposal: false },
      'handled',
    ],
    [{ classification: 'bounce', confidence: 'sure', linked: 0, openProposal: false }, 'handled'],
    [{ classification: 'phishing', confidence: 'sure', linked: 0, openProposal: false }, 'handled'],
    [
      { classification: 'supplier_quote', confidence: 'sure', linked: 1, openProposal: false },
      'handled',
    ],
    [
      {
        classification: 'supplier_quote',
        confidence: 'sure',
        linked: 1,
        openProposal: false,
        downstreamPending: true,
      },
      'needs_you',
    ],
    [
      { classification: 'client_reply', confidence: 'likely', linked: 0, openProposal: false },
      'not_linked',
    ],
  ] as const)('%o → %s', (input, expected) => {
    expect(handledState(input)).toBe(expected)
  })
})

describe('desiredLabels (08-map §1.8)', () => {
  const base = {
    confidence: 'sure',
    mailboxRole: 'client',
    linkedTypes: [],
    openReviewCard: false,
  } as const
  it.each([
    [{ ...base, classification: 'client_enquiry', linkedTypes: ['enquiry'] }, ['enquiry']],
    [{ ...base, classification: 'client_enquiry' }, []],
    [{ ...base, classification: 'client_reply' }, ['clientReply']],
    [{ ...base, classification: 'client_po' }, ['po']],
    [{ ...base, classification: 'supplier_quote', mailboxRole: 'supplier' }, ['supplierQuote']],
    [{ ...base, classification: 'supplier_quote', mailboxRole: 'client' }, []],
    [
      { ...base, classification: 'supplier_question', mailboxRole: 'supplier' },
      ['supplierQuestion'],
    ],
    [{ ...base, classification: 'not_business' }, ['notBusiness']],
    [{ ...base, classification: 'phishing' }, ['notBusiness']],
    [
      { ...base, classification: 'client_reply', openReviewCard: true },
      ['clientReply', 'needsOwner'],
    ],
    [
      { ...base, classification: 'client_reply', confidence: 'unsure', openReviewCard: true },
      ['needsOwner'],
    ],
    [{ ...base, classification: 'auto_reply' }, []],
  ] as const)('%#', (input, expected) => {
    expect(desiredLabels(input)).toEqual(expected)
  })

  it('never manages Indus/Ignore', () => {
    expect(MANAGED_LABEL_KINDS).not.toContain('ignore')
  })
})

describe('labelDiff', () => {
  it('adds and removes managed ids only, never a system label', () => {
    const managed = ['L_enq', 'L_reply', 'L_nb']
    expect(
      labelDiff({
        desired: ['L_reply', 'INBOX'],
        applied: ['L_enq', 'UNREAD', 'IMPORTANT'],
        managed,
      })
    ).toEqual({ add: ['L_reply'], remove: ['L_enq'] })
    expect(labelDiff({ desired: ['L_nb'], applied: ['L_nb'], managed })).toEqual({
      add: [],
      remove: [],
    })
  })
})

describe('locateQuote', () => {
  const text =
    'Dear team,\n\nPlease  quote 10 pcs ball valve 2 inch, class 300.\nDelivery Jebel Ali.\n'
  it('finds an exact quote through whitespace and case differences, with original offsets', () => {
    const r = locateQuote(text, 'please quote 10 pcs BALL VALVE')
    expect(r.resolved).toBe('exact')
    if (r.resolved === 'unresolved') return
    expect(text.slice(r.charStart, r.charEnd)).toBe('Please  quote 10 pcs ball valve')
  })
  it('finds a near quote within 10 % edits', () => {
    const r = locateQuote(text, 'Please quote 10 pcs ball valves 2 inch class 300')
    expect(r.resolved).toBe('fuzzy')
  })
  it.each(['completely different words here', 'ab', ''])('does not resolve %s', (q) => {
    expect(locateQuote(text, q).resolved).toBe('unresolved')
  })
})
