import 'server-only'
import type { $Enums, Prisma } from '@indus/ops-db'
import { changeLineStatus } from '../enquiry/transition'

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

/**
 * "type:id" ↔ null: retire the link (removedAt; kept as history) or bring it back. The link effect also put
 * the thread on the link's enquiry when it had none; retiring the last live link to that enquiry in the
 * thread takes the thread off it again, and bringing a link back puts it back.
 */
registerFieldWriter('mail_message', 'link', async (tx, messageId, { to, from }) => {
  const parse = (v: unknown) => {
    const [t, i] = (str(v) ?? '').split(':')
    return t && i ? { subjectType: t as $Enums.RecordType, subjectId: i } : null
  }
  const gone = parse(from)
  const back = parse(to)
  const msg = await tx.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: { threadId: true, thread: { select: { enquiryId: true } } },
  })
  if (gone) {
    const retired = await tx.mailLink.findMany({
      where: { messageId, ...gone, removedAt: null },
      select: { enquiryId: true },
    })
    await tx.mailLink.updateMany({
      where: { messageId, ...gone, removedAt: null },
      data: { removedAt: new Date() },
    })
    const enquiryId = retired.find((r) => r.enquiryId)?.enquiryId ?? null
    if (enquiryId && msg.thread.enquiryId === enquiryId) {
      const still = await tx.mailLink.count({
        where: { enquiryId, removedAt: null, message: { threadId: msg.threadId } },
      })
      if (still === 0)
        await tx.mailThread.update({ where: { id: msg.threadId }, data: { enquiryId: null } })
    }
  }
  if (back) {
    await tx.mailLink.updateMany({
      where: { messageId, ...back },
      data: { removedAt: null },
    })
    const restored = await tx.mailLink.findFirst({
      where: { messageId, ...back },
      select: { enquiryId: true },
    })
    if (restored?.enquiryId && !msg.thread.enquiryId)
      await tx.mailThread.update({
        where: { id: msg.threadId },
        data: { enquiryId: restored.enquiryId },
      })
  }
})

// ── S06-T08: what an approved instruction changed ────────────────────────────────────────────────────

registerFieldWriter('enquiry_line', 'status', async (tx, id, { to }) => {
  const s = str(to)
  // Through the line machine (S09-T01); the revert records its own event, so apply only.
  if (s)
    await changeLineStatus(tx, {
      lineId: id,
      to: s as $Enums.LineStatus,
      actor: { kind: 'system' },
      ctx: { heldReason: 'restored', notQuotedReason: 'restored', regretReason: 'other' },
      untracked: true,
    })
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
