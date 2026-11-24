import { z } from 'zod'
import type { AutopilotLevel } from '../state/labels'

/**
 * Per-action rules (S07-T02, board 99): the `rules` JSON on `ops.autopilot_setting`, validated by the
 * action's schema before it is saved. Each schema comes with the fields the drawer's RuleForm draws, so the
 * form is generated from data, not written per action. Actions without rules have an empty schema.
 *
 * "Ask me first" toggles (first message to a new supplier, an RFQ above USD 50,000, a supplier on Trial)
 * sit on every action that writes to suppliers; they only make the action ask, never do more.
 */

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM')

const askFirst = {
  askNewSupplier: z.boolean(),
  askRfqAboveUsd50k: z.boolean(),
  askTrialSupplier: z.boolean(),
}

export const chaserRules = z.strictObject({
  firstAfterWorkingDays: z.number().int().min(1).max(10),
  everyWorkingDays: z.number().int().min(1).max(10),
  max: z.number().int().min(1).max(3),
  askCallAfterLast: z.boolean(),
  skipOutOfOffice: z.boolean(),
  noFridayAfter: hhmm,
  noWeekends: z.boolean(),
  ...askFirst,
})

export const acknowledgeRules = z.strictObject({
  sendWithinMinutes: z.number().int().min(1).max(240),
  skipRepeatWithinDays: z.number().int().min(0).max(30),
})

export const supplierSendRules = z.strictObject({ ...askFirst })

export type RuleField =
  | {
      name: string
      label: string
      kind: 'count'
      unit: string
      units: string
      min: number
      max: number
    }
  | { name: string; label: string; kind: 'toggle' }
  | { name: string; label: string; kind: 'time' }

export interface RuleForm {
  schema: z.ZodType
  defaults: Record<string, unknown>
  fields: readonly RuleField[]
}

const ASK_FIELDS: readonly RuleField[] = [
  {
    name: 'askNewSupplier',
    label: 'Ask me first: the first message to a new supplier',
    kind: 'toggle',
  },
  { name: 'askRfqAboveUsd50k', label: 'Ask me first: an RFQ above USD 50,000', kind: 'toggle' },
  { name: 'askTrialSupplier', label: 'Ask me first: a supplier on Trial', kind: 'toggle' },
]
const ASK_DEFAULTS = { askNewSupplier: true, askRfqAboveUsd50k: true, askTrialSupplier: true }

const SUPPLIER_SEND: RuleForm = {
  schema: supplierSendRules,
  defaults: ASK_DEFAULTS,
  fields: ASK_FIELDS,
}

export const RULE_FORMS: Readonly<Record<string, RuleForm>> = {
  chase_suppliers: {
    schema: chaserRules,
    defaults: {
      firstAfterWorkingDays: 1,
      everyWorkingDays: 2,
      max: 3,
      askCallAfterLast: true,
      skipOutOfOffice: true,
      noFridayAfter: '15:00',
      noWeekends: true,
      ...ASK_DEFAULTS,
    },
    fields: [
      {
        name: 'firstAfterWorkingDays',
        label: 'First chase after reply-by',
        kind: 'count',
        unit: 'working day',
        units: 'working days',
        min: 1,
        max: 10,
      },
      {
        name: 'everyWorkingDays',
        label: 'Then every',
        kind: 'count',
        unit: 'working day',
        units: 'working days',
        min: 1,
        max: 10,
      },
      {
        name: 'max',
        label: 'Up to',
        kind: 'count',
        unit: 'chaser',
        units: 'chasers',
        min: 1,
        max: 3,
      },
      { name: 'askCallAfterLast', label: 'After the last, ask Krishan to call', kind: 'toggle' },
      { name: 'skipOutOfOffice', label: 'Skip suppliers on out-of-office', kind: 'toggle' },
      { name: 'noFridayAfter', label: 'No chasers on Friday after', kind: 'time' },
      { name: 'noWeekends', label: 'No chasers at the weekend', kind: 'toggle' },
      ...ASK_FIELDS,
    ],
  },
  ack_email: {
    schema: acknowledgeRules,
    defaults: { sendWithinMinutes: 15, skipRepeatWithinDays: 3 },
    fields: [
      {
        name: 'sendWithinMinutes',
        label: 'Acknowledge within',
        kind: 'count',
        unit: 'minute',
        units: 'minutes',
        min: 1,
        max: 240,
      },
      {
        name: 'skipRepeatWithinDays',
        label: 'Skip a repeat from the same client within',
        kind: 'count',
        unit: 'day',
        units: 'days',
        min: 0,
        max: 30,
      },
    ],
  },
  send_supplier_rfqs: SUPPLIER_SEND,
  relay_supplier_questions: SUPPLIER_SEND,
  remind_supplier_documents: SUPPLIER_SEND,
  production_chasing: SUPPLIER_SEND,
}

