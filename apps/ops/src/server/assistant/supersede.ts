import 'server-only'
import { opsDb } from '@indus/ops-db'
import { setActor } from './write-tracked'

/**
 * A newer card replaces an open one (S06-T03, board 110 "Superseded"): the old one is cancelled with the reason
 * and points at the new one, which shows "Superseded at 11:40: <reason> · Show". Used by redraft (the runner
 * links them) and by later sprints, e.g. a supplier's reply superseding a chaser.
 */
export async function supersedeAction(
  oldId: string,
  newId: string,
  reason: string
): Promise<boolean> {
  return opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'system' })
    const a = await tx.assistantAction.findUnique({ where: { id: oldId }, select: { state: true } })
    if (!a) return false
    if (a.state === 'later')
      await tx.assistantAction.update({ where: { id: oldId }, data: { state: 'proposed' } })
    const open = a.state === 'proposed' || a.state === 'later'
    await tx.assistantAction.update({
      where: { id: oldId },
      data: {
        ...(open ? { state: 'cancelled' } : {}),
        supersededById: newId,
        staleReason: reason.slice(0, 300),
        staleAt: new Date(),
      },
    })
    return true
  })
}
