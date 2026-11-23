import { describe, expect, it } from 'vitest'
import {
  BROKEN_STATES,
  canTransitionMailbox,
  mailboxCanRead,
  mailboxCanSend,
  mailboxTransitions,
  WORKING_STATES,
  type MailboxStatusValue,
} from './mailbox-state'
import { MAILBOX_STATUSES } from './labels'

/** The expected machine, written out independently of the implementation. */
function expected(from: MailboxStatusValue, to: MailboxStatusValue): boolean {
  if (from === to) return false
  if (BROKEN_STATES.includes(to)) return true
  if (BROKEN_STATES.includes(from)) return to === 'connecting'
  if (to === 'paused') return from === 'connecting' || WORKING_STATES.includes(from)
  if (from === 'paused') return WORKING_STATES.includes(to)
  const pairs: Array<[MailboxStatusValue, MailboxStatusValue]> = [
    ['connecting', 'backfilling'],
    ['connecting', 'live'],
    ['backfilling', 'live'],
    ['backfilling', 'backfill_paused'],
    ['backfill_paused', 'backfilling'],
    ['live', 'behind'],
    ['behind', 'live'],
    ['live', 'limit_reached'],
    ['limit_reached', 'live'],
    ['live', 'resyncing'],
    ['resyncing', 'live'],
    ['behind', 'resyncing'],
    ['resyncing', 'behind'],
  ]
  return pairs.some(([a, b]) => a === from && b === to)
}

describe('mailbox state machine (100% transition coverage)', () => {
  for (const from of MAILBOX_STATUSES) {
    for (const to of MAILBOX_STATUSES) {
      it(`${from} → ${to}: ${expected(from, to) ? 'allowed' : 'refused'}`, () => {
        expect(canTransitionMailbox(from, to)).toBe(expected(from, to))
      })
    }
  }

  it('lists exactly the allowed transitions', () => {
    const count = MAILBOX_STATUSES.flatMap((f) =>
      MAILBOX_STATUSES.filter((t) => expected(f, t))
    ).length
    expect(mailboxTransitions()).toHaveLength(count)
  })

  it('a broken or paused mailbox neither reads nor sends; a reconnect starts over at connecting', () => {
    for (const s of [...BROKEN_STATES, 'paused' as const]) {
      expect(mailboxCanSend(s)).toBe(false)
      expect(mailboxCanRead(s)).toBe(false)
    }
    expect(mailboxCanSend('live')).toBe(true)
    expect(mailboxCanRead('behind')).toBe(true)
    expect(mailboxCanSend('connecting')).toBe(false)
    expect(canTransitionMailbox('token_expired', 'live')).toBe(false)
  })
})
