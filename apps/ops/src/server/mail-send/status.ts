import 'server-only'
import { canTransitionOutbound, type OutboundStatusValue } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'

/**
 * The only way the send queue changes an outbound row's status (S04-T06, ADR-07): a CONDITIONAL update from the
 * listed states, each pair checked against the forward-only machine in ops-core. Returns true when this call
 * moved the row; false when another run (or a person) got there first. Nothing ever moves a row backwards.
 */
export async function moveOutbound(
  outboundId: string,
  from: readonly OutboundStatusValue[],
  to: OutboundStatusValue,
  data: Omit<Prisma.OutboundEmailUpdateManyMutationInput, 'status'> = {},
  extraWhere: Prisma.OutboundEmailWhereInput = {}
): Promise<boolean> {
  const allowed = from.filter((f) => canTransitionOutbound(f, to))
  if (allowed.length !== from.length) {
    const bad = from.filter((f) => !allowed.includes(f))
    throw new Error(`Outbound status cannot move ${bad.join(', ')} → ${to}`)
  }
  const { count } = await opsDb.outboundEmail.updateMany({
    where: { id: outboundId, status: { in: [...allowed] }, ...extraWhere },
    data: { ...data, status: to },
  })
  return count === 1
}

export const PENDING: readonly OutboundStatusValue[] = ['scheduled', 'held', 'waiting_for_mailbox']
