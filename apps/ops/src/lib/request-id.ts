/**
 * Request ids for server actions (architecture §4.9): a UUIDv7 (RFC 9562 §5.7), so ids sort by
 * time in Sentry and in logs, tagged on the Sentry scope and shown to the person as "Ref <id>"
 * when an action fails. It identifies a request, never a record: nothing is stored under it.
 *
 * Web Crypto only (no `node:` import), so it runs in the Node and Edge runtimes alike.
 */

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

/** A new UUIDv7: 48-bit Unix milliseconds, version 7, 74 random bits, RFC 4122 variant. */
export function newRequestId(now: number = Date.now()): string {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  let ms = Math.max(0, Math.floor(now))
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms % 256
    ms = Math.floor(ms / 256)
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** True for a well-formed lowercase UUIDv7. */
export function isRequestId(value: string): boolean {
  return UUID_V7.test(value)
}

/** The Unix milliseconds a UUIDv7 carries. */
export function requestIdTime(id: string): number {
  return Number.parseInt(id.replaceAll('-', '').slice(0, 12), 16)
}
