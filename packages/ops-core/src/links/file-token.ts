/**
 * Scoped file tokens (S11-T04, ADR-21): `/api/files/<id>?t=<token>` opens one stored file without a session,
 * for at most ten minutes. Pure: the format, the claims and the expiry rule live here; the HMAC is computed on
 * the server with the rotating key ring (the token names the key it was signed with, so keys rotate).
 *
 *   token = base64url(JSON claims) + "." + base64url(HMAC-SHA256(key, base64url(JSON claims)))
 */
export const FILE_TOKEN_MAX_SECONDS = 600

export interface FileTokenClaims {
  typ: 'ops-file'
  /** The stored_file id. */
  fid: string
  /** Expiry, Unix seconds. */
  exp: number
  /** Id of the key it was signed with. */
  kid: string
}

const b64url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64url = (s: string) => {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Claims for a file, valid for `ttlSeconds` (clamped to 1–600). */
export function fileTokenClaims(
  fid: string,
  nowMs: number,
  ttlSeconds: number,
  kid: string
): FileTokenClaims {
  const ttl = Math.min(FILE_TOKEN_MAX_SECONDS, Math.max(1, Math.floor(ttlSeconds)))
  return { typ: 'ops-file', fid, exp: Math.floor(nowMs / 1000) + ttl, kid }
}

/** The signed part of a token. */
export function fileTokenBody(claims: FileTokenClaims): string {
  return b64url(JSON.stringify(claims))
}

export function encodeFileToken(claims: FileTokenClaims, signatureB64url: string): string {
  return `${fileTokenBody(claims)}.${signatureB64url}`
}

/** The token's parts when it is well formed (signature not checked here), else null. */
export function decodeFileToken(
  token: string
): { body: string; signature: string; claims: FileTokenClaims } | null {
  const parts = token.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  let claims: unknown
  try {
    claims = JSON.parse(unb64url(parts[0]))
  } catch {
    return null
  }
  const c = claims as Partial<FileTokenClaims>
  if (
    c?.typ !== 'ops-file' ||
    typeof c.fid !== 'string' ||
    !UUID.test(c.fid) ||
    typeof c.exp !== 'number' ||
    !Number.isInteger(c.exp) ||
    typeof c.kid !== 'string' ||
    !c.kid
  )
    return null
  return { body: parts[0], signature: parts[1], claims: c as FileTokenClaims }
}

/** Expired, or valid for longer than any token may be (a forged far-future expiry). */
export function fileTokenExpired(claims: FileTokenClaims, nowMs: number): boolean {
  const now = Math.floor(nowMs / 1000)
  return claims.exp <= now || claims.exp > now + FILE_TOKEN_MAX_SECONDS
}
