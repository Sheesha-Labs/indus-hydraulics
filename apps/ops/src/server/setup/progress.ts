import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { SetupStep } from '../../lib/route-params'
import { computeProgress, type SetupProgress, type StepStatus } from './progress-core'

/**
 * First-run progress (S03-T05, P01): the six `checklist_item` rows of checklist `setup` (seeded by the
 * settings_defaults_seed migration) and the welcome-once flag in `tip_state`.
 *
 * Welcome once: the Owner lands on `/welcome` from Today until `tip_state (userId, 'welcome.seen')`
 * exists; "Start setup" writes it. Opening `/welcome` directly still works afterwards (it is a page,
 * not a gate). (decision) tip_state, as the plan says, not the `setup.progress.welcomeSeenBy` setting
 * T04 seeded: a per-person flag belongs in the per-person table, and a settings row would need the
 * version-checked update for a one-way mark.
 */

export const WELCOME_TIP = 'welcome.seen'

type Db = Pick<Prisma.TransactionClient, 'checklistItem' | 'tipState'>

export async function getSetupProgress(
  db: Pick<Db, 'checklistItem'> = opsDb
): Promise<SetupProgress> {
  const rows = await db.checklistItem.findMany({
    where: { checklist: 'setup' },
    select: { key: true, status: true },
  })
  return computeProgress(rows)
}

/**
 * Set one step's status. `done` records who and when; leaving `done` clears them. `skipped` never
 * overwrites `done` (Next on a skipped step after it was finished keeps it finished).
 */
export async function markStep(
  key: SetupStep,
  status: Extract<StepStatus, 'todo' | 'in_progress' | 'done' | 'skipped'>,
  userId: string,
  db: Pick<Db, 'checklistItem'> = opsDb
): Promise<void> {
  const where: Prisma.ChecklistItemWhereInput = { checklist: 'setup', key }
  if (status === 'skipped') where.status = { in: ['todo', 'in_progress', 'rolled_back'] }
  await db.checklistItem.updateMany({
    where,
    data:
      status === 'done'
        ? { status, doneById: userId, doneAt: new Date() }
        : { status, doneById: null, doneAt: null },
  })
}

export async function isWelcomeSeen(
  userId: string,
  db: Pick<Db, 'tipState'> = opsDb
): Promise<boolean> {
  const row = await db.tipState.findUnique({
    where: { userId_tipKey: { userId, tipKey: WELCOME_TIP } },
    select: { userId: true },
  })
  return row !== null
}

export async function markWelcomeSeen(
  userId: string,
  db: Pick<Db, 'tipState'> = opsDb
): Promise<void> {
  await db.tipState.upsert({
    where: { userId_tipKey: { userId, tipKey: WELCOME_TIP } },
    create: { userId, tipKey: WELCOME_TIP },
    update: {},
  })
}