const EMPTY: RuleForm = { schema: z.strictObject({}), defaults: {}, fields: [] }

export function ruleForm(actionKey: string): RuleForm {
  return RULE_FORMS[actionKey] ?? EMPTY
}

/** The stored rules merged over the defaults (an old row lacks fields added later). */
export function rulesWithDefaults(actionKey: string, stored: unknown): Record<string, unknown> {
  const form = ruleForm(actionKey)
  const base = { ...form.defaults }
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    for (const [k, v] of Object.entries(stored)) if (k in base) base[k] = v
  }
  return base
}

export function parseRules(
  actionKey: string,
  rules: unknown
): { ok: true; rules: Record<string, unknown> } | { ok: false; error: string } {
  const out = ruleForm(actionKey).schema.safeParse(rules)
  if (out.success) return { ok: true, rules: out.data as Record<string, unknown> }
  const issue = out.error.issues[0]
  return {
    ok: false,
    error: issue ? `${issue.path.join('.') || 'rules'}: ${issue.message}` : 'Invalid rules',
  }
}

/** Board 98 legend and board 99 level radios: what each level means in general. */
export const LEVEL_MEANING: Readonly<
  Record<Exclude<AutopilotLevel, 'never'>, { tag?: string; text: string }>
> = {
  off: { text: 'Nothing. The record shows what is late; nothing is drafted.' },
  suggest: { text: 'A hint appears in the record; nothing is drafted.' },
  draft_and_ask: {
    tag: 'Asks you',
    text: 'Each one waits in Review. Similar ones can be approved together.',
  },
  do_and_tell: {
    tag: 'Does it, tells you',
    text: 'It acts and lists it in Today and the evening summary, with undo where possible.',
  },
  do_quietly: { tag: 'Does it quietly', text: 'It acts; you see it only in the Assistant log.' },
}

/** Action-specific consequences where the generic sentence is not enough (board 99 for #13). */
const CONSEQUENCES: Readonly<Record<string, Partial<Record<AutopilotLevel, string>>>> = {
  chase_suppliers: {
    off: 'No chasers. Late suppliers show in Waiting on others only.',
    suggest: 'A “Chase?” hint appears on the RFQ row; nothing is drafted.',
    draft_and_ask: 'Each chaser waits in Review. Similar chasers can be approved together.',
    do_and_tell:
      'Chasers send from purchase@ and are listed in Today and the evening summary, with 5 minutes to undo.',
    do_quietly: 'Chasers send and appear only in the Assistant log.',
  },
}

export function levelConsequence(actionKey: string, level: AutopilotLevel): string {
  if (level === 'never') return 'Never. It prepares the work for you; nothing leaves without you.'
  return CONSEQUENCES[actionKey]?.[level] ?? LEVEL_MEANING[level].text
}

/** "chase suppliers" from "Chase suppliers": the verb phrase the confirmation asks about. */
export function verbPhrase(label: string): string {
  return label.length ? label[0]!.toLowerCase() + label.slice(1) : label
}

/**
 * The confirmation when a person raises an action to Do and tell or Do quietly (board 102 state 4): what
 * happens from now on, from the action's rules, and which guardrails still ask.
 */
export function switchConsequences(
  actionKey: string,
  to: AutopilotLevel,
  rules: Record<string, unknown>
): { from: string[]; stillAsks: string | null } {
  const out: string[] = []
  if (actionKey === 'chase_suppliers') {
    const r = rulesWithDefaults(actionKey, rules) as z.infer<typeof chaserRules>
    const day = (n: number) => `${n} working day${n === 1 ? '' : 's'}`
    out.push(
      `Chasers send from purchase@ ${day(r.firstAfterWorkingDays)} after reply-by, then every ${r.everyWorkingDays}, up to ${r.max}.`
    )
  }
  out.push(
    to === 'do_and_tell'
      ? 'Each appears in Today and the evening summary, with 5 minutes to undo.'
      : 'Each appears only in the Assistant log; undo where possible.'
  )
  const asks: string[] = []
  const r = rulesWithDefaults(actionKey, rules)
  if (r.askNewSupplier) asks.push('new suppliers')
  if (r.askTrialSupplier) asks.push('Trial suppliers')
  if (r.askRfqAboveUsd50k) asks.push('RFQs above USD 50,000')
  const stillAsks = asks.length
    ? `Still asks you for ${asks.length > 1 ? `${asks.slice(0, -1).join(', ')} and ${asks.at(-1)}` : asks[0]}.`
    : null
  return { from: out, stillAsks }
}
