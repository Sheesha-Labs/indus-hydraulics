import type { AutopilotLevel } from '../state/labels'
import {
  evaluateGuardrails,
  marginFloorOf,
  type GuardrailContext,
  type GuardrailHit,
  type GuardrailSetting,
} from './guardrails'
import { isPricedClientSend } from './keys'
import { compareLevels, fixedRule, lowerOf } from './levels'
import { capLevel, effectiveLock, presetLevel, type ActionDefLevels } from './presets'
import type {
  ActionOrigin,
  AutopilotModeOrCustom,
  BlockReason,
  BudgetState,
  QueueReason,
} from './types'

/**
 * The level an Assistant action runs at (S07-T01, ADR-10, 08-map §2.3). One pure function; every step can
 * only LOWER autonomy, never raise it (property-tested in resolve.property.test.ts):
 *
 *   1 origin      backfill / import → blocked 'origin' (history never causes an effect; S20 has its own path)
 *   2 fixed       #20, #28 → Draft and ask; #32 → Never; the priced client sends (#20, #26, #27, #31) never
 *                 above Draft and ask; the row's lock and max on top (code constants, not settings)
 *   3 base        the setting's level (which reflects the mode or a custom choice), or the mode's preset
 *                 when the row has no setting, capped at the row's max
 *   4 rules       #13 chasers ask until a person approved the first one, and stop after the last (escalate);
 *                 #11 research asks before a first email to a new supplier; #19 pricing under the floor asks,
 *                 under the hard minimum is refused
 *   5 guardrails  value, first contact, margin floor, credit hold → ask; outside hours, holiday, daily cap →
 *                 keep the level and queue; research cap → stop
 *   6 state       paused → blocked 'paused'; budget hard stop → 'budget'; research paused → #11 'budget';
 *                 mailbox not live → the external effect waits (waitsForMailbox), the proposal still runs
 *
 * A locked row always returns its lock: guardrails are still recorded (so the card says why) but cannot
 * move a fixed level. Every hit is returned so a Review card can say which guardrail sent it there.
 */

export interface ResolveInput {
  def: ActionDefLevels
  /** Emails someone outside Indus. */
  external: boolean
  /** Calls a model on the research route. */
  research?: boolean
  /** autopilot_setting.level; null when the row has none (the mode's preset applies). */
  configuredLevel: AutopilotLevel | null
  mode: AutopilotModeOrCustom
  ctx: GuardrailContext
  guardrails: readonly GuardrailSetting[]
  state: {
    origin: ActionOrigin
    paused: boolean
    budget: BudgetState
    mailboxLive: boolean
  }
}

export interface ResolvedLevel {
  level: AutopilotLevel
  /** The level before rules, guardrails and state (step 3). */
  base: AutopilotLevel
  /** Every guardrail and action rule that fired. */
  hits: GuardrailHit[]
  /** Plain-English reasons, stored as `assistant_action.levelReasons`; asks read "Asked because: …". */
  reasons: string[]
  blocked?: BlockReason
  queue?: QueueReason
  /** External and the mailbox is not live: the effect waits in the send queue. */
  waitsForMailbox?: boolean
}

const WORD: Record<AutopilotLevel, string> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
  never: 'Never',
}

export const ASKED_BECAUSE = 'Asked because: '

/** The base level (steps 2–3): lock, setting or preset, capped. Never above what the Owner set. */
export function baseLevel(
  def: ActionDefLevels,
  configuredLevel: AutopilotLevel | null,
  mode: AutopilotModeOrCustom
): AutopilotLevel {
  const lock = effectiveLock(def)
  // A locked row's setting always equals its lock (ops.locked_level_guard); were it ever lower, the lower
  // one wins, because nothing here may raise a level.
  if (lock !== null)
    return configuredLevel && compareLevels(configuredLevel, lock) < 0 ? configuredLevel : lock
  const configured = configuredLevel ?? presetLevel(mode === 'custom' ? 'careful' : mode, def)
  let level = capLevel(def, configured)
  if (isPricedClientSend(def.key)) level = lowerOf(level, 'draft_and_ask')
  return level
}

