import { describe, expect, it } from 'vitest'
import type { HolidayRow, WeekendTable } from '../calendar/working-day'
import { instantAt, wallTime } from '../calendar/zoned'
import {
  CANCELLABLE,
  canTransitionOutbound,
  OUTBOUND_STATUSES,
  outboundTransitions,
  type OutboundStatusValue,
} from '../state/outbound-email-state'
import { countryFromAddress, DEFAULT_COUNTRY_WEEKENDS } from '../calendar/weekends'
import { capWindow, defaultDailyCap, overCap } from './caps'
import { aliasAllowed, allRecipients, normaliseEnvelope, OUTBOUND_HEADER } from './envelope'
import {
  audienceForKind,
  nextSendSlot,
  tzForCountry,
  type Audience,
  type SendTimingRules,
} from './next-send-slot'
import { isPricedDocument, isPricedKind } from './priced'
import { proposedMessageId, replyReferences, replySubject } from './threading'

const RULES: SendTimingRules = {
  clientHours: { start: '09:00', end: '18:00' },
  window: { after: '19:00', releaseAt: '08:30' },
  ramadanHours: { start: '10:00', end: '15:00' },
  supplierMorning: { start: '09:00', end: '11:00' },
  chaserNoFridayAfter: '15:00',
}

const WEEKENDS: WeekendTable = {
  default: [6, 0],
  byCountry: {
    AE: [6, 0],
    SA: [5, 6],
    OM: [5, 6],
    KW: [5, 6],
    QA: [5, 6],
    BH: [5, 6],
    EG: [5, 6],
    IR: [4, 5],
  },
}

const ae = (date: string, name = 'Holiday'): HolidayRow => ({
  country: 'AE',
  date,
  kind: 'public_holiday',
  ...{ name },
})
const HOLIDAYS: HolidayRow[] = [
  ae('2026-11-30'),
  ae('2026-12-02'),
  ae('2026-12-03'),
  ae('2027-03-09'),
  ae('2027-03-10'),
  ae('2027-03-11'),
]
for (
  let d = new Date(Date.UTC(2027, 1, 8));
  d <= new Date(Date.UTC(2027, 2, 8));
  d = new Date(d.getTime() + 86_400_000)
) {
  HOLIDAYS.push({
    country: 'AE',
    date: d.toISOString().slice(0, 10),
    kind: 'ramadan',
    hoursStart: '10:00',
    hoursEnd: '15:00',
  })
}

/** A local wall time in a zone → the UTC instant. */
function local(when: string, tz: string): Date {
  const [d, t] = when.split(' ') as [string, string]
  const [y, m, day] = d.split('-').map(Number) as [number, number, number]
  const [h, mi] = t.split(':').map(Number) as [number, number]
  return instantAt({ year: y, month: m, day }, h, mi, tz)
}

type Row = [
  label: string,
  now: string,
  tz: string,
  audience: Audience,
  kind: string,
  country: string,
  expected: string,
  reason?: string,
  ooo?: string,
]

