import { describe, expect, it } from 'vitest'
import { ENQUIRY_STAGE_WORD, LABEL_MAPS, ORDER_STAGE_WORD, type EnquiryStage } from './labels'
import { isVocabularyWord, VOCABULARY_WORDS, type VocabularyWord } from './vocabulary'

const MAPS = Object.entries(LABEL_MAPS)

describe('stored enum → vocabulary word', () => {
  it('covers the 14 mirrored enums', () => {
    expect(MAPS.map(([name]) => name).sort()).toEqual(
      [
        'ACTION_STATE_WORD',
        'AUTOPILOT_LEVEL_WORD',
        'CLIENT_INVOICE_STATUS_WORD',
        'DOCUMENT_STATUS_WORD',
        'ENQUIRY_STAGE_WORD',
        'LINE_STATUS_WORD',
        'MAILBOX_STATUS_WORD',
        'ORDER_STAGE_WORD',
        'QUOTATION_CLIENT_STATUS_WORD',
        'QUOTATION_STATUS_WORD',
        'RECIPIENT_STATUS_WORD',
        'SUPPLIER_PAYMENT_STATUS_WORD',
        'SUPPLIER_PO_STATUS_WORD',
        'SUPPLIER_QUOTE_STATUS_WORD',
      ].sort()
    )
  })

  it.each(MAPS)('%s maps every value to a word of its family, and nothing else', (_, map) => {
    const words = map.words as Record<string, string>
    expect(Object.keys(words).sort()).toEqual([...map.values].sort())
    for (const value of map.values) {
      expect({ [value]: isVocabularyWord(map.family, words[value]!) }).toEqual({ [value]: true })
    }
  })

  it('enum tuples have no duplicate values', () => {
    for (const [, map] of MAPS) expect([...new Set(map.values)]).toEqual([...map.values])
  })

  it('groups enquiry stages for display (C7)', () => {
    expect(ENQUIRY_STAGE_WORD.new).toBe('Enquiry')
    expect(ENQUIRY_STAGE_WORD.qualifying).toBe('Enquiry')
    expect(ENQUIRY_STAGE_WORD.quotes_in).toBe('Quotes in')
    expect(ENQUIRY_STAGE_WORD.pricing).toBe('Quotes in')
  })

  it('order stages keep Closed and Cancelled apart from Paid', () => {
    expect(ORDER_STAGE_WORD.closed).toBe('Closed')
    expect(ORDER_STAGE_WORD.cancelled).toBe('Cancelled')
  })

  it('a value without a word, or a word from another family, fails typecheck', () => {
    // A new enum value with no entry: `satisfies Record<…>` reports the missing key.
    const missing = {
      ...ENQUIRY_STAGE_WORD,
      // @ts-expect-error 'on_hold' has no word
    } satisfies Record<EnquiryStage | 'on_hold', VocabularyWord<'enquiry'>>
    const foreign = {
      // @ts-expect-error 'Viewed' is a document word, not an enquiry word
      new: 'Viewed',
    } satisfies Partial<Record<EnquiryStage, VocabularyWord<'enquiry'>>>
    expect([missing, foreign]).toHaveLength(2)
  })
})

describe('vocabulary words', () => {
  it('has no duplicate word inside a family', () => {
    for (const [family, words] of Object.entries(VOCABULARY_WORDS))
      expect({ [family]: [...new Set(words)] }).toEqual({ [family]: [...words] })
  })

  it('isVocabularyWord is exact and family-scoped', () => {
    expect(isVocabularyWord('rfq', 'No reply')).toBe(true)
    expect(isVocabularyWord('rfq', 'no reply')).toBe(false)
    expect(isVocabularyWord('enquiry', 'Viewed')).toBe(false)
  })
})
