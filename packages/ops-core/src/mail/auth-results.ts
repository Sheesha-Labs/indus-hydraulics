/**
 * `Authentication-Results` → { spf, dkim, dmarc } (S04-T05; a phishing signal in S05, 08-map-integrations
 * §1.11). Several headers may be present; the first verdict for each method wins (the receiving server's own
 * header comes first). Pure.
 */
export type AuthVerdict =
  'pass' | 'fail' | 'softfail' | 'none' | 'neutral' | 'temperror' | 'permerror' | 'policy'
export type AuthSummary = {
  spf: AuthVerdict | null
  dkim: AuthVerdict | null
  dmarc: AuthVerdict | null
}

const VERDICTS = new Set<AuthVerdict>([
  'pass',
  'fail',
  'softfail',
  'none',
  'neutral',
  'temperror',
  'permerror',
  'policy',
])

export function parseAuthenticationResults(
  headers: string | readonly string[] | null | undefined
): AuthSummary {
  const out: AuthSummary = { spf: null, dkim: null, dmarc: null }
  const list = headers == null ? [] : typeof headers === 'string' ? [headers] : headers
  for (const header of list) {
    for (const method of ['spf', 'dkim', 'dmarc'] as const) {
      if (out[method]) continue
      const m = new RegExp(`(?:^|[;\\s])${method}\\s*=\\s*([a-z]+)`, 'i').exec(header)
      const verdict = m?.[1]?.toLowerCase() as AuthVerdict | undefined
      if (verdict && VERDICTS.has(verdict)) out[method] = verdict
    }
  }
  return out
}
