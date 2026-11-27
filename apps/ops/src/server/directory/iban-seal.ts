import 'server-only'
import { createHmac } from 'node:crypto'
import { normaliseIban } from '@indus/ops-core'
import { additionalData, keyRingFromEnv, openText, seal } from '../../lib/crypto'
import { env } from '../../lib/env'

/**
 * Supplier IBANs at rest (S10-T05, architecture §4.11): sealed with the S04 AES-256-GCM key ring, additional data
 * `supplier_iban:<supplierId>` so a ciphertext copied to another supplier fails to open. Opened only by the payment
 * engine (S27) and the identifier check; no data function returns it. `ibanHash` is an HMAC of the normalised IBAN
 * for the blocked-counterparty match: equal IBANs give equal hashes, and the hash cannot be reversed without the key.
 */
const PURPOSE = 'supplier_iban'

export function sealIban(iban: string, supplierId: string): Buffer {
  return Buffer.from(seal(normaliseIban(iban), additionalData(PURPOSE, supplierId)), 'utf8')
}

/** Server-only: the full IBAN, for the payment instruction (S27). Never returned to the browser. */
export function openIban(sealed: Uint8Array, supplierId: string): string {
  return openText(Buffer.from(sealed).toString('utf8'), additionalData(PURPOSE, supplierId))
}

function hashKey(): string {
  const e = env()
  if (e.OPS_AUTH_SECRET) return e.OPS_AUTH_SECRET
  const ring = keyRingFromEnv()
  return ring.keys[ring.active]!
}

export function ibanHash(iban: string): string {
  return createHmac('sha256', hashKey())
    .update(`iban:${normaliseIban(iban)}`)
    .digest('hex')
}
