import { describe, expect, it } from 'vitest'
import { noteIsClean, verifyOooFacts } from './mail-states'

const BODY =
  'I am out of the office until 1 December. For urgent matters please contact Alex Example, alex@example-valve.test.'

describe('verifyOooFacts', () => {
  const base = {
    returnDate: '2026-12-01',
    alternateContact: { name: 'Alex Example', email: 'alex@example-valve.test' },
    reasons: [{ text: 'Return date', quote: 'until 1 December' }],
  }

  it('keeps a date with a resolving quote and a verbatim alternate', () => {
    expect(verifyOooFacts(base, BODY, '2026-11-24', 'away@example-valve.test')).toEqual({
      returnDate: '2026-12-01',
      alternate: { name: 'Alex Example', email: 'alex@example-valve.test' },
      resolvedQuotes: 1,
    })
  })

  it('drops an out-of-bounds date and a date whose quote does not resolve', () => {
    expect(
      verifyOooFacts({ ...base, returnDate: '2027-06-01' }, BODY, '2026-11-24', 'x@y.test')
        .returnDate
    ).toBeNull()
    expect(
      verifyOooFacts(
        { ...base, reasons: [{ text: 'Return', quote: 'back on Monday' }] },
        BODY,
        '2026-11-24',
        'x@y.test'
      ).returnDate
    ).toBeNull()
  })

  it('drops an alternate that is not written in the email, or is the sender', () => {
    const invented = {
      ...base,
      alternateContact: { name: 'Alex', email: 'alex.e@example-valve.test' },
    }
    expect(verifyOooFacts(invented, BODY, '2026-11-24', 'x@y.test').alternate).toBeNull()
    expect(verifyOooFacts(base, BODY, '2026-11-24', 'ALEX@example-valve.test').alternate).toBeNull()
  })

  it('a note with a figure, an address or a link is not clean', () => {
    expect(noteIsClean('Could you send a copy without a password? Thank you.')).toBe(true)
    expect(noteIsClean('Please send 2 copies')).toBe(false)
    expect(noteIsClean('Write to a@b.test')).toBe(false)
    expect(noteIsClean('See www.example.test')).toBe(false)
  })
})

describe('checkNote / fillNote', () => {
  it('needs each placeholder once and nothing else of its own', async () => {
    const { checkNote, fillNote } = await import('./mail-states')
    expect(checkNote('Could you send {files} without a password?', ['files'])).toEqual({ ok: true })
    expect(checkNote('Could you send it without a password?', ['files']).ok).toBe(false)
    expect(checkNote('Send {files} and {files}', ['files']).ok).toBe(false)
    expect(checkNote('Send {files} by {date}', ['files']).ok).toBe(false)
    expect(checkNote('Send {files} to a@b.test', ['files']).ok).toBe(false)
    expect(checkNote('Send {files} {', ['files']).ok).toBe(false)
    expect(fillNote('Send {files}.', { files: 'RFQ_12.pdf' })).toBe('Send RFQ_12.pdf.')
  })
})
