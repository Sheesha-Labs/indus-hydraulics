import type { AutopilotLevel } from '../state/labels'
import { lowerOf } from './levels'
import { capLevel, effectiveLock, type ActionDefLevels } from './presets'

/**
 * The level an Assistant action runs at, interim version (S05-T02, ADR-10 interim). S07 replaces it with the
 * full `resolveLevel` (guardrails, per-company overrides, learned trust) behind the same input and output
 * shape. It can only LOWER autonomy, never raise it above the Owner's setting:
 *
 *   1. origin ≠ 'live'               blocked 'origin': backfilled and imported mail never causes an effect
 *                                    (the history import is S20's).
 *   2. the row's level                the setting's level (or the Careful default when no row exists),
 *                                    capped by the row's max; a lock (data or fixed rule) wins, lowered to the
 *                                    setting if the setting is lower.
 *   3. 'never'                        blocked 'never' (#32 supplier payments).
 *   4. 'off'                          blocked 'off'.
 *   5. paused                         blocked 'paused' (the runner waits for resume).
 *   6. budget                         'hard_stop' blocks every action; 'research_paused' blocks research.
 *   7. external, mailbox not live     not blocked: the effect waits in the send queue (`waitsForMailbox`).
 */

export type ActionOrigin = 'live' | 'backfill' | 'import' | 'manual'
export type InterimBudgetState = 'ok' | 'warn80' | 'research_paused' | 'hard_stop'
export type BlockReason = 'origin' | 'never' | 'off' | 'paused' | 'budget'

export interface ResolveInterimInput {
  def: Pick<
    ActionDefLevels,
    'key' | 'lockedLevel' | 'maxLevel' | 'defaultCareful' | 'defaultBalanced' | 'defaultHandsOff'
  >
  setting: { level: AutopilotLevel } | null
  origin: ActionOrigin
  paused: boolean
  budget: InterimBudgetState
  /** The action calls a model on the research route (paused alone by `warn_pause_research`). */
  research?: boolean
  mailboxLive: boolean
  external: boolean
}

export interface ResolvedLevel {
  level: AutopilotLevel
  /** Plain-English reasons, stored as `assistant_action.levelReasons`. */
  reasons: string[]
  blocked?: BlockReason
  waitsForMailbox?: boolean
}

export function resolveLevelInterim(input: ResolveInterimInput): ResolvedLevel {
  const reasons: string[] = []
  const { def } = input

  const configured = input.setting?.level ?? def.defaultCareful
  reasons.push(
    input.setting
      ? `Set to ${configured} in Autopilot`
      : `No Autopilot row; the Careful default ${configured}`
  )
  const lock = effectiveLock(def)
  let level: AutopilotLevel
  if (lock !== null) {
    level = lowerOf(lock, configured)
    reasons.push(`Fixed at ${lock}`)
  } else {
    level = capLevel(def, configured)
    if (level !== configured) reasons.push(`Capped at ${level}`)
  }

  if (input.origin !== 'live' && input.origin !== 'manual') {
    reasons.push(`Origin ${input.origin}: no effect from history`)
    return { level, reasons, blocked: 'origin' }
  }
  if (level === 'never') {
    reasons.push('This action never runs')
    return { level, reasons, blocked: 'never' }
  }
  if (level === 'off') {
    reasons.push('Turned off')
    return { level, reasons, blocked: 'off' }
  }
  if (input.paused) {
    reasons.push('The Assistant is paused')
    return { level, reasons, blocked: 'paused' }
  }
  if (input.budget === 'hard_stop' || (input.budget === 'research_paused' && input.research)) {
    reasons.push('The monthly AI budget is spent')
    return { level, reasons, blocked: 'budget' }
  }
  if (input.external && !input.mailboxLive) {
    reasons.push('The mailbox is not live; the send waits')
    return { level, reasons, waitsForMailbox: true }
  }
  return { level, reasons }
}
