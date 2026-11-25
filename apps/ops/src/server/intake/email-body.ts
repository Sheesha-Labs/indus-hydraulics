import 'server-only'
import {
  clientRefFromSubject,
  dubaiEndOfDay,
  emailBodyRegions,
  neededByPhrase,
  parsePrintedDate,
  segmentEmail,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { TX_OPTIONS } from '../../lib/tx-options'
import { bumpIntake } from './live'
import { intakeKindOf, requestCapture } from './upload'

/**
 * Email-body intake (S08-T05, board 36). "Read lines" on a message opens — or reopens — the intake batch for it
 * (one per message; source mail). The body becomes an `email` file read by extract_lines; quoted earlier replies
 * are kept on screen greyed and never read. Each attachment intake can read becomes its own queued file in the same
 * batch, and its lines join the same review. The facts board 36 shows are read by code: the client from the sender
 * (a contact's email, else a company domain), the client reference from the subject, and "needed by" from the
 * sentence that asks for a date — each with its evidence.
 */
export interface EmailFacts {
  client: { id: string; name: string; how: string; pastEnquiries: number } | null
  clientRef: { value: string; how: string } | null
  neededBy: { date: string; quote: string; start: number; end: number } | null
}

const domainOf = (address: string) => address.split('@')[1]?.toLowerCase().trim() ?? ''

export async function readEmailFacts(message: {
  fromAddress: string
  subject: string | null
  bodyText: string | null
  sentAt: Date
}): Promise<EmailFacts> {
  const from = message.fromAddress.toLowerCase()
  const contact = await opsDb.contact.findFirst({
    where: { email: { equals: from, mode: 'insensitive' } },
    select: { company: { select: { id: true, name: true } } },
  })
  const company =
    contact?.company ??
    (await opsDb.company.findFirst({
      where: { domains: { has: domainOf(from) } },
      select: { id: true, name: true },
    }))
  const past = company ? await opsDb.enquiry.count({ where: { clientId: company.id } }) : 0
  const text = message.bodyText ?? ''
  const regions = emailBodyRegions(text, segmentEmail(text))
  const phrase = neededByPhrase(text, regions)
  const date = phrase ? parsePrintedDate(phrase.dateText, message.sentAt) : null
  const ref = clientRefFromSubject(message.subject)
  return {
    client: company
      ? {
          id: company.id,
          name: company.name,
          how: contact ? 'Known sender' : 'Known domain',
          pastEnquiries: past,
        }
      : null,
    clientRef: ref ? { value: ref, how: 'Found in the subject' } : null,
    neededBy:
      phrase && date
        ? { date: date.date, quote: phrase.quote, start: phrase.start, end: phrase.end }
        : null,
  }
}

/** Opens the intake for a message, or returns the one already open (idempotent on the message). */
export async function startEmailIntake(
  p: { id: string } | null,
  messageId: string
): Promise<{ batchId: string; created: boolean }> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      direction: true,
      fromAddress: true,
      subject: true,
      bodyText: true,
      sentAt: true,
      attachments: {
        select: {
          id: true,
          filename: true,
          sizeBytes: true,
          fileId: true,
          sha256: true,
        },
      },
    },
  })
  if (!m) throw new SafeError('That message is no longer in the mailbox.')
  const open = await opsDb.intakeBatch.findFirst({
    where: { mailMessageId: messageId, status: { not: 'cancelled' } },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (open) return { batchId: open.id, created: false }
  if (!m.bodyText?.trim()) throw new SafeError('This message has no text to read lines from.')
  const facts = await readEmailFacts(m)
  const queued: Array<{ id: string; sha256: string }> = []
  const batch = await opsDb.$transaction(async (tx) => {
    const b = await tx.intakeBatch.create({
      data: {
        source: 'mail',
        mailMessageId: m.id,
        createdById: p?.id ?? null,
        clientCompanyId: facts.client?.id ?? null,
        clientRef: facts.clientRef?.value ?? null,
        deadline: facts.neededBy ? dubaiEndOfDay(facts.neededBy.date) : null,
        terms: {
          neededBy: facts.neededBy,
          clientRefHow: facts.clientRef?.how ?? null,
          clientHow: facts.client?.how ?? null,
        } as Prisma.InputJsonValue,
      },
      select: { id: true },
    })
    const body = await tx.intakeFile.create({
      data: {
        batchId: b.id,
        filename: m.subject?.slice(0, 200) || 'Email body',
        kind: 'email',
        uploadedById: p?.id ?? null,
        progressNote: 'Waiting',
      },
      select: { id: true },
    })
    queued.push({ id: body.id, sha256: 'body' })
    for (const a of m.attachments) {
      const kind = intakeKindOf(a.filename)
      if (!kind) continue
      const f = await tx.intakeFile.create({
        data: {
          batchId: b.id,
          storedFileId: a.fileId,
          mailAttachmentId: a.id,
          filename: a.filename.slice(0, 200),
          kind,
          sizeBytes: a.sizeBytes,
          uploadedById: p?.id ?? null,
          ...(a.fileId
            ? { progressNote: 'Waiting' }
            : {
                status: 'needs_attention',
                failureKind: 'failed',
                failureNote: 'The attachment has not been downloaded yet',
                progressPct: 100,
              }),
        },
        select: { id: true },
      })
      if (a.fileId) queued.push({ id: f.id, sha256: a.sha256 ?? a.id })
    }
    await bumpIntake(b.id, tx)
    return b
  }, TX_OPTIONS)
  for (const q of queued) await requestCapture(q.id, q.sha256)
  return { batchId: batch.id, created: true }
}

/**
 * After a file of a batch settles (Ready, Needs attention, expanded): an intake the Assistant opened for a live
 * client enquiry (no person started it) asks for the Create enquiry card once every file is settled (#4).
 */
export async function requestEnquiryWhenSettled(batchId: string): Promise<string | null> {
  const b = await opsDb.intakeBatch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      source: true,
      status: true,
      createdById: true,
      mailMessageId: true,
      files: { where: { status: { in: ['queued', 'extracting'] } }, select: { id: true } },
    },
  })
  if (!b || b.source !== 'mail' || b.createdById || b.status !== 'open' || !b.mailMessageId)
    return null
  if (b.files.length) return null
  const { requestAction } = await import('../assistant/request')
  return requestAction({
    actionKey: 'create_enquiry',
    subjectType: 'mail_message',
    subjectId: b.mailMessageId,
    trigger: 'intake.settled',
    origin: 'live',
    sourceVersion: b.id,
  })
}
