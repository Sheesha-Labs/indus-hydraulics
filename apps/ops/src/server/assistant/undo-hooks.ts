import 'server-only'
import type { Prisma } from '@indus/ops-db'

/**
 * Hooks later sprints plug into undo and corrections (S06-T07, ADR-11, ADR-15).
 *
 *   releaseOnUndo  what an approval consumed and an undo gives back, inside the undo's transaction: a number
 *                  allocated at approval goes back through ops.release_number (S17 registers the quotation
 *                  number; nothing in S06 allocates one).
 *   reissue        a document that left is corrected by reissuing it rather than by email: S17/S23 register
 *                  the quotation's "Reissue as INDUS/Q…-R2; R1 marked superseded".
 */
export type UndoRelease = (
  tx: Prisma.TransactionClient,
  action: { id: string; actionKey: string; output: unknown }
) => Promise<void>

export type Reissue = (actionId: string, by: { id: string }) => Promise<{ ref: string }>

const RELEASES = new Map<string, UndoRelease>()
const REISSUES = new Map<string, Reissue>()

export function registerUndoRelease(actionKey: string, fn: UndoRelease): void {
  if (RELEASES.has(actionKey))
    throw new Error(`Undo release for "${actionKey}" is registered twice`)
  RELEASES.set(actionKey, fn)
}

export async function releaseOnUndo(
  tx: Prisma.TransactionClient,
  action: { id: string; actionKey: string; output: unknown }
): Promise<boolean> {
  const fn = RELEASES.get(action.actionKey)
  if (!fn) return false
  await fn(tx, action)
  return true
}

export function registerReissue(actionKey: string, fn: Reissue): void {
  if (REISSUES.has(actionKey)) throw new Error(`Reissue for "${actionKey}" is registered twice`)
  REISSUES.set(actionKey, fn)
}

export function reissueFor(actionKey: string): Reissue | null {
  return REISSUES.get(actionKey) ?? null
}

/** Test seam: forget registrations made by a test. */
export function unregisterUndoHooksForTest(actionKey: string): void {
  RELEASES.delete(actionKey)
  REISSUES.delete(actionKey)
}
