import { describe, expect, it } from 'vitest'
import { faqAnswerLinks, faqAnswerPlainText, parseFaqAnswer } from './faq-answer'

describe('parseFaqAnswer', () => {
  it('returns one text segment for an answer without links', () => {
    expect(parseFaqAnswer('316L stainless steel, forged.')).toEqual([
      { kind: 'text', text: '316L stainless steel, forged.' },
    ])
  })

  it('splits internal links out of the text, in order', () => {
    expect(
      parseFaqAnswer('Use the [R2AT ferrule](/p/r2at-ferrule) and see [the guide](/blog/crimping).'),
    ).toEqual([
      { kind: 'text', text: 'Use the ' },
      { kind: 'link', text: 'R2AT ferrule', href: '/p/r2at-ferrule' },
      { kind: 'text', text: ' and see ' },
      { kind: 'link', text: 'the guide', href: '/blog/crimping' },
      { kind: 'text', text: '.' },
    ])
  })

  it('keeps anchors and query strings on internal paths', () => {
    expect(faqAnswerLinks('[sizes](/p/x#sizes) [quote](/quote?sku=IH-1)')).toEqual([
      '/p/x#sizes',
      '/quote?sku=IH-1',
    ])
  })

  it('leaves external, protocol-relative and script hrefs as plain text', () => {
    for (const raw of [
      '[maker](https://example.com/x)',
      '[cdn](//evil.example/x)',
      '[x](javascript:alert(1))',
      '[x](p/relative)',
    ]) {
      expect(parseFaqAnswer(raw)).toEqual([{ kind: 'text', text: raw }])
    }
  })

  it('does not treat bracketed notes as links', () => {
    expect(parseFaqAnswer('Rated 5,000 psi [maker figure].')).toEqual([
      { kind: 'text', text: 'Rated 5,000 psi [maker figure].' },
    ])
  })

  it('keeps newlines inside text segments', () => {
    expect(faqAnswerPlainText('Line one.\n[Line two](/p/a)')).toBe('Line one.\nLine two')
  })
})

describe('faqAnswerPlainText', () => {
  it('drops link markup and keeps the words', () => {
    expect(faqAnswerPlainText('Pair it with the [matching seal kit](/p/seal-kit).')).toBe(
      'Pair it with the matching seal kit.',
    )
  })
})
