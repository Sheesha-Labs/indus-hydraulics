import { z } from 'zod'
import { ACTION_KEYS } from '../autopilot/keys'

/**
 * Instructions from the Assistant panel (S06-T08, shell S03, coverage gap G1). What a person types becomes a
 * proposal, never a silent action: the model only classifies the text into one of these intents with its
 * parameters, code checks them against the record, and the card waits in Review (the `instruction` action's
 * maxLevel is Draft and ask).
 *
 * No intent carries a quantity, a price or an amount: the model never supplies a number that changes money or
 * stock (ADR-08). Line numbers and dates are checked against the record and the clock.
 */
export const INSTRUCTION_INTENTS = [
  'hold_line',
  'release_line',
  'add_task',
  'add_note',
  'set_reminder',
  'request_action',
  'unclear',
] as const
export type InstructionIntent = (typeof INSTRUCTION_INTENTS)[number]

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const isoDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})?$/)
const lineNo = z.number().int().min(1).max(9999)

export const instructionParams = z.discriminatedUnion('intent', [
  z.strictObject({
    intent: z.literal('hold_line'),
    lineNo,
    until: z.enum(['answer', 'date']),
    date: isoDate.nullish(),
    note: z.string().min(1).max(300),
  }),
  z.strictObject({
    intent: z.literal('release_line'),
    lineNo,
    note: z.string().max(300).nullish(),
  }),
  z.strictObject({
    intent: z.literal('add_task'),
    title: z.string().min(1).max(200),
    dueOn: isoDate.nullish(),
    assignee: z.enum(['owner', 'helper']),
  }),
  z.strictObject({ intent: z.literal('add_note'), text: z.string().min(1).max(1000) }),
  z.strictObject({
    intent: z.literal('set_reminder'),
    at: isoDateTime,
    text: z.string().min(1).max(300),
  }),
  z.strictObject({ intent: z.literal('request_action'), targetKey: z.string().min(1).max(80) }),
  z.strictObject({ intent: z.literal('unclear'), why: z.string().min(1).max(300) }),
])
export type InstructionParams = z.infer<typeof instructionParams>

/** The model's answer: the intent with its parameters, and reasons quoting the person's own words. */
export const instructionOutput = z.strictObject({
  params: instructionParams,
  reasons: z
    .array(
      z.strictObject({ text: z.string().min(1).max(300), quote: z.string().max(300).nullish() })
    )
    .max(3),
})
export type InstructionOutput = z.infer<typeof instructionOutput>

export interface InstructionContext {
  /** Line numbers on the record (an enquiry's lines), with their status. */
  lines: ReadonlyArray<{ no: number; status: string }>
  /** Action keys a person may ask for on this record (registered, configurable, requestable here). */
  requestable: readonly string[]
  now: Date
}

export type InstructionCheck = { ok: true } | { ok: false; problems: string[] }

function future(d: Date, now: Date): boolean {
  return !Number.isNaN(d.getTime()) && d.getTime() > now.getTime()
}

/** Code checks on the model's intent. A failure turns the card into "I could not turn this into an action". */
export function validateInstruction(
  out: InstructionOutput,
  ctx: InstructionContext
): InstructionCheck {
  const p = out.params
  const problems: string[] = []
  const line = (no: number) => ctx.lines.find((l) => l.no === no)
  switch (p.intent) {
    case 'hold_line': {
      const l = line(p.lineNo)
      if (!l) problems.push(`There is no line ${p.lineNo} on this record`)
      else if (l.status === 'held') problems.push(`Line ${p.lineNo} is already held`)
      else if (['cancelled', 'regretted'].includes(l.status))
        problems.push(`Line ${p.lineNo} is ${l.status}`)
      if (p.until === 'date') {
        if (!p.date) problems.push('A hold until a date needs the date')
        else if (!future(new Date(`${p.date}T23:59:59+04:00`), ctx.now))
          problems.push(`${p.date} is not in the future`)
      }
      break
    }
    case 'release_line': {
      const l = line(p.lineNo)
      if (!l) problems.push(`There is no line ${p.lineNo} on this record`)
      else if (l.status !== 'held') problems.push(`Line ${p.lineNo} is not held`)
      break
    }
    case 'add_task':
      if (p.dueOn && !future(new Date(`${p.dueOn}T23:59:59+04:00`), ctx.now))
        problems.push(`${p.dueOn} is not in the future`)
      break
    case 'set_reminder':
      if (!future(new Date(p.at), ctx.now)) problems.push('The reminder time is not in the future')
      break
    case 'request_action':
      if (!(ACTION_KEYS as readonly string[]).includes(p.targetKey))
        problems.push(`“${p.targetKey}” is not an action the Assistant knows`)
      else if (!ctx.requestable.includes(p.targetKey))
        problems.push(`The Assistant cannot be asked to do “${p.targetKey}” on this record`)
      break
    case 'unclear':
      problems.push(p.why)
      break
    case 'add_note':
      break
  }
  return problems.length ? { ok: false, problems } : { ok: true }
}

const WHEN = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const DAY = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})

/** The card's headline, written by code from the intent (never by the model). */
export function instructionHeadline(p: InstructionParams, actionLabel?: string): string {
  switch (p.intent) {
    case 'hold_line':
      return p.until === 'date' && p.date
        ? `Hold line ${p.lineNo} until ${DAY.format(new Date(`${p.date}T12:00:00+04:00`))}`
        : `Hold line ${p.lineNo} until ${p.note.replace(/^until\s+/i, '')}`
    case 'release_line':
      return `Release line ${p.lineNo}`
    case 'add_task':
      return `Add a task for the ${p.assignee === 'owner' ? 'Owner' : 'Helper'}: ${p.title}`
    case 'add_note':
      return 'Add a note to this record'
    case 'set_reminder':
      return `Remind you ${WHEN.format(new Date(p.at))}: ${p.text}`
    case 'request_action':
      return `Ask the Assistant to ${actionLabel ?? p.targetKey.replaceAll('_', ' ')}`
    case 'unclear':
      return 'I could not turn this into an action'
  }
}
