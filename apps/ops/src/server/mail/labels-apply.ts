import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { desiredLabels, labelDiff, MANAGED_LABEL_KINDS, type MailClassValue } from '@indus/ops-core'
import { setActor, writeTracked } from '../assistant/write-tracked'
import { gmailFor } from '../gmail/mailbox-client'
import { getSetting } from '../settings/get'

/**
 * Action #3 label in Gmail (S05-T04, catalogue key `label_gmail`, Do quietly; 08-map-integrations §1.8).
 * Three steps, so no database connection is held across the Gmail call:
 *
 *   planLabels    DB read: the labels the message should carry (desiredLabels) against labelsApplied, as
 *                 Gmail ids of this mailbox's managed `Indus/*` labels only
 *   applyLabels   network: messages.modify with those ids (the client wrapper refuses anything else)
 *   recordLabels  DB write: labelsApplied, and one done `label_gmail` action per change set
 *
 * Never a system label, never Indus/Ignore (the person's own), never for backfilled or imported mail.
 */
export interface LabelPlan {
  messageId: string
  mailboxId: string
  gmailMessageId: string
  add: string[]
  remove: string[]
  /** labelsApplied after the change. */
  next: string[]
  before: string[]
  skipped?: 'origin' | 'off' | 'no_labels' | 'unchanged'
}

export async function planLabels(messageId: string): Promise<LabelPlan> {
  const m = await opsDb.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      id: true,
      mailboxId: true,
      gmailMessageId: true,
      origin: true,
      classification: true,
      confidence: true,
      handledState: true,
      labelsApplied: true,
      mailbox: { select: { role: true, labels: { select: { name: true, gmailLabelId: true } } } },
      links: { where: { removedAt: null }, select: { subjectType: true } },
    },
  })
  const base = {
    messageId: m.id,
    mailboxId: m.mailboxId,
    gmailMessageId: m.gmailMessageId,
    add: [] as string[],
    remove: [] as string[],
    next: m.labelsApplied,
    before: m.labelsApplied,
  }
  if (m.origin !== 'live') return { ...base, skipped: 'origin' }
  const [setting, names] = await Promise.all([
    opsDb.autopilotSetting.findUnique({
      where: { actionKey: 'label_gmail' },
      select: { level: true },
    }),
    getSetting('mail.label_names'),
  ])
  if (setting?.level === 'off' || setting?.level === 'never') return { ...base, skipped: 'off' }

  const idByName = new Map(m.mailbox.labels.map((l) => [l.name, l.gmailLabelId]))
  const idOf = (kind: (typeof MANAGED_LABEL_KINDS)[number]) => idByName.get(names[kind])
  const managed = MANAGED_LABEL_KINDS.map(idOf).filter((x): x is string => !!x)
  if (!managed.length) return { ...base, skipped: 'no_labels' }

  const role =
    m.mailbox.role === 'client' || m.mailbox.role === 'supplier' ? m.mailbox.role : 'personal'
  const desired = desiredLabels({
    classification: m.classification as MailClassValue,
    confidence: m.confidence,
    mailboxRole: role,
    linkedTypes: m.links.map((l) => l.subjectType),
    openReviewCard: m.handledState === 'needs_you',
  })
    .map((k) => idOf(k))
    .filter((x): x is string => !!x)
  const diff = labelDiff({ desired, applied: m.labelsApplied, managed })
  if (!diff.add.length && !diff.remove.length) return { ...base, skipped: 'unchanged' }
  const next = [
    ...new Set([...m.labelsApplied.filter((id) => !diff.remove.includes(id)), ...diff.add]),
  ].sort()
  return { ...base, add: diff.add, remove: diff.remove, next }
}

export async function applyLabels(plan: LabelPlan): Promise<void> {
  if (plan.skipped) return
  await gmailFor(plan.mailboxId, 'live').messages.modify({
    id: plan.gmailMessageId,
    addLabelIds: plan.add,
    removeLabelIds: plan.remove,
  })
}

function dubaiDay(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** labelsApplied and the action row, in one transaction. Returns the action id (null when skipped). */
export async function recordLabels(plan: LabelPlan, now = new Date()): Promise<string | null> {
  if (plan.skipped) return null
  return opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'assistant' })
    const [num] = await tx.$queryRaw<Array<{ formatted: string }>>`
      SELECT formatted FROM ops.allocate_number('assistant_action', ${dubaiDay(now)})`
    if (!num) throw new Error('allocate_number returned no row')
    const action = await tx.assistantAction.create({
      data: {
        ref: num.formatted,
        actionKey: 'label_gmail',
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: plan.messageId,
        headline: `Gmail labels updated (+${plan.add.length} −${plan.remove.length})`,
        reasons: [
          { text: 'The message’s class or links changed' },
        ] as unknown as Prisma.InputJsonValue,
        checks: [
          { label: 'Indus labels only', status: 'pass' },
        ] as unknown as Prisma.InputJsonValue,
        confidence: 'sure',
        inputs: { add: plan.add, remove: plan.remove } as unknown as Prisma.InputJsonValue,
        state: 'running',
        origin: 'live',
        surface: 'hint',
        levelReasons: ['Do quietly in Autopilot'] as unknown as Prisma.InputJsonValue,
        idempotencyKey: `label_gmail:mail_message:${plan.messageId}:${plan.next.join('+') || 'none'}`,
      },
      select: { id: true },
    })
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: action.id,
        subjectType: 'mail_message',
        subjectId: plan.messageId,
        changes: [{ field: 'labelsApplied', before: plan.before, after: plan.next, kind: 'other' }],
      },
      async (t) => {
        await t.mailMessage.update({
          where: { id: plan.messageId },
          data: { labelsApplied: plan.next },
        })
      }
    )
    await tx.assistantAction.update({
      where: { id: action.id },
      data: { state: 'done', doneAt: now },
    })
    return action.id
  })
}