const ROWS: Row[] = [
  // ── Client (sales@, UAE): guardrail hours first, then the window ──
  [
    'client Friday 18:30 → Monday release',
    '2026-11-20 18:30',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-11-23 08:30',
    'client_release',
  ],
  [
    'client Monday 10:00 → now',
    '2026-11-23 10:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    'now',
    'now',
  ],
  [
    'client before the release → today 08:30',
    '2026-11-23 08:15',
    'Asia/Dubai',
    'client',
    'follow_up',
    'AE',
    '2026-11-23 08:30',
    'client_release',
  ],
  [
    'client 08:45 (release open) → now',
    '2026-11-23 08:45',
    'Asia/Dubai',
    'client',
    'follow_up',
    'AE',
    'now',
    'now',
  ],
  [
    'client 17:59 → now',
    '2026-11-23 17:59',
    'Asia/Dubai',
    'client',
    'client_acknowledgement',
    'AE',
    'now',
    'now',
  ],
  [
    'client 18:00 → next release',
    '2026-11-23 18:00',
    'Asia/Dubai',
    'client',
    'client_acknowledgement',
    'AE',
    '2026-11-24 08:30',
    'client_release',
  ],
  [
    'client composed after 19:00 → 08:30 next working day',
    '2026-11-23 19:30',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-11-24 08:30',
    'client_release',
  ],
  [
    'client Saturday → Monday',
    '2026-11-21 11:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-11-23 08:30',
    'client_release',
  ],
  [
    'client Sunday 23:00 → Monday',
    '2026-11-22 23:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-11-23 08:30',
    'client_release',
  ],
  [
    'client Friday night before a Monday holiday → Tuesday',
    '2026-11-27 20:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-12-01 08:30',
    'client_release',
  ],
  [
    'client on a UAE holiday → next working day',
    '2026-11-30 11:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-12-01 08:30',
    'client_release',
  ],
  [
    'client before National Day → Friday',
    '2026-12-01 19:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2026-12-04 08:30',
    'client_release',
  ],
  [
    'client Ramadan 09:00 → 10:00',
    '2027-02-08 09:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2027-02-08 10:00',
    'client_ramadan_release',
  ],
  [
    'client Ramadan noon → now',
    '2027-02-08 12:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    'now',
    'now',
  ],
  [
    'client Ramadan 15:30 → next day 10:00',
    '2027-02-08 15:30',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2027-02-09 10:00',
    'client_ramadan_release',
  ],
  [
    'client Friday before Ramadan → Monday 10:00',
    '2027-02-05 19:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2027-02-08 10:00',
    'client_ramadan_release',
  ],
  [
    'client last Ramadan day → after Eid, 08:30',
    '2027-03-08 16:00',
    'Asia/Dubai',
    'client',
    'quotation',
    'AE',
    '2027-03-12 08:30',
    'client_release',
  ],
  // ── Supplier and forwarder (purchase@): local morning 09:00–11:00 on a local working day ──
  [
    'Saudi Saturday is weekend → Sunday 09:00',
    '2026-11-21 09:30',
    'Asia/Riyadh',
    'supplier',
    'supplier_rfq',
    'SA',
    '2026-11-22 09:00',
    'supplier_morning',
  ],
  [
    'UAE Saturday is weekend → Monday 09:00',
    '2026-11-21 09:30',
    'Asia/Dubai',
    'supplier',
    'supplier_rfq',
    'AE',
    '2026-11-23 09:00',
    'supplier_morning',
  ],
  [
    'Saudi Sunday 10:00 → now',
    '2026-11-22 10:00',
    'Asia/Riyadh',
    'supplier',
    'supplier_rfq',
    'SA',
    'now',
    'now',
  ],
  [
    'Tokyo before 09:00 → 09:00',
    '2026-11-23 08:00',
    'Asia/Tokyo',
    'supplier',
    'supplier_rfq',
    'JP',
    '2026-11-23 09:00',
    'supplier_morning',
  ],
  [
    'Tokyo 10:30 → now',
    '2026-11-23 10:30',
    'Asia/Tokyo',
    'supplier',
    'supplier_rfq',
    'JP',
    'now',
    'now',
  ],
  [
    'Tokyo 11:00 → tomorrow 09:00',
    '2026-11-23 11:00',
    'Asia/Tokyo',
    'supplier',
    'supplier_po',
    'JP',
    '2026-11-24 09:00',
    'supplier_morning',
  ],
  [
    'Shanghai Friday noon → Monday 09:00',
    '2026-11-27 12:00',
    'Asia/Shanghai',
    'supplier',
    'supplier_rfq',
    'CN',
    '2026-11-30 09:00',
    'supplier_morning',
  ],
  [
    'Mumbai 09:00 → now',
    '2026-11-23 09:00',
    'Asia/Kolkata',
    'supplier',
    'supplier_rfq',
    'IN',
    'now',
    'now',
  ],
  [
    'Rome early → 09:00',
    '2026-11-23 07:00',
    'Europe/Rome',
    'supplier',
    'supplier_rfq',
    'IT',
    '2026-11-23 09:00',
    'supplier_morning',
  ],
  [
    'Houston afternoon → tomorrow 09:00',
    '2026-11-23 15:00',
    'America/Chicago',
    'supplier',
    'supplier_rfq',
    'US',
    '2026-11-24 09:00',
    'supplier_morning',
  ],
  [
    'Rome across spring DST → Monday 09:00 CEST',
    '2027-03-26 12:00',
    'Europe/Rome',
    'supplier',
    'supplier_rfq',
    'IT',
    '2027-03-29 09:00',
    'supplier_morning',
  ],
  [
    'Houston across autumn DST → Monday 09:00 CST',
    '2026-10-30 14:00',
    'America/Chicago',
    'supplier',
    'supplier_rfq',
    'US',
    '2026-11-02 09:00',
    'supplier_morning',
  ],
  [
    'UAE supplier on a UAE holiday → next working day',
    '2026-11-30 10:00',
    'Asia/Dubai',
    'supplier',
    'supplier_rfq',
    'AE',
    '2026-12-01 09:00',
    'supplier_morning',
  ],
  [
    'Iran Thursday is weekend → Saturday 09:00',
    '2026-11-26 10:00',
    'Asia/Tehran',
    'supplier',
    'supplier_rfq',
    'IR',
    '2026-11-28 09:00',
    'supplier_morning',
  ],
  [
    'forwarder UAE 10:00 → now',
    '2026-11-23 10:00',
    'Asia/Dubai',
    'forwarder',
    'forwarder_request',
    'AE',
    'now',
    'now',
  ],
  [
    'forwarder UAE Friday 12:00 → Monday 09:00',
    '2026-11-20 12:00',
    'Asia/Dubai',
    'forwarder',
    'forwarder_request',
    'AE',
    '2026-11-23 09:00',
    'supplier_morning',
  ],
  // ── Chasers ──
  [
    'chaser Friday 15:01 → Monday 09:00',
    '2026-11-20 15:01',
    'Europe/Rome',
    'supplier',
    'supplier_chaser',
    'IT',
    '2026-11-23 09:00',
    'chaser_friday',
  ],
  [
    'chaser Friday 10:00 → now',
    '2026-11-20 10:00',
    'Europe/Rome',
    'supplier',
    'supplier_chaser',
    'IT',
    'now',
    'now',
  ],
  [
    'chaser after an out-of-office → first working day after the return',
    '2026-11-23 10:00',
    'Europe/Rome',
    'supplier',
    'supplier_chaser',
    'IT',
    '2026-11-26 09:00',
    'out_of_office',
    '2026-11-25',
  ],
  [
    'chaser out-of-office already over → now',
    '2026-11-23 10:00',
    'Europe/Rome',
    'supplier',
    'supplier_chaser',
    'IT',
    'now',
    'now',
    '2026-11-20',
  ],
  [
    'chaser Saudi Thursday 16:00 → Sunday 09:00',
    '2026-11-26 16:00',
    'Asia/Riyadh',
    'supplier',
    'supplier_chaser',
    'SA',
    '2026-11-29 09:00',
    'supplier_morning',
  ],
  [
    'chaser at the weekend → Monday 09:00',
    '2026-11-22 09:30',
    'Europe/Rome',
    'supplier',
    'supplier_chaser',
    'IT',
    '2026-11-23 09:00',
    'supplier_morning',
  ],
  // ── Internal ──
  [
    'internal at 03:00 on a Saturday → now',
    '2026-11-21 03:00',
    'Asia/Dubai',
    'internal',
    'morning_brief',
    'AE',
    'now',
    'internal',
  ],
]

