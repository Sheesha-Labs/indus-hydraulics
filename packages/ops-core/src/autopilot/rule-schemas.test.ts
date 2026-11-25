import { describe, expect, it } from 'vitest'
import {
  levelConsequence,
  parseRules,
  RULE_FORMS,
  ruleForm,
  rulesWithDefaults,
  switchConsequences,
  verbPhrase,
} from './rule-schemas'

describe('rule schemas (board 99)', () => {
  it('every form’s defaults validate and every field is in its schema', () => {
    for (const [key, form] of Object.entries(RULE_FORMS)) {
      expect(parseRules(key, form.defaults).ok, key).toBe(true)
      for (const f of form.fields) expect(Object.keys(form.defaults), key).toContain(f.name)
    }
  })
  it('chasers are capped at 3 and need whole working days', () => {
    const d = ruleForm('chase_suppliers').defaults
    expect(parseRules('chase_suppliers', { ...d, max: 4 }).ok).toBe(false)
    expect(parseRules('chase_suppliers', { ...d, everyWorkingDays: 1.5 }).ok).toBe(false)
    expect(parseRules('chase_suppliers', { ...d, noFridayAfter: '3pm' }).ok).toBe(false)
    expect(parseRules('chase_suppliers', { ...d, extra: true }).ok).toBe(false)
  })
  it('an action without rules takes only an empty object', () => {
    expect(parseRules('classify_mail', {}).ok).toBe(true)
    expect(parseRules('classify_mail', { x: 1 }).ok).toBe(false)
  })
  it('old rows are read over the defaults, unknown keys dropped', () => {
    expect(rulesWithDefaults('chase_suppliers', { max: 2, stray: 1 })).toMatchObject({
      max: 2,
      everyWorkingDays: 2,
    })
    expect(rulesWithDefaults('chase_suppliers', null).max).toBe(3)
  })
  it('consequences: the chaser copy and the generic sentence', () => {
    expect(levelConsequence('chase_suppliers', 'off')).toBe(
      'No chasers. Late suppliers show in Waiting on others only.'
    )
    expect(levelConsequence('extract_lines', 'draft_and_ask')).toContain('waits in Review')
  })
  it('the switch confirmation lists the rules and what still asks', () => {
    const c = switchConsequences('chase_suppliers', 'do_and_tell', {})
    expect(c.from[0]).toBe(
      'Chasers send from purchase@ 1 working day after reply-by, then every 2, up to 3.'
    )
    expect(c.stillAsks).toBe(
      'Still asks you for new suppliers, Trial suppliers and RFQs above USD 50,000.'
    )
    expect(verbPhrase('Chase suppliers')).toBe('chase suppliers')
  })
})
