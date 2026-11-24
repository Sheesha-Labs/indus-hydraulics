/**
 * Header access for the detectors (S05-T03). Messages store headers as `Record<lowercase name, string[]>`
 * (apps/ops server/gmail/mime.ts); a detector reads the first value of a name, case-insensitively.
 */
export type HeaderMap = Readonly<Record<string, readonly string[] | undefined>>

export function header(headers: HeaderMap, name: string): string | null {
  const v = headers[name.toLowerCase()]
  return v && v.length > 0 ? (v[0] ?? null) : null
}

export function hasHeader(headers: HeaderMap, name: string): boolean {
  return header(headers, name) !== null
}

/** Every header whose name starts with `prefix` (lowercase). */
export function headersWithPrefix(headers: HeaderMap, prefix: string): string[] {
  return Object.keys(headers).filter((k) => k.startsWith(prefix.toLowerCase()))
}

/** "Name <a@b.example>" → "b.example"; lowercased; null when there is no @. */
export function domainOf(address: string): string | null {
  const at = address.lastIndexOf('@')
  if (at < 0) return null
  const d = address
    .slice(at + 1)
    .replace(/[>\s].*$/, '')
    .toLowerCase()
    .replace(/\.$/, '')
  return d || null
}