describe('nextSendSlot (decision table)', () => {
  it('has at least 40 rows', () => {
    expect(ROWS.length).toBeGreaterThanOrEqual(40)
  })

  for (const [label, now, tz, audience, kind, country, expected, reason, ooo] of ROWS) {
    it(`${label}`, () => {
      const at = local(now, tz)
      const slot = nextSendSlot({
        now: at,
        kind,
        audience,
        recipient: { country, tz, ...(ooo ? { outOfOfficeUntil: ooo } : {}) },
        rules: RULES,
        holidays: HOLIDAYS,
        weekends: WEEKENDS,
      })
      if (expected === 'now') {
        expect(slot.at.getTime()).toBe(at.getTime())
      } else {
        const zone = audience === 'client' ? 'Asia/Dubai' : tz
        expect(slot.local).toBe(`${expected} ${zone}`)
        expect(slot.at.getTime()).toBe(local(expected, zone).getTime())
      }
      if (reason) expect(slot.reason).toBe(reason)
    })
  }

  it('a DST jump is honoured: Monday 09:00 in Rome is 07:00 UTC after spring forward, 08:00 before', () => {
    expect(local('2027-03-29 09:00', 'Europe/Rome').toISOString()).toBe('2027-03-29T07:00:00.000Z')
    expect(local('2027-03-26 09:00', 'Europe/Rome').toISOString()).toBe('2027-03-26T08:00:00.000Z')
    expect(wallTime(new Date('2026-11-02T15:00:00Z'), 'America/Chicago').hour).toBe(9)
  })

  it('maps kinds to audiences and countries to zones', () => {
    expect(audienceForKind('supplier_rfq')).toBe('supplier')
    expect(audienceForKind('forwarder_request')).toBe('forwarder')
    expect(audienceForKind('quotation')).toBe('client')
    expect(audienceForKind('visitor_acknowledgement')).toBe('internal')
    expect(tzForCountry('IT')).toBe('Europe/Rome')
    expect(tzForCountry('ZZ')).toBe('Asia/Dubai')
    expect(tzForCountry(null)).toBe('Asia/Dubai')
  })
})

