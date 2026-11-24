import 'server-only'
import type { $Enums, Prisma } from '@indus/ops-db'

/**
 * How a recorded change is put back (S06-T07): undo inside the window and "Revert to before Assistant
 * change" both write an activity row's `before` value back to its field. Each writer knows one
 * (subjectType, field); the caller wraps it in writeTracked, so the reversal is itself a new, tracked row
 * (revertsEventId) and nothing is deleted. A field with no writer cannot be reverted from History (Why?
 * "This is wrong…" corrects it instead). Later sprints register their own fields.
 */
export type FieldWriter = (
  tx: Prisma.TransactionClient,
  subjectId: string,
  change: { to: unknown; from: unknown }
) => Promise<void>

const WRITERS = new Map<string, FieldWriter>()

export function registerFieldWriter(
  subjectType: $Enums.RecordType,
  field: string,
  w: FieldWriter
): void {
  const k = `${subjectType}.${field}`
  if (WRITERS.has(k)) throw new Error(`Field writer ${k} is registered twice`)
  WRITERS.set(k, w)
}

export function fieldWriter(subjectType: string, field: string | null): FieldWriter | null {
  return field ? (WRITERS.get(`${subjectType}.${field}`) ?? null) : null
}

const str = (v: unknown) => (typeof v === 'string' ? v : null)

registerFieldWriter('mail_message', 'classification', async (tx, id, { to }) => {
  await tx.mailMessage.update({
    where: { id },
    data: { classification: (str(to) ?? 'unclassified') as $Enums.MailClass },
  })
})

registerFieldWriter('mail_message', 'confidence', async (tx, id, { to }) => {
  await tx.mailMessage.update({
    where: { id },
    data: { confidence: str(to) as $Enums.Confidence | null },
  })
})

registerFieldWriter('mail_message', 'handledState', async (tx, id, { to }) => {
  const s = str(to)
  if (s)
    await tx.mailMessage.update({
      where: { id },
      data: { handledState: s as $Enums.MailHandledState },
    })
})

/** "type:id" ↔ null: retire the link (removedAt; kept as history) or bring it back. */
registerFieldWriter('mail_message', 'link', async (tx, messageId, { to, from }) => {
  const parse = (v: unknown) => {
    const [t, i] = (str(v) ?? '').split(':')
    return t && i ? { subjectType: t as $Enums.RecordType, subjectId: i } : null
  }
  const gone = parse(from)
  const back = parse(to)
  if (gone) {
    await tx.mailLink.updateMany({
      where: { messageId, ...gone, removedAt: null },
      data: { removedAt: new Date() },
    })
  }
  if (back) {
    await tx.mailLink.updateMany({
      where: { messageId, ...back },
      data: { removedAt: null },
    })
  }
})

// ── S06-T08: what an approved instruction changed ────────────────────────────────────────────────────

registerFieldWriter('enquiry_line', 'status', async (tx, id, { to }) => {
  const s = str(to)
  if (s) await tx.enquiryLine.update({ where: { id }, data: { status: s as $Enums.LineStatus } })
})

registerFieldWriter('enquiry_line', 'heldReason', async (tx, id, { to }) => {
  await tx.enquiryLine.update({ where: { id }, data: { heldReason: str(to) } })
})

/** A task (or reminder) the instruction added: undoing it cancels the task; the row stays. */
registerFieldWriter('enquiry', 'task', async (tx, enquiryId, { to, from }) => {
  if (to === null && typeof from === 'string') {
    await tx.task.updateMany({
      where: { enquiryId, title: from, source: 'assistant', status: 'open' },
      data: { status: 'cancelled' },
    })
  }
})

/** A note is history: the reversal row itself withdraws it, nothing else changes. */
registerFieldWriter('enquiry', 'note', async () => undefined)
