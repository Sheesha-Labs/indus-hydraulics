import { describe, expect, it } from 'vitest'
import {
  backfillView,
  etaText,
  labelKeysFor,
  sendSub,
  sinceText,
  statusLine,
  statusWord,
} from './mailbox-card-copy'

const NOW = new Date('2026-11-23T10:00:00Z')
const base = {
  lastMessageAt: null,
  lastSyncAt: null,
  pausedAt: null,
  pausedByInitials: null,
  capReset: '04:00',
  now: NOW,
}

describe('board 85 card copy', () => {
  it('reads "since" as min, h or d', () => {
    expect(sinceText(null, NOW)).toBeNull()
    expect(sinceText(new Date(NOW.getTime() - 20_000), NOW)).toBe('now')
    expect(sinceText(new Date(NOW.getTime() - 2 * 60_000), NOW)).toBe('2 min')
    expect(sinceText(new Date(NOW.getTime() - 3 * 3_600_000), NOW)).toBe('3 h')
    expect(sinceText(new Date(NOW.getTime() - 4 * 86_400_000), NOW)).toBe('4 d')
  })

  it.each([
    [
      'live',
      { lastMessageAt: new Date(NOW.getTime() - 120_000) },
      'Live',
      'Live · last message 2 min ago',
    ],
    ['live', {}, 'Live', 'Live'],
    [
      'behind',
      { lastSyncAt: new Date(NOW.getTime() - 40 * 60_000) },
      'Behind',
      'Behind · last synced 40 min ago',
    ],
    ['resyncing', {}, 'Behind', 'Behind · catching up'],
    ['limit_reached', {}, 'Limit reached', 'Limit reached · resets 04:00 GST'],
    ['backfill_paused', {}, 'Backfill paused', 'Backfill paused'],
    [
      'paused',
      { pausedAt: new Date('2026-11-23T10:20:00Z'), pausedByInitials: 'KB' },
      'Paused',
      'Paused since 14:20 by KB',
    ],
    ['token_expired', {}, 'Disconnected', 'Disconnected'],
    ['revoked', {}, 'Disconnected', 'Disconnected'],
    ['connecting', {}, 'Connecting', 'Connecting'],
  ] as const)('%s → %s', (status, extra, word, text) => {
    expect(statusLine({ ...base, ...extra, status })).toEqual({ word, text })
  })

  it('maps every mailbox status to a word of the mailbox chip family', () => {
    expect(statusWord('backfilling')).toBe('Backfilling')
    expect(statusWord('disconnected')).toBe('Disconnected')
  })

  it('backfill: done, counting, in progress with an ETA, paused, none', () => {
    expect(backfillView({ months: 0, total: null, state: null })).toBeNull()
    expect(backfillView({ months: 12, total: null, state: null })?.text).toBe('Not started')
    expect(
      backfillView({
        months: 12,
        total: 9412,
        state: {
          phase: 'done',
          queued: 9000,
          skipped: 400,
          alreadyStored: 12,
          updatedAt: '2026-09-14T08:00:00Z',
        },
      })
    ).toMatchObject({
      label: 'Backfill · 12 months',
      text: 'Done · 9,412 messages · 14 Sep',
      done: true,
    })
    expect(backfillView({ months: 24, total: null, state: { phase: 'counting' } })?.text).toBe(
      'Counting past mail…'
    )
    expect(
      backfillView({
        months: 12,
        total: 8000,
        state: { phase: 'fetching', queued: 5000, skipped: 120, etaMinutes: 40 },
      })
    ).toMatchObject({ text: '64% · 5,120 of 8,000 · about 40 min left', value: 5120, total: 8000 })
    expect(
      backfillView({
        months: 12,
        total: 8000,
        state: { phase: 'paused', queued: 800, etaMinutes: null },
      })?.text
    ).toBe('10% · 800 of 8,000 · paused')
    expect([etaText(0.5), etaText(40), etaText(150)]).toEqual(['a minute', '40 min', '3 hours'])
  })

  it('send line and labels by role', () => {
    expect(sendSub('client', null)).toBe('Only after your approval or an Autopilot rule')
    expect(sendSub('supplier', 'sales@example.test')).toBe(
      'RFQs, chasers and supplier POs, Cc sales@'
    )
    expect(sendSub('read_only', null)).toMatch(/never send/)
    expect(labelKeysFor('client')).toEqual(['enquiry', 'po', 'needsOwner', 'clientReply'])
    expect(labelKeysFor('supplier')).toEqual(['supplierQuote', 'supplierQuestion', 'needsOwner'])
  })
})
