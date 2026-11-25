import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { bumpCounters } from '../assistant/live-counter'

/**
 * The live key a batch's pages watch (board 14 queue, board 15 review): any change to a file's status or a
 * candidate bumps it, and the page refreshes within a poll.
 */
export function intakeLiveKey(batchId: string): `record:intake.${string}` {
  return `record:intake.${batchId}`
}

export async function bumpIntake(
  batchId: string,
  db?: Pick<Prisma.TransactionClient, '$executeRaw'>
): Promise<void> {
  await bumpCounters([intakeLiveKey(batchId)], 1, db)
}
