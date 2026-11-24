import 'server-only'
import { earnedSuggestion, effectiveLock, runHistoryOf, EARNED_STREAK } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'

/**
 * Earned suggestions (S07-T02, `ops.autopilot.suggestions` nightly): for each configurable, unlocked action,
 * the runs since its setting last changed go through ops-core earnedSuggestion. A qualifying action gets (or
 * keeps) one open `autopilot_suggestion`; one that no longer qualifies has its open row hidden (expired) until
 * it qualifies again. A row the Owner snoozed ("Not now") stays hidden until its date. Nothing here changes a
 * level: the Owner accepts on board 99.
 *
 * One short query per action (the last 3 × 25 runs), no transaction held across them.
 */
export async function refreshSuggestions(
  now = new Date(),
  db: Pick<typeof opsDb, 'autopilotActionDef' | 'assistantAction' | 'autopilotSuggestion'> = opsDb
): Promise<{ checked: number; created: number; updated: number; expired: number }> {
  const defs = await db.autopilotActionDef.findMany({
    where: { configurable: true },
    select: {
      key: true,
      configurable: true,
      lockedLevel: true,
      maxLevel: true,
      defaultCareful: true,
      defaultBalanced: true,
      defaultHandsOff: true,
      setting: { select: { level: true, updatedAt: true } },
      suggestions: {
        where: { acceptedAt: null },
        select: { id: true, toLevel: true, dismissedUntil: true, evidence: true },
        take: 1,
      },
    },
  })
  const out = { checked: 0, created: 0, updated: 0, expired: 0 }
  for (const def of defs) {
    if (!def.setting || effectiveLock(def) !== null) continue
    out.checked += 1
    const runs = await db.assistantAction.findMany({
      where: { actionKey: def.key, createdAt: { gt: def.setting.updatedAt } },
      orderBy: { createdAt: 'desc' },
      take: EARNED_STREAK * 3,
      select: { id: true, state: true, decidedById: true, editDiff: true, createdAt: true },
    })
    const hit = earnedSuggestion(runs.map(runHistoryOf), def, def.setting.level)
    const open = def.suggestions[0]
    const evidence = (extra: Record<string, unknown> = {}) =>
      ({ runIds: runs.slice(0, EARNED_STREAK).map((r) => r.id), ...extra }) as Prisma.InputJsonValue
    if (hit) {
      if (!open) {
        await db.autopilotSuggestion.create({
          data: {
            actionKey: def.key,
            fromLevel: def.setting.level,
            toLevel: hit.toLevel,
            streak: hit.streak,
            evidence: evidence(),
          },
        })
        out.created += 1
      } else {
        const expired = (open.evidence as { expired?: boolean } | null)?.expired === true
        await db.autopilotSuggestion.update({
          where: { id: open.id },
          data: {
            fromLevel: def.setting.level,
            toLevel: hit.toLevel,
            streak: hit.streak,
            evidence: evidence(),
            // An expired row comes back; a person's snooze is kept until its date.
            ...(expired ? { dismissedUntil: null } : {}),
          },
        })
        out.updated += 1
      }
    } else if (open && !(open.dismissedUntil && open.dismissedUntil > now)) {
      await db.autopilotSuggestion.update({
        where: { id: open.id },
        data: {
          dismissedUntil: new Date(now.getTime() + 3650 * 86_400_000),
          evidence: evidence({ expired: true }),
        },
      })
      out.expired += 1
    }
  }
  return out
}
