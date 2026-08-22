import { describe, expect, it } from 'vitest'
import {
  buildApplicationContext,
  enquiryUrgency,
  marketEnquirySubject,
  normaliseIncoterm,
  normaliseNeededBy,
  splitContactName,
} from './market-enquiry'
import { MARKET_INCOTERM_OPTIONS, MARKET_URGENCY_OPTIONS } from './market-pages'

describe('enquiryUrgency', () => {
  it('escalates the two that are actually waiting on stock', () => {
    expect(enquiryUrgency('From stock — urgent')).toBe('priority')
    expect(enquiryUrgency('Within a week')).toBe('priority')
  })

  it('leaves planned and budgetary work in the routine queue', () => {
    expect(enquiryUrgency('Planned shutdown')).toBe('routine')
    expect(enquiryUrgency('Budgetary only')).toBe('routine')
  })

  it('never raises plant_down from a form', () => {
    // plant_down escalates to a 24/7 phone rotation. A buyer four weeks of sea
    // freight away is not in that situation, and a form that could raise the
    // flag would teach the desk to ignore it.
    for (const option of MARKET_URGENCY_OPTIONS) {
      expect(enquiryUrgency(option)).not.toBe('plant_down')
    }
  })

  it('falls back to routine for anything unrecognised', () => {
    expect(enquiryUrgency(null)).toBe('routine')
    expect(enquiryUrgency('yesterday, obviously')).toBe('routine')
  })

  it('covers every option the form offers', () => {
    // A new option added to the select without a mapping here would silently
    // land every enquiry that picks it in the routine queue.
    for (const option of MARKET_URGENCY_OPTIONS) {
      expect(['routine', 'priority']).toContain(enquiryUrgency(option))
    }
  })
})

describe('normaliseIncoterm', () => {
  it('accepts what the form offered', () => {
    for (const option of MARKET_INCOTERM_OPTIONS) {
      expect(normaliseIncoterm(option)).toBe(option)
    }
  })

  it('rejects anything else rather than storing it', () => {
    // A select is trivially edited in the browser and this value lands in a
    // column the desk quotes against. Null reads as "advise us", which is the
    // safe interpretation of an Incoterm we cannot trust.
    expect(normaliseIncoterm('DDP — you pay the duty')).toBeNull()
    expect(normaliseIncoterm('')).toBeNull()
    expect(normaliseIncoterm(undefined)).toBeNull()
  })
})

describe('normaliseNeededBy', () => {
  it('accepts what the form offered and rejects the rest', () => {
    expect(normaliseNeededBy('Planned shutdown')).toBe('Planned shutdown')
    expect(normaliseNeededBy('URGENT!!! plant down')).toBeNull()
  })
})

describe('splitContactName', () => {
  it('splits on the first space', () => {
    expect(splitContactName('Adaeze Okonkwo')).toEqual({ firstName: 'Adaeze', lastName: 'Okonkwo' })
  })

  it('keeps compound surnames whole', () => {
    expect(splitContactName('Maria del Carmen Ruiz')).toEqual({
      firstName: 'Maria',
      lastName: 'del Carmen Ruiz',
    })
  })

  it('handles a mononym without inventing a surname', () => {
    expect(splitContactName('Ade')).toEqual({ firstName: 'Ade', lastName: '' })
  })

  it('tolerates ragged whitespace', () => {
    expect(splitContactName('  Chidi   Eze  ')).toEqual({ firstName: 'Chidi', lastName: 'Eze' })
    expect(splitContactName('   ')).toEqual({ firstName: '', lastName: '' })
  })
})

describe('buildApplicationContext', () => {
  it('leads with the market and always records the source', () => {
    const context = buildApplicationContext({
      marketName: 'Nigeria',
      countryCode: 'NG',
      deliveryCity: 'Port Harcourt',
      neededBy: 'From stock — urgent',
      wantsChecklist: true,
      source: 'market_quote_form',
    })
    expect(context.split('\n')).toEqual([
      'Export market: Nigeria (NG)',
      'Delivery city: Port Harcourt',
      'Needed by: From stock — urgent',
      'Wants the Nigeria conformity checklist',
      'Source: market page — quote form',
    ])
  })

  it('omits what the short form never asked for', () => {
    // The closing card collects five fields. Empty lines in the alert email
    // read as missing data rather than a field that was never offered.
    const context = buildApplicationContext({
      marketName: 'Nigeria',
      countryCode: 'NG',
      source: 'market_quick_enquiry',
    })
    expect(context.split('\n')).toEqual([
      'Export market: Nigeria (NG)',
      'Source: market page — quick enquiry',
    ])
  })

  it('distinguishes all three forms, so the split is countable', () => {
    const base = { marketName: 'Nigeria', countryCode: 'NG' } as const
    const long = buildApplicationContext({ ...base, source: 'market_quote_form' })
    const short = buildApplicationContext({ ...base, source: 'market_quick_enquiry' })
    const index = buildApplicationContext({ marketName: 'Nigeria', source: 'markets_index_enquiry' })
    expect(new Set([long, short, index]).size).toBe(3)
  })

  it('flags an index enquiry as an unverified destination', () => {
    /*
      The index form's destination field is free text, so the name in the
      first line is whatever the buyer typed and may not be a lane we run at
      all. Saying so in line two is what stops the desk quoting freight for a
      country nobody has checked — and it is the reason `countryCode` is
      optional rather than filled in with a fuzzy match.
    */
    const context = buildApplicationContext({
      marketName: 'Mongolia',
      source: 'markets_index_enquiry',
    })
    expect(context.split('\n')).toEqual([
      'Export market: Mongolia',
      'Destination typed by the buyer — not a listed market. Confirm the lane before quoting.',
      'Source: markets index — destination enquiry',
    ])
  })

  it('does not flag a market-page enquiry, which came from a real market', () => {
    const context = buildApplicationContext({
      marketName: 'Nigeria',
      countryCode: 'NG',
      source: 'market_quick_enquiry',
    })
    expect(context).not.toContain('typed by the buyer')
  })
})

describe('marketEnquirySubject', () => {
  it('names the market', () => {
    expect(marketEnquirySubject('Nigeria')).toBe('Export enquiry — Nigeria')
  })
})
