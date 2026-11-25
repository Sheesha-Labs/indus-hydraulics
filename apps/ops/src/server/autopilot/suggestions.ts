import 'server-only'
import { earnedSuggestion, effectiveLock, runHistoryOf, EARNED_STREAK } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'

/**
 * Earned suggestions (S07-T02, `ops.autopilot.suggestions` nightly): for each configurable, unlocked action,
 * the runs since its level last changed (its own change or a mode switch, from the activity trail) go through ops-core earnedSuggestion. A qualifying action gets (or
 * keeps) one open `autopilot_suggestion`; one that no longer qualifies has its open row hidden (expired) until
 * it qualifies again. A row the Owner snoozed ("Not now") stays hidden until its date. Nothing here changes a
 * level: the Owner accepts on board 99.
 *
 * One short query per action (the last 3 × 25 runs), no transaction held across them.
 */
export async function refreshSuggestions(
  now = new Date(),
  db: Pick<
    typeof opsDb,
    'autopilotActionDef' | 'assistantAction' | 'autopilotSuggestion' | 'activityEvent'
  > = opsDb
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
  // When each level last changed: a person's change of that row, or a mode (preset) change of every row. Rules
  // edits do not restart the count. Two grouped reads over the append-only activity trail.
  const [rowChanges, modeChange] = await Promise.all([
    db.activityEvent.groupBy({
      by: ['field'],
      where: { field: { startsWith: 'autopilot.', endsWith: '.level' } },
      _max: { at: true },
    }),
    db.activityEvent.aggregate({ where: { field: 'assistant.mode' }, _max: { at: true } }),
  ])
  const changedAt = new Map(
    rowChanges.map((r) => [r.field?.slice('autopilot.'.length, -'.level'.length) ?? '', r._max.at])
  )
  for (const def of defs) {
    if (!def.setting || effectiveLock(def) !== null) continue
    out.checked += 1
    const times = [changedAt.get(def.key), modeChange._max.at].filter((x): x is Date => !!x)
    const since = times.length ? new Date(Math.max(...times.map((t) => t.getTime()))) : new Date(0)
    const runs = await db.assistantAction.findMany({
      where: { actionKey: def.key, createdAt: { gt: since } },
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