describe('caps', () => {
  it('resets at 04:00 GST', () => {
    const before = capWindow(local('2026-11-23 03:59', 'Asia/Dubai'))
    expect([before.start.toISOString(), before.next.toISOString()]).toEqual([
      '2026-11-22T00:00:00.000Z',
      '2026-11-23T00:00:00.000Z',
    ])
    const after = capWindow(local('2026-11-23 04:00', 'Asia/Dubai'))
    expect([after.start.toISOString(), after.next.toISOString()]).toEqual([
      '2026-11-23T00:00:00.000Z',
      '2026-11-24T00:00:00.000Z',
    ])
  })

  it('counts against the mailbox cap; defaults by role', () => {
    expect(overCap(40, 40)).toBe(true)
    expect(overCap(39, 40)).toBe(false)
    expect(overCap(5, 0)).toBe(false)
    expect([defaultDailyCap('client'), defaultDailyCap('supplier')]).toEqual([40, 80])
  })
})

describe('threading', () => {
  it.each([
    ['Quote for valves', 'Re: Quote for valves'],
    ['Re: RE: Fwd: Quote', 'Re: Quote'],
    ['RE[2]: Quote', 'Re: Quote'],
    ['AW: Anfrage', 'Re: Anfrage'],
    ['Quote Re: valves', 'Re: Quote Re: valves'],
    ['', 'Re:'],
  ])('replySubject(%j) → %j', (input, expected) => {
    expect(replySubject(input)).toBe(expected)
  })

  it('References: the original chain plus its Message-ID, the last 20', () => {
    const chain = Array.from({ length: 25 }, (_, i) => `<m${i}@example.test>`)
    const refs = replyReferences(chain, '<orig@example.test>')
    expect(refs).toHaveLength(20)
    expect(refs.at(-1)).toBe('<orig@example.test>')
    expect(replyReferences(['<a@x>'], '<a@x>')).toEqual(['<a@x>'])
    expect(proposedMessageId('abc')).toBe('<ops.abc@indushydraulics.me>')
  })
})

