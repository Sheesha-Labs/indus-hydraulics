import 'server-only'
import { maintDb, opsDb, Prisma, type PrismaClient } from '@indus/ops-db'
import { NonRetriableError } from 'inngest'
import { env } from '../../lib/env'
import type { OpsBucket } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * Board 90 "Delete everything imported from this mailbox" (S04-T08). Runs on the `ops_maint` client
 * (06-map-schema §3.1: DELETE on mail_* and stored_file) in batches of at most 500 messages, so no
 * transaction is long and the pooler budget holds. Per batch: the messages' links and attachment rows, the
 * stored files only these messages used (and their objects in ops-mail), then the messages. When no message
 * is left, the threads go (an outbound row that pointed at one keeps its history with the thread cleared).
 * Gmail itself is never touched. Captured prices are S15's hook.
 */
export const PURGE_BATCH = 500

export type PurgeTotals = { messages: number; attachments: number; files: number; threads: number }

export function purgeClient(): PrismaClient {
  const e = env()
  if (e.OPS_MAINT_DATABASE_URL) return maintDb(e.OPS_MAINT_DATABASE_URL)
  if (e.APP_ENV === 'production') {
    throw new NonRetriableError(
      'OPS_MAINT_DATABASE_URL is not set: the purge needs the ops_maint role'
    )
  }
  // Local and preview databases without the second role: ops_app holds the same DELETE rights there.
  return opsDb
}

/** Delete one stored file row and its object, unless something else still uses it. */
async function dropFile(db: PrismaClient, fileId: string): Promise<boolean> {
  try {
    const file = await db.storedFile.delete({
      where: { id: fileId },
      select: { bucket: true, path: true },
    })
    await getStorage()
      .remove(file.bucket as OpsBucket, file.path)
      .catch(() => undefined)
    return true
  } catch (error) {
    // P2003: still referenced (the same attachment in another mailbox, a document). Keep it.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2003', 'P2025'].includes(error.code)
    ) {
      return false
    }
    throw error
  }
}

/** One batch. `done` once the mailbox has no message and no thread left in Operations. */
export async function purgeBatch(
  mailboxId: string,
  db: PrismaClient = purgeClient(),
  size = PURGE_BATCH
): Promise<{ done: boolean; totals: PurgeTotals }> {
  const totals: PurgeTotals = { messages: 0, attachments: 0, files: 0, threads: 0 }
  const messages = await db.mailMessage.findMany({
    where: { mailboxId },
    select: { id: true, bodyHtmlFileId: true, rawEmlFileId: true },
    take: size,
  })
  if (messages.length) {
    const ids = messages.map((m) => m.id)
    const attachments = await db.mailAttachment.findMany({
      where: { messageId: { in: ids } },
      select: { fileId: true },
    })
    const fileIds = [
      ...new Set(
        [
          ...attachments.map((a) => a.fileId),
          ...messages.map((m) => m.bodyHtmlFileId),
          ...messages.map((m) => m.rawEmlFileId),
        ].filter((v): v is string => !!v)
      ),
    ]
    await db.$transaction([
      db.mailLink.deleteMany({ where: { messageId: { in: ids } } }),
      db.mailAttachment.deleteMany({ where: { messageId: { in: ids } } }),
      db.mailMessage.deleteMany({ where: { id: { in: ids } } }),
    ])
    totals.messages = ids.length
    totals.attachments = attachments.length
    for (const id of fileIds) if (await dropFile(db, id)) totals.files += 1
    return { done: false, totals }
  }

  const threads = await db.mailThread.findMany({
    where: { mailboxId },
    select: { id: true },
    take: size,
  })
  if (!threads.length) return { done: true, totals }
  const ids = threads.map((t) => t.id)
  await db.$transaction([
    db.outboundEmail.updateMany({ where: { threadId: { in: ids } }, data: { threadId: null } }),
    db.mailThread.deleteMany({ where: { id: { in: ids } } }),
  ])
  totals.threads = ids.length
  return { done: threads.length < size, totals }
}

/** The purge's own receipt, written when it finishes (activity_event, by the person who asked for it). */
export async function writePurgeReceipt(input: {
  mailboxId: string
  requestedById: string | null
  totals: PurgeTotals
}): Promise<void> {
  const box = await opsDb.mailbox.findUnique({
    where: { id: input.mailboxId },
    select: { address: true },
  })
  const t = input.totals
  const fmt = (v: number) => v.toLocaleString('en-US')
  await opsDb.activityEvent.create({
    data: {
      actorKind: input.requestedById ? 'user' : 'system',
      actorId: input.requestedById,
      subjectType: 'mailbox',
      subjectId: input.mailboxId,
      kind: 'settings',
      field: 'purge',
      note: `Removed ${fmt(t.messages)} emails, ${fmt(t.attachments)} attachments (${fmt(t.files)} stored files) and ${fmt(t.threads)} conversations imported from ${box?.address ?? 'the mailbox'}. Gmail was not touched.`,
      after: t as unknown as Prisma.InputJsonValue,
    },
  })
}
