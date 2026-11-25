import { randomBytes } from 'node:crypto'

/**
 * A UUIDv7 (RFC 9562): 48-bit Unix milliseconds, then random bits, version 7 and the RFC variant. For the rare
 * row whose id must be known before it is inserted (an ENQ number is allocated against the enquiry's id in the
 * same transaction); everywhere else Prisma's `uuid(7)` default does it.
 */
export function uuid7(now = Date.now()): string {
  const b = randomBytes(16)
  const ms = BigInt(now)
  for (let i = 0; i < 6; i++) b[i] = Number((ms >> BigInt(8 * (5 - i))) & 0xffn)
  b[6] = (b[6]! & 0x0f) | 0x70
  b[8] = (b[8]! & 0x3f) | 0x80
  const h = b.toString('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
