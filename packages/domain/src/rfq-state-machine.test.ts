import { describe, expect, test } from 'vitest'
import {
  canTransition,
  assertTransition,
  getValidTransitions,
  isTerminal,
  shouldNotifyCustomer,
} from './rfq-state-machine'

describe('RFQ state machine — canonical transitions per CLAUDE.md §7', () => {
  test('happy path: draft → submitted → engineer_review → quote_sent → accepted', () => {
    expect(canTransition('draft', 'submitted')).toBe(true)
    expect(canTransition('submitted', 'engineer_review')).toBe(true)
    expect(canTransition('engineer_review', 'quote_sent')).toBe(true)
    expect(canTransition('quote_sent', 'accepted')).toBe(true)
  })

  test('engineer review can request questions, and questions can return to review', () => {
    expect(canTransition('engineer_review', 'engineer_questions_pending')).toBe(true)
    expect(canTransition('engineer_questions_pending', 'engineer_review')).toBe(true)
  })

  test('quote can be declined or expire', () => {
    expect(canTransition('quote_sent', 'declined')).toBe(true)
    expect(canTransition('quote_sent', 'expired')).toBe(true)
  })

  test('accepted → order_created is terminal for the RFQ domain', () => {
    expect(canTransition('accepted', 'order_created')).toBe(true)
    // Post-order_created statuses are RESERVED — the order/fulfilment domain
    // owns them. They have no transitions until that domain is wired up.
    expect(canTransition('order_created', 'fulfilling')).toBe(false)
    expect(getValidTransitions('order_created')).toEqual([])
  })

  test('any non-terminal state can be cancelled', () => {
    expect(canTransition('draft', 'cancelled')).toBe(true)
    expect(canTransition('engineer_review', 'cancelled')).toBe(true)
    expect(canTransition('quote_sent', 'cancelled')).toBe(true)
  })

  test('rejects invalid transitions', () => {
    expect(canTransition('draft', 'engineer_review')).toBe(false)
    expect(canTransition('draft', 'quote_sent')).toBe(false)
    expect(canTransition('submitted', 'accepted')).toBe(false)
    // Terminal states have no outgoing transitions
    expect(canTransition('order_created', 'cancelled')).toBe(false)
    expect(canTransition('declined', 'engineer_review')).toBe(false)
  })

  test('assertTransition throws on invalid transitions but is silent on valid ones', () => {
    expect(() => assertTransition('draft', 'submitted')).not.toThrow()
    expect(() => assertTransition('draft', 'paid')).toThrow()
  })

  test('getValidTransitions returns the right next-state set for each state', () => {
    expect(getValidTransitions('draft').sort()).toEqual(['cancelled', 'submitted'].sort())
    expect(getValidTransitions('engineer_review').sort()).toEqual(
      ['cancelled', 'engineer_questions_pending', 'quote_sent'].sort(),
    )
  })

  test('isTerminal correctly identifies terminal states', () => {
    expect(isTerminal('order_created')).toBe(true)
    expect(isTerminal('cancelled')).toBe(true)
    expect(isTerminal('declined')).toBe(true)
    expect(isTerminal('expired')).toBe(true)
    expect(isTerminal('draft')).toBe(false)
    expect(isTerminal('engineer_review')).toBe(false)
    expect(isTerminal('quote_sent')).toBe(false)
  })

  test('shouldNotifyCustomer fires on the right milestones', () => {
    expect(shouldNotifyCustomer('submitted')).toBe(true)
    expect(shouldNotifyCustomer('quote_sent')).toBe(true)
    expect(shouldNotifyCustomer('order_created')).toBe(true)
    // No-op states
    expect(shouldNotifyCustomer('draft')).toBe(false)
    expect(shouldNotifyCustomer('engineer_review')).toBe(false)
    expect(shouldNotifyCustomer('cancelled')).toBe(false)
  })
})
