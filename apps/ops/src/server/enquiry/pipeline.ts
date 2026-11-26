import 'server-only'
import {
  groupTarget,
  pipelineRefusal,
  type EnquiryStage,
  type PipelineGroupKey,
} from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { changeEnquiryStage, TransitionRefused, VersionConflict } from './transition'

/**
 * A pipeline drag is a request to the stage machine (S09-T02, C7), never a free write. The target column maps
 * to a concrete stage (groupTarget); the facts the guards need are read here, inside the caller's
 * transaction. Won never moves by drag: the caller is sent to the quotation tab for the PO check (S22).
 */

export type MoveOutcome =
  | { kind: 'moved'; ref: string; from: EnquiryStage; to: EnquiryStage }
  | { kind: 'won'; ref: string; href: string; message: string }

export async function moveToGroup(
  tx: Prisma.TransactionClient,
  input: { enquiryId: string; toGroup: PipelineGroupKey; version: number },
  user: Pick<OpsUser, 'id' | 'role'>
): Promise<MoveOutcome> {
  const e = await tx.enquiry.findUnique({
    where: { id: input.enquiryId },
    select: {
      ref: true,
      stage: true,
      chosenPath: true,
      quotations: {
        where: { status: { in: ['sent', 'viewed', 'evaluating'] } },
        select: { id: true },
        take: 1,
      },
      orders: { select: { id: true }, take: 1 },
    },
  })
  if (!e) throw new SafeError(SAFE_MESSAGES.gone)
  const from = e.stage as EnquiryStage
  if (input.toGroup === 'won')
    return {
      kind: 'won',
      ref: e.ref,
      href: `/enquiries/${e.ref}/quotation?po=check`,
      message: 'Record the client PO to mark it Won',
    }
  const ctx = {
    chosenPath: e.chosenPath,
    hasSentQuotation: e.quotations.length > 0,
    orderCreated: e.orders.length > 0,
    actorRole: user.role,
    reopen: true,
  }
  const refusal = pipelineRefusal(from, input.toGroup, ctx)
  if (refusal) throw new SafeError(refusal)
  const to = groupTarget(input.toGroup, from)!
  try {
    await changeEnquiryStage(tx, {
      enquiryId: input.enquiryId,
      to,
      ctx,
      actor: { kind: 'user', id: user.id },
      expectedVersion: input.version,
      note: 'Moved on the pipeline',
    })
  } catch (err) {
    if (err instanceof TransitionRefused) throw new SafeError(err.reason)
    if (err instanceof VersionConflict) throw new SafeError(SAFE_MESSAGES.conflict)
    throw err
  }
  return { kind: 'moved', ref: e.ref, from, to }
}
