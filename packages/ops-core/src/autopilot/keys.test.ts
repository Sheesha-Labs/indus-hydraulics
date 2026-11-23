import { describe, expect, it } from 'vitest'
import {
  ACTION_KEYS,
  CAREFUL_SEND_EXCEPTIONS,
  CATALOGUE_KEYS,
  PRICED_CLIENT_SENDS,
  SENDS_EXTERNALLY,
  SYSTEM_KEYS,
  actionPosition,
  isActionKey,
} from './keys'
import { LOCKED_LEVELS, MAX_LEVELS } from './levels'
import { validateLevel } from './presets'

describe('action keys', () => {
  it('seeds 32 catalogue keys and 34 system keys, each once', () => {
    expect(CATALOGUE_KEYS).toHaveLength(32)
    expect(SYSTEM_KEYS).toHaveLength(34)
    expect(ACTION_KEYS).toHaveLength(66)
    expect(new Set(ACTION_KEYS).size).toBe(66)
  })

  it('uses snake_case keys', () => {
    for (const key of ACTION_KEYS) expect(key).toMatch(/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/)
  })

  it('positions catalogue rows by number and system rows from 101', () => {
    expect(actionPosition('classify_mail')).toBe(1)
    expect(actionPosition('send_quotation')).toBe(20)
    expect(actionPosition('supplier_pos')).toBe(28)
    expect(actionPosition('supplier_payments')).toBe(32)
    expect(actionPosition('qualify_enquiry')).toBe(101)
    expect(actionPosition('log_call_follow_up')).toBe(134)
    expect(new Set(ACTION_KEYS.map(actionPosition)).size).toBe(66)
  })

  it('recognises only seeded keys', () => {
    expect(isActionKey('chase_suppliers')).toBe(true)
    expect(isActionKey('send_whatsapp')).toBe(false)
  })
})

describe('SENDS_EXTERNALLY', () => {
  it('names only seeded keys, each once', () => {
    for (const key of SENDS_EXTERNALLY) expect(isActionKey(key)).toBe(true)
    expect(new Set(SENDS_EXTERNALLY).size).toBe(SENDS_EXTERNALLY.length)
  })

  it('includes every client and supplier email of the catalogue', () => {
    for (const key of [
      'ack_email',
      'send_supplier_rfqs',
      'chase_suppliers',
      'send_quotation',
      'supplier_pos',
      'payment_reminders',
    ] as const) {
      expect(SENDS_EXTERNALLY).toContain(key)
    }
  })

  it('leaves out internal actions (labels, records, reminders to you, money never)', () => {
    for (const key of [
      'classify_mail',
      'label_gmail',
      'create_enquiry',
      'follow_up_reminders',
      'document_checklist_reminders',
      'supplier_payments',
      'update_fx_rates',
    ] as const) {
      expect(SENDS_EXTERNALLY as readonly string[]).not.toContain(key)
    }
  })

  it('allows only chase_suppliers and ack_website above Draft and ask under Careful', () => {
    expect(Object.keys(CAREFUL_SEND_EXCEPTIONS).sort()).toEqual(['ack_website', 'chase_suppliers'])
    for (const key of Object.keys(CAREFUL_SEND_EXCEPTIONS)) {
      expect(SENDS_EXTERNALLY as readonly string[]).toContain(key)
    }
  })
})

describe('PRICED_CLIENT_SENDS', () => {
  it('is #20, #26, #27 and #31', () => {
    expect([...PRICED_CLIENT_SENDS].map(actionPosition).sort((a, b) => a - b)).toEqual([
      20, 26, 27, 31,
    ])
  })

  it('every member sends externally', () => {
    for (const key of PRICED_CLIENT_SENDS) expect(SENDS_EXTERNALLY).toContain(key)
  })

  it('every member is locked at Draft and ask or capped at Draft and ask', () => {
    const locked = LOCKED_LEVELS as Partial<Record<string, string>>
    const capped = MAX_LEVELS as Partial<Record<string, string>>
    for (const key of PRICED_CLIENT_SENDS) {
      expect(locked[key] === 'draft_and_ask' || capped[key] === 'draft_and_ask').toBe(true)
    }
  })

  it('validateLevel refuses Do and tell and Do quietly for each, even on a row that forgot its cap', () => {
    for (const key of PRICED_CLIENT_SENDS) {
      for (const def of [
        { key, lockedLevel: null, maxLevel: null },
        { key, lockedLevel: null, maxLevel: 'do_quietly' as const },
      ]) {
        expect(validateLevel(def, 'do_and_tell').success).toBe(false)
        expect(validateLevel(def, 'do_quietly').success).toBe(false)
      }
    }
  })

  it('may still be lowered to Suggest or Off when only capped', () => {
    for (const key of ['order_ack_proforma', 'advance_reminders', 'payment_reminders'] as const) {
      const def = { key, lockedLevel: null, maxLevel: 'draft_and_ask' as const }
      expect(validateLevel(def, 'draft_and_ask').success).toBe(true)
      expect(validateLevel(def, 'suggest').success).toBe(true)
      expect(validateLevel(def, 'off').success).toBe(true)
    }
  })
})
