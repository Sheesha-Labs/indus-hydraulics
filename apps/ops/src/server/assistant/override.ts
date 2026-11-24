import 'server-only'
import type { Prisma } from '@indus/ops-db'
import type { OverrideResult } from '../mail/overrides'
import { correctableFor, CorrectionError, type CorrectableAction } from './actions/override-value'
import { allocateActionRef } from './action-number'
import { setActor } from './write-tracked'

/**
 * "This is wrong…" from Why? (S06-T05): a person corrects a value an Assistant action set. In the caller's
 * transaction:
 *   1. the value is changed by the action's registered correction (writeTracked, person as actor, so History
 *      reads "Overridden by KB"), which also records the preference signal;
 *   2. an `override_value` action is recorded as done, decided by the person, with revertOfId = the original;
 *   3. the original action, when it was done, becomes reverted (the log reads Reverted).
 * Returns the new action's ref and the events to send after commit (labels follow; a new class re-runs the
 * link step).
 */
export async function correctValue(
  tx: Prisma.TransactionClient,
  input: {
    actionRef: string
    value: string
    reason: string
    actor: { id: string; initials: string }
    now?: Date
  }
): Promise<{ ref: string; events: OverrideResult['events']; label: string }> {
  const now = input.now ?? new Date()
  const reason = input.reason.trim()
  if (!reason) throw new CorrectionError('Say in a line why it is wrong')
  const original = await tx.assistantAction.findUnique({
    where: { ref: input.actionRef },
    select: {
      id: true,
      ref: true,
      actionKey: true,
      subjectType: true,
      subjectId: true,
      enquiryId: true,
      options: true,
      state: true,
    },
  })
  if (!original) throw new CorrectionError('That action is no longer here')
  const c = correctableFor(original.actionKey)
  if (!c) throw new CorrectionError('This value can’t be changed from Why? yet')
  const action: CorrectableAction = original
  const { result, label } = await c.apply(tx, {
    action,
    value: input.value,
    reason,
    actor: input.actor,
  })

  await setActor(tx, { kind: 'user', id: input.actor.id })
  const num = { formatted: await allocateActionRef(tx, now) }
  await tx.assistantAction.create({
    data: {
      ref: num.formatted,
      actionKey: 'override_value',
      levelAtTime: 'do_quietly',
      guardrails: [],
      enquiryId: original.enquiryId,
      subjectType: original.subjectType,
      subjectId: original.subjectId,
      headline: `Overridden by ${input.actor.initials}: ${c.label} → ${label}`,
      reasons: [{ text: reason }] as unknown as Prisma.InputJsonValue,
      checks: [] as unknown as Prisma.InputJsonValue,
      confidence: 'sure',
      inputs: {
        field: c.field,
        value: input.value,
        correctsAction: original.ref,
      } as Prisma.InputJsonValue,
      state: 'done',
      decidedById: input.actor.id,
      decidedAt: now,
      doneAt: now,
      revertOfId: original.id,
      surface: 'review',
      origin: 'manual',
      idempotencyKey: `override_value:${original.id}:${num.formatted}`,
    },
  })
  if (original.state === 'done') {
    await tx.assistantAction.update({ where: { id: original.id }, data: { state: 'reverted' } })
  }
  return { ref: num.formatted, events: result.events, label }
}
