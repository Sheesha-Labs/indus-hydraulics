import { KIT_VOCABULARY_FAMILIES, VOCABULARY_WORDS } from '@indus/ops-core'
import { describe, expect, it, vi } from 'vitest'
import kitVocabulary from './__fixtures__/kit-vocabulary.json'
import { problemsIn } from './guards/token-classes'
import {
  ASSISTANT_PILL,
  KIT_STATUS_FAMILIES,
  MAIL_ROLE_TONE,
  MAIL_TYPE_TONE,
  STATUS_FAMILY_META,
  STATUS_VOCABULARY,
  statusTone,
  statusToneLoose,
  TONE_CLASS,
  type StatusFamily,
} from './status'
import type { ChipProps } from './status/Chip'
import type { Tone } from './types'

const TONES: Tone[] = ['ok', 'warn', 'bad', 'n', 'acc', 'navy', 'out', 'solid-ok', 'solid-bad']
const FAMILIES = Object.keys(STATUS_VOCABULARY) as StatusFamily[]

describe('STATUS_VOCABULARY', () => {
  it('the 12 kit families equal the Status kit S table (words, tones and order)', () => {
    const ours = Object.fromEntries(KIT_STATUS_FAMILIES.map((f) => [f, STATUS_VOCABULARY[f]]))
    expect(Object.keys(kitVocabulary)).toEqual([...KIT_STATUS_FAMILIES])
    for (const f of KIT_STATUS_FAMILIES)
      expect({ [f]: Object.entries(ours[f]!) }).toEqual({ [f]: Object.entries(kitVocabulary[f]) })
  })

  it('names the same kit families as ops-core', () => {
    expect([...KIT_STATUS_FAMILIES]).toEqual([...KIT_VOCABULARY_FAMILIES])
  })

  it('has exactly the words ops-core lists per family, in the same order', () => {
    expect(FAMILIES.sort()).toEqual(Object.keys(VOCABULARY_WORDS).sort())
    for (const f of FAMILIES)
      expect({ [f]: Object.keys(STATUS_VOCABULARY[f]) }).toEqual({ [f]: [...VOCABULARY_WORDS[f]] })
  })

  it('every spec is a tone, optionally struck', () => {
    for (const f of FAMILIES)
      for (const [word, spec] of Object.entries(STATUS_VOCABULARY[f]))
        expect(TONES.map((t) => `${f}/${word}:${t}`)).toContain(
          `${f}/${word}:${spec.replace(/~$/, '')}`
        )
  })

  it('every family has a title and a note', () => {
    expect(Object.keys(STATUS_FAMILY_META).sort()).toEqual([...FAMILIES].sort())
    for (const f of FAMILIES) {
      expect(STATUS_FAMILY_META[f].title).not.toBe('')
      expect(STATUS_FAMILY_META[f].note).not.toBe('')
    }
  })
})

describe('TONE_CLASS', () => {
  it('every tone has classes, and every class resolves to a token', () => {
    expect(Object.keys(TONE_CLASS).sort()).toEqual([...TONES].sort())
    for (const t of TONES) {
      expect(TONE_CLASS[t]).not.toBe('')
      expect({ [t]: problemsIn(TONE_CLASS[t]) }).toEqual({ [t]: [] })
    }
  })

  it('the assistant pill and mail tones resolve too', () => {
    for (const p of Object.values(ASSISTANT_PILL))
      expect(problemsIn(`${p.bg} ${p.ink} ${p.dot}`)).toEqual([])
    for (const t of [...Object.values(MAIL_TYPE_TONE), ...Object.values(MAIL_ROLE_TONE)])
      expect(TONES).toContain(t)
  })
})

describe('statusTone', () => {
  it('"No reply" is bad on supplier RFQs and recipients, warn on a client response', () => {
    expect(statusTone('rfq', 'No reply').tone).toBe('bad')
    expect(statusTone('recipient', 'No reply').tone).toBe('bad')
    expect(statusTone('client', 'No reply').tone).toBe('warn')
  })

  it('"Quoted" depends on the family too', () => {
    expect(statusTone('enquiry', 'Quoted').tone).toBe('acc')
    expect(statusTone('line', 'Quoted').tone).toBe('ok')
  })

  it('Superseded and Withdrawn strike; their tone drops the ~', () => {
    expect(statusTone('doc', 'Superseded')).toEqual({ tone: 'n', strike: true })
    expect(statusTone('rfq', 'Withdrawn')).toEqual({ tone: 'n', strike: true })
    expect(statusTone('recipient', 'Withdrawn')).toEqual({ tone: 'n', strike: true })
    expect(statusTone('quotation', 'Superseded').strike).toBe(true)
    expect(statusTone('doc', 'Approved')).toEqual({ tone: 'ok', strike: false })
  })

  it('statusToneLoose resolves known words and falls back to neutral with a dev warning', () => {
    expect(statusToneLoose('money', 'Overdue')).toEqual({ tone: 'bad', strike: false })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(statusToneLoose('money', 'Mystery')).toEqual({ tone: 'n', strike: false })
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('types: a word needs its family, and must belong to it', () => {
    // @ts-expect-error a status word without a family
    const noFamily: ChipProps = { status: 'Quoted' }
    // @ts-expect-error "Viewed" is not a supplier RFQ word
    const wrongFamily: ChipProps<'rfq'> = { family: 'rfq', status: 'Viewed' }
    // @ts-expect-error a tone without a word
    const noWord: ChipProps = { tone: 'ok' }
    const ok: ChipProps<'rfq'> = { family: 'rfq', status: 'No reply' }
    expect([noFamily, wrongFamily, noWord, ok]).toHaveLength(4)
  })
})
