import type { OpsUser } from '../../lib/access-core'

/**
 * Who may open which stored file (S11-T04, ADR-21). Internal cost documents (a costing sheet, a landed-cost
 * export) are for people who see margins: a Helper without canSeeMargins cannot open them. None is produced
 * yet; the rule is in place for the sprints that add one (CLAUDE.md §5.5: margins are masked on the server).
 */
export const INTERNAL_COST_KINDS: ReadonlySet<string> = new Set<string>()

export function mayOpenFile(
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>,
  documentKinds: readonly string[],
  internal: ReadonlySet<string> = INTERNAL_COST_KINDS
): boolean {
  if (user.role === 'owner' || user.canSeeMargins) return true
  return !documentKinds.some((k) => internal.has(k))
}
