import { describe, expect, it } from 'vitest'
import { dueLabel, inView, matchesQuery, sortInbox, stageOf, type InboxRow } from './enquiry-inbox'

const NOW = Date.parse('2026-11-11T12:00:00Z')
const day = 86_400_000

function row(over: Partial<InboxRow>): InboxRow {
  return {
    key: over.ref ?? 'x',
    source: 'website',
    ref: 'RFQ-1',
    href: '/admin/rfqs/RFQ-1',
    subject: 'Hose',
    customer: 'Acme',
    status: 'submitted',
    stage: 'new',
    urgency: 'routine',
    dueAt: null,
    lines: 1,
    receivedAt: new Date(NOW - day),
    assignee: null,
    ...over,
  }
}

describe('stageOf', () => {
  it('maps every source onto one ladder', () => {
    expect(stageOf('website', 'submitted')).toBe('new')
    expect(stageOf('website', 'engineer_questions_pending')).toBe('working')
    expect(stageOf('website', 'quote_sent')).toBe('quoted')
    expect(stageOf('website', 'shipped')).toBe('won')
    expect(stageOf('website', 'cancelled')).toBe('closed')
    expect(stageOf('tender', 'triage')).toBe('new')
    expect(stageOf('tender', 'comparing')).toBe('working')
    expect(stageOf('tender', 'lost')).toBe('closed')
    expect(stageOf('callback', 'new')).toBe('new')
    expect(stageOf('callback', 'called')).toBe('working')
    expect(stageOf('callback', 'spam')).toBe('closed')
  })

  it('treats an unknown status as in progress rather than hiding it', () => {
    expect(stageOf('website', 'something_new')).toBe('working')
  })
})

describe('inView', () => {
  it('open is new and in progress', () => {
    expect(inView('new', 'open')).toBe(true)
    expect(inView('working', 'open')).toBe(true)
    expect(inView('quoted', 'open')).toBe(false)
    expect(inView('closed', 'all')).toBe(true)
  })
})

describe('sortInbox', () => {
  it('puts a stopped plant first, then priority and tenders closing soon, then the oldest waiting, then finished work', () => {
    const rows = [
      row({ ref: 'done-old', stage: 'won', receivedAt: new Date(NOW - 9 * day) }),
      row({ ref: 'routine-new', receivedAt: new Date(NOW - 1 * day) }),
      row({ ref: 'routine-old', receivedAt: new Date(NOW - 5 * day) }),
      row({ ref: 'tender-soon', source: 'tender', urgency: null, dueAt: new Date(NOW + 2 * day) }),
      row({ ref: 'plant', urgency: 'plant_down', receivedAt: new Date(NOW - 0.1 * day) }),
      row({ ref: 'done-new', stage: 'closed', receivedAt: new Date(NOW - 2 * day) }),
    ]
    expect(sortInbox(rows, NOW).map((r) => r.ref)).toEqual(['plant', 'tender-soon', 'routine-old', 'routine-new', 'done-new', 'done-old'])
  })
})

describe('matchesQuery', () => {
  it('searches reference, subject and customer', () => {
    const r = row({ ref: 'ENQ-2026-0007', subject: 'Gate valves', customer: 'Caspian PCE' })
    expect(matchesQuery(r, 'enq-2026')).toBe(true)
    expect(matchesQuery(r, 'gate')).toBe(true)
    expect(matchesQuery(r, 'caspian')).toBe(true)
    expect(matchesQuery(r, 'hose')).toBe(false)
    expect(matchesQuery(r, '  ')).toBe(true)
  })
})

describe('dueLabel', () => {
  it('says how long a tender has left', () => {
    expect(dueLabel(null, NOW)).toBeNull()
    expect(dueLabel(new Date(NOW + 3 * day), NOW)).toBe('Closes in 3d')
    expect(dueLabel(new Date(NOW + 1000), NOW)).toBe('Closes in 1d')
    expect(dueLabel(new Date(NOW - day), NOW)).toBe('Closed')
  })
})
