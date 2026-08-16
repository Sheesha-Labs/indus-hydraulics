import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guard the two halves of the analytics CSP contract.
 *
 * The storefront mounts <GoogleAnalytics> in (storefront)/layout.tsx whenever
 * GA_MEASUREMENT_ID is set. If googletagmanager.com is missing from
 * `script-src`, the browser refuses gtag/js and GA4 records NOTHING — and the
 * only symptom is a console violation, so the site looks healthy while the
 * analytics dashboard sits empty. That shipped and went unnoticed.
 *
 * The other half matters just as much in the other direction: admin URLs embed
 * customer ids, RFQ codes and quote codes, so the admin CSP deliberately
 * carries no third-party analytics origin at all. A well-meaning "keep the two
 * policies in sync" edit would turn that into a data leak.
 *
 * Parsed from the source rather than asserted against a live response so it
 * runs in CI with no server.
 */

const PROXY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../proxy.ts',
)

const src = readFileSync(PROXY, 'utf8')

/** Pull one CSP array's joined body out of the source. */
function policyBody(constName: string): string {
  const start = src.indexOf(`const ${constName} = [`)
  expect(start, `${constName} not found in proxy.ts`).toBeGreaterThan(-1)
  const end = src.indexOf(`].join('; ')`, start)
  expect(end, `${constName} is no longer a joined array`).toBeGreaterThan(start)

  const body = src.slice(start, end)
  // Inline the ORIGINS constants so the assertions see the real values.
  return body.replace(/\$\{(\w+)\}/g, (_, name: string) => {
    const m = src.match(new RegExp(`const ${name} =\\s*\\n?\\s*'([^']*)'`))
    return m ? m[1]! : ''
  })
}

const STOREFRONT = policyBody('STOREFRONT_CSP')
const ADMIN = policyBody('ADMIN_CSP')

describe('analytics CSP', () => {
  test('storefront script-src allows the Google tag', () => {
    expect(STOREFRONT).toContain('https://www.googletagmanager.com')
  })

  test('storefront connect-src allows the GA collect endpoints', () => {
    // script-src alone loads the tag but every beacon it sends is then
    // blocked, which fails exactly the same way from the dashboard's side.
    expect(STOREFRONT).toContain('https://www.google-analytics.com')
    expect(STOREFRONT).toContain('https://*.analytics.google.com')
  })

  test('admin carries NO third-party analytics origin', () => {
    // Admin URLs embed customer ids, RFQ codes and quote codes.
    for (const origin of [
      'googletagmanager',
      'google-analytics',
      'analytics.google',
      'posthog',
      'vercel-scripts',
      'vercel-insights',
    ]) {
      expect(ADMIN, `admin CSP must not allow ${origin}`).not.toContain(origin)
    }
  })

  test('both policies still declare the directives being asserted', () => {
    // If a rename ever makes policyBody() return something unexpected, the
    // assertions above would pass vacuously on an empty string.
    for (const [name, body] of [
      ['STOREFRONT_CSP', STOREFRONT],
      ['ADMIN_CSP', ADMIN],
    ] as const) {
      expect(body, `${name} lost script-src`).toContain('script-src')
      expect(body, `${name} lost connect-src`).toContain('connect-src')
      expect(body.length, `${name} parsed as suspiciously short`).toBeGreaterThan(120)
    }
  })
})
