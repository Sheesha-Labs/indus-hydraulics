import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { CLASS_LABEL, MAIL_CLASSES, type MailClassValue } from '@indus/ops-core'
import {
  changeType,
  LINKABLE,
  linkTo,
  type LinkableType,
  type OverrideResult,
} from '../../mail/overrides'

/**
 * `override_value` (S06-T05, board 112 "This is wrong…"): which values the Assistant set can be corrected from
 * Why?, what the person may choose, and how the correction is applied. Not run by the runner: it is a person's
 * decision, executed by the system and recorded as an action (server/assistant/override.ts writes the row).
 *
 * Every apply goes through the S05 override services, which write through writeTracked with the person as
 * actor ("Overridden by KB") and record the preference signal. Later sprints register their own values
 * (extraction fields in S08, compare picks in S13) with registerCorrectable; nothing here changes.
 */
export type ValueType = 'class' | 'option' | 'text'

export interface CorrectionChoice {
  key: string
  label: string
  sub?: string
}

export interface CorrectableAction {
  id: string
  ref: string
  actionKey: string
  subjectType: string | null
  subjectId: string | null
  options: unknown
}

export interface Correctable {
  /** The field the action set, as activity_event.field records it. */
  field: string
  /** "Type", "Linked record". */
  label: string
  valueType: ValueType
  /** Under the Save button: what changing it does. */
  consequence: string
  /** The choices offered (class: every type; option: the action's alternatives). */
  choices(action: CorrectableAction): CorrectionChoice[]
  /** Throws a CorrectionError when `value` is not an allowed choice. */
  apply(
    tx: Prisma.TransactionClient,
    input: {
      action: CorrectableAction
      value: string
      reason: string
      actor: { id: string; initials: string }
    }
  ): Promise<{ result: OverrideResult; label: string }>
}

export class CorrectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CorrectionError'
  }
}

const REGISTRY = new Map<string, Correctable>()

export function registerCorrectable(actionKey: string, c: Correctable): void {
  if (REGISTRY.has(actionKey))
    throw new Error(`Correctable value for "${actionKey}" is registered twice`)
  REGISTRY.set(actionKey, c)
}

export function correctableFor(actionKey: string): Correctable | null {
  return REGISTRY.get(actionKey) ?? null
}

function storedOptions(action: CorrectableAction): CorrectionChoice[] {
  const raw = Array.isArray(action.options) ? (action.options as unknown[]) : []
  return raw.flatMap((o) => {
    const r = o as { key?: unknown; label?: unknown; consequence?: unknown }
    return typeof r.key === 'string' && typeof r.label === 'string'
      ? [
          {
            key: r.key,
            label: r.label,
            ...(typeof r.consequence === 'string' && r.consequence ? { sub: r.consequence } : {}),
          },
        ]
      : []
  })
}

const CLASS_CHOICES: CorrectionChoice[] = MAIL_CLASSES.filter((c) => c !== 'unclassified').map(
  (c) => ({ key: c, label: CLASS_LABEL[c] })
)

function mailSubject(action: CorrectableAction): string {
  if (action.subjectType !== 'mail_message' || !action.subjectId) {
    throw new CorrectionError('This action is not about an email')
  }
  return action.subjectId
}

registerCorrectable('classify_mail', {
  field: 'classification',
  label: 'Type',
  valueType: 'class',
  consequence: 'Changing it re-files the email and records “Overridden by” you in History.',
  choices: () => CLASS_CHOICES,
  async apply(tx, { action, value, reason, actor }) {
    const cls = MAIL_CLASSES.find((c) => c === value && c !== 'unclassified') as
      MailClassValue | undefined
    if (!cls) throw new CorrectionError('Choose a type')
    const result = await changeType(tx, {
      messageId: mailSubject(action),
      cls,
      actor,
      signal: { reason, via: 'why', correctsAction: action.ref },
    })
    return { result, label: CLASS_LABEL[cls] }
  },
})

registerCorrectable('link_mail', {
  field: 'link',
  label: 'Linked record',
  valueType: 'option',
  consequence:
    'Changing it moves the email to that record and records “Overridden by” you in History.',
  choices: storedOptions,
  async apply(tx, { action, value, reason, actor }) {
    const choice = storedOptions(action).find((o) => o.key === value)
    const [type, id] = value.split(':')
    if (!choice || !type || !id || !(LINKABLE as readonly string[]).includes(type)) {
      throw new CorrectionError('Choose one of the records offered, or use Link to… in Mail')
    }
    const result = await linkTo(tx, {
      messageId: mailSubject(action),
      subjectType: type as LinkableType,
      subjectId: id,
      enquiryId: type === 'enquiry' ? id : null,
      actor,
      replace: true,
      signal: { reason, via: 'why', correctsAction: action.ref },
    })
    return { result, label: choice.label }
  },
})
