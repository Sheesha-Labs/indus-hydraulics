import { describe, expect, it } from 'vitest'
import type { AutopilotLevel } from '../state/labels'
import { FIXED_RULES } from './levels'
import {
  AUTOPILOT_MODES,
  allowedLevels,
  carefulSendViolations,
  presetLevels,
  validateLevel,
  type ActionDefLevels,
} from './presets'

function def(
  key: string,
  levels: [AutopilotLevel, AutopilotLevel, AutopilotLevel],
  extra: Partial<ActionDefLevels> = {}
): ActionDefLevels {
  return {
    key,
    configurable: true,
    lockedLevel: null,
    maxLevel: null,
    defaultCareful: levels[0],
    defaultBalanced: levels[1],
    defaultHandsOff: levels[2],
    ...extra,
  }
}

const DEFS: ActionDefLevels[] = [
  def('classify_mail', ['do_quietly', 'do_quietly', 'do_quietly']),
  def('create_enquiry', ['draft_and_ask', 'do_and_tell', 'do_and_tell']),
  def('pick_suppliers', ['draft_and_ask', 'draft_and_ask', 'do_and_tell']),
  def('chase_suppliers', ['do_and_tell', 'do_and_tell', 'do_and_tell']),
  def('send_quotation', ['draft_and_ask', 'draft_and_ask', 'draft_and_ask'], {
    lockedLevel: 'draft_and_ask',
  }),
  def('order_ack_proforma', ['draft_and_ask', 'draft_and_ask', 'draft_and_ask'], {
    maxLevel: 'draft_and_ask',
  }),
  def('supplier_payments', ['never', 'never', 'never'], { lockedLevel: 'never' }),
  def('import_history', ['do_and_tell', 'do_and_tell', 'do_and_tell'], { configurable: false }),
  def('bank_change_alert', ['do_and_tell', 'do_and_tell', 'do_and_tell'], {
    configurable: false,
    lockedLevel: 'do_and_tell',
  }),
]

describe('presetLevels', () => {
  it('sets each configurable unlocked row to its mode default', () => {
    expect(Object.fromEntries(presetLevels('careful', DEFS))).toEqual({
      classify_mail: 'do_quietly',
      create_enquiry: 'draft_and_ask',
      pick_suppliers: 'draft_and_ask',
      chase_suppliers: 'do_and_tell',
      order_ack_proforma: 'draft_and_ask',
    })
    expect(presetLevels('balanced', DEFS).get('create_enquiry')).toBe('do_and_tell')
    expect(presetLevels('hands_off', DEFS).get('pick_suppliers')).toBe('do_and_tell')
  })

  it('never touches locked or non-configurable rows, under every mode', () => {
    for (const mode of AUTOPILOT_MODES) {
      const levels = presetLevels(mode, DEFS)
      for (const key of [
        'send_quotation',
        'supplier_payments',
        'import_history',
        'bank_change_alert',
      ]) {
        expect(levels.has(key)).toBe(false)
      }
    }
  })

  it('cannot change a fixed rule even when the row in the database forgot its lock', () => {
    const loose = Object.keys(FIXED_RULES).map((key) =>
      def(key, ['do_quietly', 'do_quietly', 'do_quietly'])
    )
    for (const mode of AUTOPILOT_MODES) {
      const levels = presetLevels(mode, loose)
      for (const key of Object.keys(FIXED_RULES)) expect(levels.has(key)).toBe(false)
    }
  })

  it('caps each result at the row maxLevel', () => {
    const capped = [
      def('regret_client', ['do_and_tell', 'do_quietly', 'do_quietly'], {
        maxLevel: 'draft_and_ask',
      }),
    ]
    for (const mode of AUTOPILOT_MODES) {
      expect(presetLevels(mode, capped).get('regret_client')).toBe('draft_and_ask')
    }
  })

  it('caps a priced client send at Draft and ask even without a maxLevel', () => {
    const loose = [def('payment_reminders', ['do_quietly', 'do_quietly', 'do_quietly'])]
    expect(presetLevels('hands_off', loose).get('payment_reminders')).toBe('draft_and_ask')
  })

  it('refuses a broken seed: never on an unlocked row', () => {
    expect(() => presetLevels('careful', [def('withdraw_rfq', ['never', 'off', 'off'])])).toThrow(
      /withdraw_rfq/
    )
  })
})

describe('validateLevel', () => {
  it('accepts only the lock on a locked row', () => {
    const quote = { key: 'send_quotation', lockedLevel: 'draft_and_ask' as const, maxLevel: null }
    expect(validateLevel(quote, 'draft_and_ask')).toEqual({ success: true, data: 'draft_and_ask' })
    for (const level of ['off', 'suggest', 'do_and_tell', 'do_quietly', 'never'] as const) {
      expect(validateLevel(quote, level).success).toBe(false)
    }
    const pay = { key: 'supplier_payments', lockedLevel: 'never' as const, maxLevel: null }
    expect(validateLevel(pay, 'never').success).toBe(true)
    expect(validateLevel(pay, 'draft_and_ask').success).toBe(false)
  })

  it('treats a fixed rule as a lock whatever the row says', () => {
    expect(
      validateLevel({ key: 'supplier_pos', lockedLevel: null, maxLevel: null }, 'do_and_tell')
        .success
    ).toBe(false)
    expect(
      validateLevel({ key: 'supplier_payments', lockedLevel: null, maxLevel: null }, 'off').success
    ).toBe(false)
  })

  it('refuses never on a row that is not locked at never', () => {
    expect(
      validateLevel({ key: 'withdraw_rfq', lockedLevel: null, maxLevel: null }, 'never').success
    ).toBe(false)
  })

  it('refuses any level above the cap and accepts the cap and below', () => {
    const regret = { key: 'regret_client', lockedLevel: null, maxLevel: 'draft_and_ask' as const }
    expect(validateLevel(regret, 'do_and_tell').success).toBe(false)
    expect(validateLevel(regret, 'do_quietly').success).toBe(false)
    expect(allowedLevels(regret)).toEqual(['off', 'suggest', 'draft_and_ask'])
  })

  it('lists one allowed level for a locked row', () => {
    expect(
      allowedLevels({ key: 'claim_draft', lockedLevel: 'draft_and_ask', maxLevel: null })
    ).toEqual(['draft_and_ask'])
  })
})

describe('carefulSendViolations', () => {
  it('passes the Careful defaults, chase_suppliers being the allowed exception', () => {
    expect(carefulSendViolations(DEFS)).toEqual([])
  })

  it('flags an external send that would act on its own under Careful', () => {
    const bad = [
      def('send_supplier_rfqs', ['do_and_tell', 'do_and_tell', 'do_and_tell']),
      def('follow_up_emails', ['do_quietly', 'draft_and_ask', 'draft_and_ask']),
      def('ack_website', ['do_and_tell', 'do_and_tell', 'do_and_tell']),
      def('classify_mail', ['do_quietly', 'do_quietly', 'do_quietly']),
    ]
    expect(carefulSendViolations(bad)).toEqual(['send_supplier_rfqs', 'follow_up_emails'])
  })
})
