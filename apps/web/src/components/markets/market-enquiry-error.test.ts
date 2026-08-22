import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * The market enquiry forms must not print the desk address twice.
 *
 * `submitMarketEnquiry` names the address inside two of its own replies — the
 * honeypot's "Email sales@indushydraulics.me and we will pick it up." and the
 * retired-market one. A form that appends "Or email <address>." to every error
 * renders the address twice in one sentence, which reads as a bug to the buyer
 * it is trying to rescue. It shipped that way on two of the three forms and
 * was found only by tripping the honeypot by hand.
 *
 * Nothing else catches it. The markup is valid, the props are typed, the guard
 * is a boolean in JSX — there is no compile error, no lint rule and no
 * snapshot. So the rule is structural rather than visual: a form that posts to
 * `submitMarketEnquiry` renders its error through `MarketEnquiryError`, which
 * owns the guard, instead of writing its own alert paragraph. Fixing the guard
 * once then fixes it everywhere, including forms added after this test.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SHARED = 'MarketEnquiryError'

function marketComponents(): Array<{ name: string; source: string }> {
  return readdirSync(HERE)
    .filter((name) => name.endsWith('.tsx'))
    .map((name) => ({ name, source: readFileSync(path.join(HERE, name), 'utf8') }))
}

describe('market enquiry error rendering', () => {
  // Importing the action, not merely naming it — this file's own docblock
  // mentions `submitMarketEnquiry`, and so may the shared block's.
  const forms = marketComponents().filter((file) => file.source.includes("markets/actions'"))

  test('there is at least one enquiry form to check', () => {
    expect(forms.length).toBeGreaterThan(0)
  })

  test.each(forms.map((file) => file.name))('%s renders its error through the shared block', (name) => {
    const { source } = forms.find((file) => file.name === name)!
    expect(source).toContain(`<${SHARED}`)
    // A hand-rolled alert paragraph is how the duplicate address got in.
    expect(source).not.toMatch(/role="alert"/)
  })

  test('the shared block suppresses the offer when the message already names the address', () => {
    const source = readFileSync(path.join(HERE, `${SHARED}.tsx`), 'utf8')
    expect(source).toContain('!error.includes(contactEmail)')
  })
})
