import { orderBanners } from '@indus/ops-ui/status'
import { describe, expect, it } from 'vitest'
import { bannerSpecs, lagText, type BannerMailbox } from './system-banner-rules'

const NOW = new Date('2026-11-23T06:00:00Z') // 10:00 GST
const box = (over: Partial<BannerMailbox>): BannerMailbox => ({
  id: 'm1',
  address: 'sales@example.test',
  role: 'client',
  status: 'live',
  brokenAt: null,
  pausedAt: null,
  pausedByInitials: null,
  lastSuccessfulSyncAt: new Date(NOW.getTime() - 60_000),
  backfillPhase: null,
  heldForCap: 0,
  failedRecently: 0,
  sentToday: 0,
  dailySendCap: 40,
  ...over,
})
const specs = (
  mailboxes: BannerMailbox[],
  pause: { pausedAt: string; byInitials: string | null } | null = null
) => bannerSpecs({ mailboxes, assistantPause: pause, capReset: '04:00', now: NOW })

describe('board 89 banners', () => {
  it('a healthy mailbox raises nothing', () => {
    expect(specs([box({})])).toEqual([])
  })

  it('token expired or revoked: disconnected at a time, Reconnect, the role’s mail', () => {
    const [s] = specs([
      box({ status: 'token_expired', brokenAt: new Date('2026-11-23T05:12:00Z') }),
    ])
    expect(s).toMatchObject({
      kind: 'mailbox-disconnected',
      tone: 'bad',
      title: 'sales@ disconnected 09:12.',
      text: 'The Assistant can’t read or send client mail.',
      action: { label: 'Reconnect', href: '/settings/mailboxes' },
    })
    expect(
      specs([box({ status: 'revoked', role: 'supplier', address: 'purchase@example.test' })])[0]
        ?.text
    ).toBe('The Assistant can’t read or send supplier mail.')
  })

  it('behind: the lag in words, checking every 5 minutes', () => {
    const [s] = specs([
      box({
        address: 'purchase@example.test',
        lastSuccessfulSyncAt: new Date(NOW.getTime() - 2 * 3_600_000),
      }),
    ])
    expect(s).toMatchObject({ kind: 'sync-delayed', title: 'purchase@ is 2 hours behind.' })
    expect(s?.text).toContain('Checking every 5 minutes.')
    expect([lagText(0.4), lagText(45), lagText(60), lagText(150)]).toEqual([
      '1 minute',
      '45 minutes',
      '1 hour',
      '3 hours',
    ])
  })

  it('limit reached: Operations’ own limit, sends queued, resumes 04:00 GST', () => {
    const [s] = specs([box({ heldForCap: 6, sentToday: 40 })])
    expect(s).toMatchObject({
      kind: 'limit-reached',
      title: 'sales@ reached its daily sending limit.',
      text: '6 sends are queued. Sending resumes at 04:00 GST.',
    })
    expect(s?.title).not.toMatch(/Google/)
  })

  it('a failed send, a paused mailbox, the slow past-mail read (C33 copy)', () => {
    expect(specs([box({ failedRecently: 1 })])[0]).toMatchObject({
      kind: 'send-failed',
      title: 'A message failed to send.',
    })
    expect(
      specs([
        box({
          status: 'paused',
          pausedAt: new Date('2026-11-23T04:50:00Z'),
          pausedByInitials: 'KB',
        }),
      ])[0]
    ).toMatchObject({
      kind: 'mailbox-paused',
      title: 'sales@ reading is paused since 08:50 by KB.',
      text: 'New mail waits in Gmail; nothing is sent from sales@.',
      action: { label: 'Resume' },
    })
    const slow = specs([box({ status: 'backfill_paused' })])[0]
    expect(slow?.kind).toBe('backfill-paused')
    expect(`${slow?.title} ${slow?.text}`).not.toMatch(/quota|04:00/)
    expect(slow?.text).toBe('New mail is still read live.')
  })

  it('one banner shows: the most severe first, the rest behind "+n more"', () => {
    const all = specs(
      [
        box({ id: 'a', status: 'backfill_paused' }),
        box({
          id: 'b',
          address: 'purchase@example.test',
          heldForCap: 2,
          sentToday: 80,
          dailySendCap: 80,
        }),
        box({
          id: 'c',
          address: 'accounts@example.test',
          role: 'read_only',
          status: 'disconnected',
        }),
      ],
      { pausedAt: '2026-11-23T05:00:00Z', byInitials: 'KB' }
    )
    const ordered = orderBanners(
      all.map((s) => ({ kind: s.kind, props: { tone: s.tone, children: s.text } }))
    )
    expect(ordered.map((b) => b.kind)).toEqual([
      'mailbox-disconnected',
      'assistant-paused',
      'limit-reached',
      'backfill-paused',
    ])
    expect(all.find((s) => s.kind === 'mailbox-disconnected')?.text).toBe(
      'The Assistant can’t read this mailbox.'
    )
  })
})
