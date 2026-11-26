import { describe, expect, it } from 'vitest'
import type { Signal } from './signals'
import { domainMatchesName, fitConfidenceOf, qualifyVerdict, type ModelRead } from './verdict'

const ok = (text: string): Signal => ({ mark: 'ok', text })
const model = (over: Partial<ModelRead> = {}): ModelRead => ({
  legitimacy: { verdict: 'legitimate', confidence: 'sure' },
  fit: { confidence: 'likely' },
  suggestedPath: 'quote_partial',
  pathConfidence: 'likely',
  regretLineNos: [14],
  askLineNos: [],
  ...over,
})
const base = {
  legitimacySignals: [ok('domain'), ok('website')],
  fitSignals: [ok('fit')],
  codeLegitimacy: 'legitimate' as const,
  fit: { fit: 11, of: 14 },
  lineNos: Array.from({ length: 14 }, (_, i) => i + 1),
}

describe('qualifyVerdict (board 167)', () => {
  it('legitimate, partial: Legitimate · Sure, Fit · Likely, Suggested · Likely', () => {
    const v = qualifyVerdict({ ...base, model: model() })
    expect(v).toMatchObject({
      legitimacy: 'legitimate',
      legitimacyConfidence: 'sure',
      fitConfidence: 'likely',
      suggestedPath: 'quote_partial',
      pathConfidence: 'likely',
      regretLineNos: [14],
      realBuyerQuestion: false,
      notes: [],
    })
  })

  it('a spam link wins over the model and is Sure (171b state 3)', () => {
    const v = qualifyVerdict({ ...base, codeLegitimacy: 'spam', model: model() })
    expect(v).toMatchObject({
      legitimacy: 'spam',
      legitimacyConfidence: 'sure',
      suggestedPath: 'ignore_spam',
    })
    expect(v.pathConfidence).toBe('likely')
    expect(
      qualifyVerdict({
        ...base,
        codeLegitimacy: 'spam',
        model: model({
          legitimacy: { verdict: 'spam', confidence: 'sure' },
          suggestedPath: 'ignore_spam',
        }),
      }).pathConfidence
    ).toBe('sure')
  })

  it('suspicious signals ask "Is this a real buyer?" and are Unsure (171b state 2)', () => {
    const v = qualifyVerdict({
      ...base,
      legitimacySignals: [{ mark: 'bad', text: 'new domain' }],
      codeLegitimacy: 'suspicious',
      model: model({
        legitimacy: { verdict: 'suspicious', confidence: 'likely' },
        suggestedPath: 'ask_client_first',
      }),
    })
    expect(v).toMatchObject({
      legitimacy: 'suspicious',
      realBuyerQuestion: true,
      pathConfidence: 'unsure',
    })
    expect(v.legitimacyConfidence).toBe('likely')
  })

  it('disagreement between model and code is Unsure, with the reason', () => {
    const v = qualifyVerdict({
      ...base,
      model: model({ legitimacy: { verdict: 'suspicious', confidence: 'sure' } }),
    })
    expect(v.legitimacyConfidence).toBe('unsure')
    expect(v.realBuyerQuestion).toBe(true)
    expect(v.notes[0]).toContain('model read suspicious')
  })

  it('code never suggests ignoring without a spam signal; checks line numbers', () => {
    const v = qualifyVerdict({ ...base, model: model({ suggestedPath: 'ignore_spam' }) })
    expect(v.suggestedPath).toBe('ask_client_first')
    expect(qualifyVerdict({ ...base, model: model({ regretLineNos: [] }) }).suggestedPath).toBe(
      'quote_fully'
    )
    expect(
      qualifyVerdict({ ...base, model: model({ regretLineNos: base.lineNos }) }).suggestedPath
    ).toBe('regret')
    const stray = qualifyVerdict({ ...base, model: model({ regretLineNos: [14, 99] }) })
    expect(stray.regretLineNos).toEqual([14])
    expect(stray.notes).toEqual(['The regret list named a line that is not on the enquiry'])
    expect(stray.pathConfidence).toBe('likely')
    const ask = qualifyVerdict({
      ...base,
      model: model({ suggestedPath: 'ask_client_first', askLineNos: [3, 2, 3] }),
    })
    expect(ask.askLineNos).toEqual([2, 3])
    expect(ask.regretLineNos).toEqual([])
  })

  it('warnings cap legitimacy at Likely; bad fit caps a full quote', () => {
    const v = qualifyVerdict({
      ...base,
      legitimacySignals: [{ mark: 'warn', text: 'webmail' }],
      fitSignals: [{ mark: 'bad', text: 'outside range' }],
      fit: { fit: 14, of: 14 },
      model: model({
        fit: { confidence: 'sure' },
        suggestedPath: 'quote_fully',
        pathConfidence: 'sure',
      }),
    })
    expect(v.legitimacyConfidence).toBe('likely')
    expect(v.pathConfidence).toBe('likely')
  })
})

describe('fitConfidenceOf and domainMatchesName', () => {
  it('fit bands', () => {
    expect(fitConfidenceOf(13, 14)).toBe('sure')
    expect(fitConfidenceOf(11, 14)).toBe('likely')
    expect(fitConfidenceOf(5, 14)).toBe('unsure')
    expect(fitConfidenceOf(0, 0)).toBe('unsure')
  })
  it('domain names the company', () => {
    expect(domainMatchesName('sample-mining.example.test', 'Sample Mining Services')).toBe(true)
    expect(domainMatchesName('smsgroup.example', 'Sample Mining Services')).toBe(true)
    expect(domainMatchesName('quickparts.example', 'Sample Mining Services')).toBe(false)
    expect(domainMatchesName(null, 'Sample Mining Services')).toBeNull()
    expect(domainMatchesName('example.test', null)).toBeNull()
  })
})
