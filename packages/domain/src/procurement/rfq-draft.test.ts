import { describe, expect, it } from 'vitest'

import { renderRfqDraft, type RfqDraftInput } from './rfq-draft'

function input(over: Partial<RfqDraftInput> = {}): RfqDraftInput {
  return {
    supplierName: 'Acme Valves GmbH',
    enquiryCode: 'ENQ-2026-0007',
    lines: [
      {
        position: 1,
        description: 'GATE VALVE 6 INCH 300LB CAST STEEL FLANGED',
        qty: 4,
        unit: 'NOS',
        partNumber: null,
        certification: '3.1 MTC',
      },
      {
        position: 2,
        description: 'BLIND FLANGE 4 INCH',
        qty: 2,
        unit: 'NOS',
        partNumber: 'BF-4-300',
        certification: null,
      },
    ],
    closingAt: '2026-09-05T00:00:00.000Z',
    senderName: 'Ayush Bhatia',
    senderTitle: 'Director',
    companyName: 'Indus Hydraulic Power Trading LLC',
    senderEmail: 'sales@indushydraulics.me',
    senderPhone: '+971 52 2477942',
    destination: 'the UAE',
    ...over,
  }
}

describe('subject', () => {
  it('carries the reference and the item count', () => {
    expect(renderRfqDraft(input()).subject).toContain('ENQ-2026-0007')
    expect(renderRfqDraft(input()).subject).toContain('2 items')
  })

  it('singularises a one-item enquiry', () => {
    const one = input({ lines: [input().lines[0]!] })
    expect(renderRfqDraft(one).subject).toContain('1 item')
    expect(renderRfqDraft(one).subject).not.toContain('1 items')
  })

  it('writes the date unambiguously rather than as DD/MM', () => {
    expect(renderRfqDraft(input()).subject).toContain('5 September 2026')
  })

  it('omits the deadline clause when there is no closing date', () => {
    expect(renderRfqDraft(input({ closingAt: null })).subject).not.toContain('required by')
  })

  it('omits the deadline clause when the date is unparseable', () => {
    expect(renderRfqDraft(input({ closingAt: 'not-a-date' })).subject).not.toContain('required by')
  })
})

describe('body', () => {
  it('addresses the supplier by name', () => {
    expect(renderRfqDraft(input()).body).toContain('Dear Acme Valves GmbH team,')
  })

  it('lists every item with quantity', () => {
    const body = renderRfqDraft(input()).body
    expect(body).toContain('1. GATE VALVE 6 INCH 300LB CAST STEEL FLANGED')
    expect(body).toContain('Quantity: 4 NOS')
    expect(body).toContain('2. BLIND FLANGE 4 INCH')
  })

  it('carries the part number when one is known', () => {
    expect(renderRfqDraft(input()).body).toContain('Part no: BF-4-300')
  })

  it('states the certification requirement on the line that has one', () => {
    expect(renderRfqDraft(input()).body).toContain('Certification required: 3.1 MTC')
  })

  it('says "qty to confirm" rather than inventing a quantity', () => {
    const unknown = input({
      lines: [{ ...input().lines[0]!, qty: null, unit: null }],
    })
    const body = renderRfqDraft(unknown).body
    expect(body).toContain('qty to confirm')
    expect(body).not.toMatch(/Quantity: (0|1)\b/)
  })

  it('asks for everything the comparison step needs', () => {
    const body = renderRfqDraft(input()).body
    for (const ask of ['Unit price', 'Minimum order quantity', 'Lead time', 'Incoterm', 'Validity']) {
      expect(body).toContain(ask)
    }
  })

  it('asks the supplier to say so rather than silently omitting an item', () => {
    expect(renderRfqDraft(input()).body).toContain('a silent gap is not')
  })

  it('carries our reference so replies can be attributed back', () => {
    expect(renderRfqDraft(input()).body).toContain('Our reference: ENQ-2026-0007')
  })

  it('signs off with the real sender and company', () => {
    const body = renderRfqDraft(input()).body
    expect(body).toContain('Ayush Bhatia')
    expect(body).toContain('Director')
    expect(body).toContain('Indus Hydraulic Power Trading LLC')
    expect(body).toContain('sales@indushydraulics.me')
  })

  it('omits the title and phone lines cleanly when absent', () => {
    const body = renderRfqDraft(input({ senderTitle: null, senderPhone: null })).body
    expect(body).toContain('Ayush Bhatia')
    expect(body).not.toContain('null')
    expect(body).not.toContain('undefined')
  })

  it('is plain text — no HTML tags', () => {
    expect(renderRfqDraft(input()).body).not.toMatch(/<[a-z][\s>]/i)
  })
})

describe('mailto', () => {
  it('encodes the recipient, subject and body', () => {
    const url = renderRfqDraft(input()).mailtoUrl('sales@acme-valves.de')
    expect(url.startsWith('mailto:sales%40acme-valves.de?')).toBe(true)
    expect(url).toContain('subject=')
    expect(url).toContain('body=')
  })

  it('escapes newlines so the body survives the URL', () => {
    const url = renderRfqDraft(input()).mailtoUrl('a@b.com')
    expect(url).toContain('%0A')
    expect(url).not.toMatch(/\n/)
  })
})
