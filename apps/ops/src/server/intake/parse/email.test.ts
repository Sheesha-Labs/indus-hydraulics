import { describe, expect, it } from 'vitest'
import { parseEmail, readableText } from './email'

describe('parseEmail', () => {
  it('keeps the stored text and hash; reads fresh and forwarded segments only', () => {
    const bodyText =
      'Please address.\n\n---------- Forwarded message ---------\nFrom: Buyer <b@sample-client.test>\nDate: 3 Nov 2026\nSubject: RFQ\n\nQuote 10 nos TEST-0001\n\nOn Mon, someone wrote:\n> old'
    const doc = parseEmail({ bodyText, bodyTextHash: 'h1', subject: 'Fwd: RFQ' })
    if (doc.kind !== 'email') throw new Error(doc.kind)
    expect(doc.textHash).toBe('h1')
    expect(doc.forwards[0]!.from).toBe('Buyer <b@sample-client.test>')
    const parts = readableText(doc)
    expect(parts.map((p) => p.text).join('|')).toContain('Quote 10 nos TEST-0001')
    expect(parts.map((p) => p.text).join('|')).not.toContain('> old')
    for (const p of parts) expect(bodyText.slice(p.start, p.start + p.text.length)).toBe(p.text)
  })
  it('no body is unreadable', () => {
    expect(parseEmail({ bodyText: null, bodyTextHash: null, subject: null }).kind).toBe(
      'unreadable'
    )
  })
})