describe('priced client sends (G2)', () => {
  it('lists the kinds and documents that carry a price', () => {
    expect(
      ['quotation', 'invoice', 'payment_reminder', 'advance_reminder'].every(isPricedKind)
    ).toBe(true)
    expect(isPricedKind('supplier_rfq')).toBe(false)
    expect(['proforma_invoice', 'tax_invoice', 'credit_note'].every(isPricedDocument)).toBe(true)
    expect(isPricedDocument('datasheet')).toBe(false)
  })
})

describe('outbound email state machine (100% transition coverage)', () => {
  const expected = (from: OutboundStatusValue, to: OutboundStatusValue): boolean => {
    const pre = ['scheduled', 'held', 'waiting_for_mailbox']
    const pairs: string[] = [
      'draft>awaiting_approval',
      'draft>scheduled',
      'draft>cancelled',
      'draft>superseded',
      'awaiting_approval>scheduled',
      'awaiting_approval>cancelled',
      'awaiting_approval>superseded',
      'scheduled>held',
      'held>scheduled',
      'scheduled>sending',
      'scheduled>waiting_for_mailbox',
      'held>waiting_for_mailbox',
      'waiting_for_mailbox>scheduled',
      'sending>sent',
      'sending>failed',
      'sending>unknown',
      'unknown>sent',
      'unknown>failed',
    ]
    if (
      pre.includes(from) &&
      ['cancelled', 'superseded', 'suppressed_preview', 'failed'].includes(to)
    )
      return true
    return pairs.includes(`${from}>${to}`)
  }
  for (const from of OUTBOUND_STATUSES) {
    for (const to of OUTBOUND_STATUSES) {
      it(`${from} → ${to}`, () => expect(canTransitionOutbound(from, to)).toBe(expected(from, to)))
    }
  }
  it('lists exactly the allowed transitions; nothing leaves sent; undo stops only unsent rows', () => {
    const count = OUTBOUND_STATUSES.flatMap((f) =>
      OUTBOUND_STATUSES.filter((t) => expected(f, t))
    ).length
    expect(outboundTransitions()).toHaveLength(count)
    expect(OUTBOUND_STATUSES.some((t) => canTransitionOutbound('sent', t))).toBe(false)
    expect(CANCELLABLE).not.toContain('sending')
  })
})

describe('envelope', () => {
  it('normalises, de-duplicates and drops the sending mailbox', () => {
    expect(
      normaliseEnvelope(
        {
          to: [' Buyer@Example.test ', 'sales@indus.test'],
          cc: ['buyer@example.test', 'b@example.test'],
          bcc: ['B@example.test'],
        },
        'sales@indus.test'
      )
    ).toEqual({ to: ['buyer@example.test'], cc: ['b@example.test'], bcc: [] })
    expect(() =>
      normaliseEnvelope({ to: ['sales@indus.test'], cc: [], bcc: [] }, 'sales@indus.test')
    ).toThrow('at least one recipient')
    expect(() =>
      normaliseEnvelope({ to: ['not an address'], cc: [], bcc: [] }, 'x@indus.test')
    ).toThrow('Not an email address')
    expect(allRecipients({ to: ['a@x.test'], cc: ['b@x.test'], bcc: ['c@x.test'] })).toEqual([
      'a@x.test',
      'b@x.test',
      'c@x.test',
    ])
  })

  it('checks the alias against send-as; reads a country from a ccTLD', () => {
    expect(aliasAllowed('Sales@Indus.test', ['sales@indus.test'])).toBe(true)
    expect(aliasAllowed('other@indus.test', ['sales@indus.test'])).toBe(false)
    expect(countryFromAddress('a@example.co.jp')).toBe('JP')
    expect(countryFromAddress('a@example.co.uk')).toBe('GB')
    expect(countryFromAddress('a@example.com')).toBeNull()
    expect(DEFAULT_COUNTRY_WEEKENDS.byCountry.SA).toEqual([5, 6])
    expect(OUTBOUND_HEADER).toBe('X-Indus-Outbound')
  })
})
