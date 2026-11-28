import 'server-only'
import type { $Enums, Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'

/**
 * Allocating and releasing numbers (S11-T08, ADR-15, CLAUDE.md §11.8). Numbers come only from
 * ops.allocate_number, inside the transaction that commits the approval: the type takes a transaction client, so
 * calling it outside one does not compile. Never SELECT max() + 1. Release only from an undo path where nothing
 * left the building (the caller proves it: the outbound email for the subject is not sent).
 */
export type NumberTx = Prisma.TransactionClient & { readonly $transaction?: never }

export async function allocate(
  tx: NumberTx,
  key: string,
  scope: string,
  subject: { type: $Enums.RecordType; id: string } | null
): Promise<{ value: bigint; formatted: string }> {
  const rows = subject
    ? await tx.$queryRaw<Array<{ value: bigint; formatted: string }>>`
        SELECT value, formatted FROM ops.allocate_number(${key}, ${scope}, ${subject.type}::ops."RecordType", ${subject.id}::uuid)`
    : await tx.$queryRaw<Array<{ value: bigint; formatted: string }>>`
        SELECT value, formatted FROM ops.allocate_number(${key}, ${scope})`
  const row = rows[0]
  if (!row) throw new Error(`allocate_number(${key}) returned nothing`)
  return row
}

export async function release(
  tx: NumberTx,
  key: string,
  formatted: string,
  proof: { outboundStatus: $Enums.OutboundStatus | null }
): Promise<void> {
  if (proof.outboundStatus === 'sent' || proof.outboundStatus === 'sending' || proof.outboundStatus === 'unknown')
    throw new SafeError('That number has left the building; it cannot be given back.')
  await tx.$executeRaw`SELECT ops.release_number(${key}, ${formatted})`
}

/** The number the next allocation would give, or null while the sequence is unseeded. Reads only. */
export async function peek(
  db: Pick<Prisma.TransactionClient, '$queryRaw'>,
  key: string,
  scope = ''
): Promise<string | null> {
  const [row] = await db.$queryRaw<Array<{ n: string | null }>>`SELECT ops.peek_number(${key}, ${scope}) AS n`
  return row?.n ?? null
}
