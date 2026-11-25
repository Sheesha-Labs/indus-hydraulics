import { describe, expect, it } from 'vitest'
import { fillTemplate, salutation } from './templates'

describe('fillTemplate', () => {
  it('fills placeholders and reports the missing', () => {
    expect(
      fillTemplate('Ref {enquiry_ref}, by {revert_by}.', {
        enquiry_ref: 'ENQ-2026-0433',
        revert_by: '26 September',
      })
    ).toEqual({
      text: 'Ref ENQ-2026-0433, by 26 September.',
      missing: [],
    })
    expect(fillTemplate('{a} {b} {a}', { a: 'x', b: '' })).toEqual({
      text: 'x {b} x',
      missing: ['b'],
    })
  })
})

describe('salutation', () => {
  it.each([
    [{ salutation: 'Mr Haddad' }, 'Dear Mr Haddad,'],
    [{ salutation: 'Dear Ms Rao,' }, 'Dear Ms Rao,'],
    [{ firstName: 'Omar' }, 'Dear Omar,'],
    [{ name: 'Sample Buyer' }, 'Dear Sample Buyer,'],
    [null, 'Dear Sir/Madam,'],
  ])('%o', (c, out) => expect(salutation(c)).toBe(out))
})