export function resolveLevel(input: ResolveInput): ResolvedLevel {
  const { def, ctx, state } = input
  const reasons: string[] = []
  const hits: GuardrailHit[] = []
  const lock = effectiveLock(def)
  const base = baseLevel(def, input.configuredLevel, input.mode)

  if (lock !== null) {
    reasons.push(fixedRule(def.key) ? `Fixed rule: ${WORD[lock]}` : `Fixed at ${WORD[lock]}`)
  } else {
    reasons.push(
      input.configuredLevel
        ? `Set to ${WORD[input.configuredLevel]} in Autopilot`
        : `No Autopilot row; the ${input.mode === 'custom' ? 'Careful' : input.mode} preset`
    )
    if (input.configuredLevel && base !== input.configuredLevel)
      reasons.push(`Capped at ${WORD[base]}`)
  }

  let level: AutopilotLevel = base
  let blocked: BlockReason | undefined
  let queue: QueueReason | undefined
  const lower = (to: AutopilotLevel) => {
    if (lock === null) level = lowerOf(level, to)
  }
  // The `lower` above leaves a lock alone: a fixed level is not moved by a guardrail (the hit is still
  // recorded, so the card says why it asks).
  const block = (why: BlockReason) => {
    if (blocked === undefined) blocked = why
  }

  // 1 origin
  if (state.origin !== 'live' && state.origin !== 'manual') {
    reasons.push(`Origin ${state.origin}: no effect from history`)
    block('origin')
  }

  // 2 fixed levels that stop the run
  if (level === 'never') {
    reasons.push('This action never runs')
    block('never')
  } else if (level === 'off') {
    reasons.push('Turned off in Autopilot')
    block('off')
  }

  // 4 action rules
  if (def.key === 'chase_suppliers') {
    const max = ctx.maxChasers ?? 3
    if (!ctx.firstChaserApproved) {
      const text = 'The first chaser of an RFQ waits for you'
      hits.push({ key: 'rule:chaser_first', kind: 'rule', effect: 'ask', text })
      lower('draft_and_ask')
    }
    if ((ctx.chasersSent ?? 0) >= max) {
      const text = `${max} chasers sent with no reply: call or try another contact`
      hits.push({ key: 'rule:chaser_max', kind: 'rule', effect: 'block', text })
      reasons.push(text)
      lower('draft_and_ask')
      block('escalate')
    }
  }
  if (def.key === 'research_suppliers' && ctx.counterpartyIsNew) {
    const text = 'A new supplier never gets a first email without you'
    hits.push({ key: 'rule:research_new_supplier', kind: 'rule', effect: 'ask', text })
    lower('draft_and_ask')
  }
  if (def.key === 'price_quotation' && ctx.minMarginPct != null) {
    const { floorPct, hardMinPct } = marginFloorOf(input.guardrails)
    if (ctx.minMarginPct < hardMinPct) {
      const text = `Margin ${ctx.minMarginPct}% is under the ${hardMinPct}% hard minimum`
      hits.push({ key: 'rule:margin_hard_min', kind: 'rule', effect: 'block', text })
      reasons.push(text)
      block('never')
    } else if (ctx.minMarginPct < floorPct) {
      const text = `Margin ${ctx.minMarginPct}% is below the ${floorPct}% floor`
      hits.push({ key: 'rule:margin_floor', kind: 'rule', effect: 'ask', text })
      lower('draft_and_ask')
    }
  }

  // 5 guardrails
  for (const hit of evaluateGuardrails(
    { key: def.key, external: input.external, research: input.research ?? false },
    ctx,
    input.guardrails
  )) {
    hits.push(hit)
    if (hit.effect === 'ask') lower('draft_and_ask')
    else if (hit.effect === 'queue')
      queue ??= hit.kind === 'daily_send_cap' ? 'cap' : 'working_hours'
    else {
      reasons.push(hit.text)
      block(hit.kind === 'fixed_no_money' ? 'never' : 'budget')
    }
  }
  for (const hit of hits) if (hit.effect === 'ask') reasons.push(`${ASKED_BECAUSE}${hit.text}`)
  if (queue)
    reasons.push(queue === 'cap' ? 'Over the daily send cap: queued' : 'Queued for the send window')

  // 6 state
  if (state.paused) {
    reasons.push('The Assistant is paused')
    block('paused')
  }
  if (state.budget === 'hard_stop' || (state.budget === 'research_paused' && input.research)) {
    reasons.push('The monthly AI budget is spent')
    block('budget')
  }

  const out: ResolvedLevel = { level, base, hits, reasons }
  if (blocked) out.blocked = blocked
  if (queue) out.queue = queue
  if (!blocked && input.external && !state.mailboxLive) {
    reasons.push('The mailbox is not live; the send waits')
    out.waitsForMailbox = true
  }
  return out
}

/** For tests and callers that compare: is `a` at most as autonomous as `b`? */
export function atMost(a: AutopilotLevel, b: AutopilotLevel): boolean {
  return compareLevels(a, b) <= 0
}

/** The guardrail rows a resolution should count in `ops.guardrail_trigger` (rules are not counted). */
export function countedHits(r: Pick<ResolvedLevel, 'hits'>): GuardrailHit[] {
  return r.hits.filter((h) => h.kind !== 'rule')
}
