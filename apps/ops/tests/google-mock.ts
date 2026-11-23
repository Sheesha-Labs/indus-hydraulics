import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * The e2e stand-in for Google (S03-T07): oauth2-mock-server on a fixed local port, so the dev server can
 * be started with OPS_E2E_GOOGLE_ISSUER=http://localhost:<port> before Playwright runs. Each test picks
 * the ID token claims it wants (email, hd, email_verified) by writing them to a claims file; the
 * server's beforeTokenSigning hook reads that file at token time. Tests that use it run serially.
 */
export const GOOGLE_MOCK_PORT = Number(process.env.OPS_E2E_GOOGLE_PORT ?? 8089)
export const GOOGLE_MOCK_ISSUER = `http://localhost:${GOOGLE_MOCK_PORT}`
const CLAIMS_FILE = join(tmpdir(), `ops-e2e-google-claims-${GOOGLE_MOCK_PORT}.json`)

export type GoogleClaims = { email: string; hd?: string | null; email_verified?: boolean }

export function setGoogleClaims(claims: GoogleClaims): void {
  writeFileSync(CLAIMS_FILE, JSON.stringify(claims))
}

export function readGoogleClaims(): GoogleClaims | null {
  try {
    return JSON.parse(readFileSync(CLAIMS_FILE, 'utf8')) as GoogleClaims
  } catch {
    return null
  }
}
