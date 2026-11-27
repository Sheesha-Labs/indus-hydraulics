import { describe, expect, it } from 'vitest'
import {
  computeSupplierStats,
  median,
  medianDays,
  reliabilityBasis,
  checkSummary,
  fillSummary,
  summaryValues,
  statsMovedMaterially,
} from './stats'

const h = (n: number) => new Date(Date.UTC(2026, 9, 1, 0) + n * 3_600_000)

describe('supplier stats', () => {
  it('medians odd, even and empty', () => {
    expect(median([5, 1, 3])).toBe(3)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBeNull()
  })

  it('returns nulls, not zero divisions, with no history', () => {
    const s = computeSupplierStats({
      recipients: [],
      quotes: [],
      quoteLines: 0,
      selectedOnWon: 0,
      pos: [],
    })
    expect(s).toEqual({
      rfqsAsked: 0,
      replies: 0,
      quotes: 0,
      regrets: 0,
      replyRatePct: null,
      medianReplyHours: null,
      linesQuotedPct: null,
      winSharePct: null,
      onTimePct: null,
      posCount: 0,
      lastQuoteAt: null,
    })
  })

  it('counts replies, regrets, lines, win share and on-time; leaves withdrawn and drafts out', () => {
    const s = computeSupplierStats({
      recipients: [
        { sentAt: h(0), repliedAt: h(24), status: 'quoted' },
        { sentAt: h(0), repliedAt: h(72), status: 'partial_quote' },
        { sentAt: h(0), repliedAt: h(48), status: 'regretted' },
        { sentAt: h(0), repliedAt: null, status: 'no_reply' },
        { sentAt: h(0), repliedAt: null, status: 'withdrawn' },
        { sentAt: null, repliedAt: null, status: 'draft' },
      ],
      quotes: [
        { receivedAt: h(24), linesAsked: 10, linesQuoted: 10 },
        { receivedAt: h(72), linesAsked: 10, linesQuoted: 4 },
      ],
      quoteLines: 14,
      selectedOnWon: 7,
      pos: [
        {
          promisedDate: new Date(Date.UTC(2026, 9, 10)),
          deliveredAt: new Date(Date.UTC(2026, 9, 10, 18)),
          status: 'delivered',
        },
        {
          promisedDate: new Date(Date.UTC(2026, 9, 10)),
          deliveredAt: new Date(Date.UTC(2026, 9, 12)),
          status: 'delivered',
        },
        { promisedDate: null, deliveredAt: null, status: 'draft' },
      ],
    })
    expect(s.rfqsAsked).toBe(4)
    expect(s.replies).toBe(3)
    expect(s.regrets).toBe(1)
    expect(s.replyRatePct).toBe(75)
    expect(s.medianReplyHours).toBe(48)
    expect(s.linesQuotedPct).toBe(70)
    expect(s.winSharePct).toBe(50)
    expect(s.onTimePct).toBe(50)
    expect(s.posCount).toBe(2)
    expect(s.lastQuoteAt).toEqual(h(72))
  })

  it('a reply before the send does not count a negative time; quoted lines never exceed asked', () => {
    const s = computeSupplierStats({
      recipients: [{ sentAt: h(10), repliedAt: h(5), status: 'quoted' }],
      quotes: [{ receivedAt: h(5), linesAsked: 2, linesQuoted: 5 }],
      quoteLines: 0,
      selectedOnWon: 0,
      pos: [],
    })
    expect(s.medianReplyHours).toBeNull()
    expect(s.linesQuotedPct).toBe(100)
    expect(s.winSharePct).toBeNull()
  })

  it('material change: reply ±10, median ±24 h, a new PO, or a figure appearing', () => {
    const base = { replyRatePct: 80, medianReplyHours: 48, posCount: 2 }
    expect(statsMovedMaterially(base, { ...base, replyRatePct: 85 })).toBe(false)
    expect(statsMovedMaterially(base, { ...base, replyRatePct: 70 })).toBe(true)
    expect(statsMovedMaterially(base, { ...base, medianReplyHours: 72 })).toBe(true)
    expect(statsMovedMaterially(base, { ...base, posCount: 3 })).toBe(true)
    expect(statsMovedMaterially({ ...base, replyRatePct: null }, base)).toBe(true)
  })

  it('builds the basis line and median days', () => {
    expect(
      reliabilityBasis({ rfqsAsked: 29, quotes: 25, posCount: 4 }, new Date(Date.UTC(2025, 2, 10)))
    ).toBe('From 29 RFQs, 25 quotes and 4 POs since Mar 2025')
    expect(reliabilityBasis({ rfqsAsked: 1, quotes: 1, posCount: 1 }, null)).toBe(
      'From 1 RFQ, 1 quote and 1 PO'
    )
    expect(medianDays(50.4)).toBe('2.1 d')
    expect(medianDays(9.6)).toBe('0.4 d')
    expect(medianDays(300)).toBe('13 d')
    expect(medianDays(null)).toBeNull()
  })
})

describe('reliability paragraph', () => {
  const s = computeSupplierStats({
    recipients: [
      { sentAt: h(0), repliedAt: h(72), status: 'quoted' },
      { sentAt: h(0), repliedAt: h(72), status: 'quoted' },
    ],
    quotes: [{ receivedAt: h(72), linesAsked: 10, linesQuoted: 9 }],
    quoteLines: 9,
    selectedOnWon: 3,
    pos: [
      {
        promisedDate: new Date(Date.UTC(2026, 9, 10)),
        deliveredAt: new Date(Date.UTC(2026, 9, 9)),
        status: 'delivered',
      },
      {
        promisedDate: new Date(Date.UTC(2026, 9, 10)),
        deliveredAt: new Date(Date.UTC(2026, 9, 20)),
        status: 'delivered',
      },
    ],
  })
  it('fills code figures into placeholders', () => {
    const v = summaryValues(s)
    expect(v).toMatchObject({
      reply_days: '3',
      reply_rate: '100%',
      lines_quoted: '90%',
      on_time: '50%',
      late_count: '1',
      po_count: '2',
    })
    expect(
      fillSummary('Replies in about {reply_days} days, late {late_count} of {po_count} times.', v)
    ).toBe('Replies in about 3 days, late 1 of 2 times.')
  })
  it('refuses digits, unknown placeholders and links', () => {
    const ok = Object.keys(summaryValues(s))
    expect(checkSummary('Replies in about {reply_days} days.', ok)).toBeNull()
    expect(checkSummary('Replies in about 3 days.', ok)).toMatch(/figure/)
    expect(checkSummary('Prices {price_gap} above.', ok)).toMatch(/no figure/)
    expect(checkSummary('See https://example.test', ok)).toMatch(/link/)
    expect(checkSummary('Broken {reply_days', ok)).toMatch(/broken/)
  })
})
