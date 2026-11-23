import 'server-only'
import { createHash } from 'node:crypto'
import { normaliseForExtraction, parseAuthenticationResults } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'
import type { GmailApi } from './client'
import { htmlToText, sanitizeMailHtml } from './html'
import { gmailFor } from './mailbox-client'
import { headerFlags, parseGmailMessage, type AttachmentMeta, type ParsedMessage } from './mime'

/**
 * One Gmail message into Ops (S04-T05, 08-map-integrations §1.6), in the steps ops.gmail.message.fetch runs:
 *
 *   fetchParsed    network only: messages.get full → ParsedMessage (no attachment bytes)
 *   storeMessage   DB: thread upsert + mail_message (idempotent on mailboxId+gmailMessageId), normalised text
 *                  and its hash (Why? offsets point into exactly this text)
 *   storeAttachment network + storage, one attachment per step: sha256, ops-mail object, stored_file reused
 *                  for the same hash in the same mailbox ("forwarded twice"), mail_attachment, zip guard
 *   storeBodyHtml  sanitised HTML (cid images → /api/files/<id>) as ops-mail …/body.html
 *
 * Nothing here can send mail: no import reaches server/mail-send (fetch-graph.test.ts).
 */
export type Origin = 'live' | 'backfill' | 'import'

const sha256 = (data: string | Uint8Array) => createHash('sha256').update(data).digest('hex')

export async function fetchParsed(
  mailboxId: string,
  gmailId: string,
  origin: Origin,
  gmail?: GmailApi
): Promise<ParsedMessage> {
  const client = gmail ?? gmailFor(mailboxId, origin === 'live' ? 'live' : 'backfill')
  return parseGmailMessage(await client.messages.get({ id: gmailId, format: 'full' }))
}

/** `{mailboxId}/{yyyy}/{mm}/{gmailId}/` — the folder of one message's objects in ops-mail. */
export function messageFolder(mailboxId: string, gmailId: string, internalDate: string): string {
  const d = new Date(internalDate)
  const yyyy = String(d.getUTCFullYear())
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${mailboxId}/${yyyy}/${mm}/${gmailId}/`
}

/** A file name safe for a storage key: NFKC, anything but word characters, dot and dash → '-', ≤ 120 chars. */
export function safeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKC')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
  const trimmed = cleaned.slice(-120)
  return trimmed || 'file'
}

export type StoredMessage = {
  messageId: string
  created: boolean
  /** Attachments still to download (none when the message already existed). */
  attachments: AttachmentMeta[]
}

export async function storeMessage(
  mailboxId: string,
  p: ParsedMessage,
  origin: Origin
): Promise<StoredMessage> {
  const existing = await opsDb.mailMessage.findUnique({
    where: { mailboxId_gmailMessageId: { mailboxId, gmailMessageId: p.gmailId } },
    select: { id: true },
  })
  if (existing) return { messageId: existing.id, created: false, attachments: [] }

  const mailbox = await opsDb.mailbox.findUniqueOrThrow({
    where: { id: mailboxId },
    select: { address: true, sendAsAliases: true },
  })
  const own = new Set([mailbox.address, ...mailbox.sendAsAliases].map((a) => a.toLowerCase()))
  const outbound = p.labelIds.includes('SENT') || own.has(p.from.address)
  const rawText = p.text ?? (p.html ? htmlToText(p.html) : '')
  const normalised = normaliseForExtraction(rawText, sha256)
  const sentAt = new Date(p.sentAt)
  const internalDate = new Date(p.internalDate)

  try {
    return await opsDb.$transaction(async (tx) => {
      const thread = await tx.mailThread.upsert({
        where: { mailboxId_gmailThreadId: { mailboxId, gmailThreadId: p.threadId } },
        create: { mailboxId, gmailThreadId: p.threadId, subject: p.subject, lastMessageAt: sentAt },
        update: {},
        select: { id: true, lastMessageAt: true, subject: true },
      })
      if (!thread.lastMessageAt || thread.lastMessageAt < sentAt || !thread.subject) {
        await tx.mailThread.update({
          where: { id: thread.id },
          data: {
            ...(!thread.lastMessageAt || thread.lastMessageAt < sentAt
              ? { lastMessageAt: sentAt }
              : {}),
            ...(!thread.subject && p.subject ? { subject: p.subject } : {}),
          },
        })
      }
      const created = await tx.mailMessage.create({
        data: {
          mailboxId,
          threadId: thread.id,
          gmailMessageId: p.gmailId,
          rfcMessageId: p.rfcMessageId,
          direction: outbound ? 'outbound' : 'inbound',
          fromAddress: p.from.address,
          fromName: p.from.name,
          toAddresses: p.to,
          ccAddresses: p.cc,
          subject: p.subject,
          snippet: normalised.text.slice(0, 200) || null,
          bodyText: normalised.text,
          bodyTextHash: normalised.sha256Hex,
          sentAt,
          internalDate,
          origin,
          inReplyToRfcId: p.inReplyTo,
          referencesRfcIds: p.references,
          gmailLabelIds: p.labelIds,
          authSummary: parseAuthenticationResults(
            p.headers['authentication-results'] ?? []
          ) as Prisma.InputJsonValue,
          headerFlags: headerFlags(p) as Prisma.InputJsonValue,
          hasAttachments: p.attachments.some((a) => !a.inline),
          sizeBytes: p.sizeEstimate,
        },
        select: { id: true },
      })
      await tx.mailboxSyncState.updateMany({
        where: { mailboxId, OR: [{ lastMessageAt: null }, { lastMessageAt: { lt: sentAt } }] },
        data: { lastMessageAt: sentAt },
      })
      if (origin === 'backfill') {
        await tx.mailbox.update({
          where: { id: mailboxId },
          data: { backfillDone: { increment: 1 } },
        })
      }
      return { messageId: created.id, created: true, attachments: p.attachments }
    })
  } catch (error) {
    // A concurrent fetch of the same message won the unique constraint: idempotent.
    if ((error as { code?: string }).code === 'P2002') {
      const row = await opsDb.mailMessage.findUniqueOrThrow({
        where: { mailboxId_gmailMessageId: { mailboxId, gmailMessageId: p.gmailId } },
        select: { id: true },
      })
      return { messageId: row.id, created: false, attachments: [] }
    }
    throw error
  }
}

/** Upload once per (bucket, path); a stored_file with the same hash in this mailbox is reused. */
async function storeBytes(input: {
  mailboxId: string
  path: string
  filename: string
  mimeType: string
  bytes: Uint8Array
  sha: string
}): Promise<{ fileId: string; reused: boolean }> {
  const reuse = await opsDb.storedFile.findFirst({
    where: {
      bucket: OPS_BUCKETS.mail,
      sha256: input.sha,
      path: { startsWith: `${input.mailboxId}/` },
      purgedAt: null,
    },
    select: { id: true },
  })
  if (reuse) return { fileId: reuse.id, reused: true }
  await getStorage().upload(OPS_BUCKETS.mail, input.path, input.bytes, input.mimeType)
  const file = await opsDb.storedFile.upsert({
    where: { bucket_path: { bucket: OPS_BUCKETS.mail, path: input.path } },
    create: {
      bucket: OPS_BUCKETS.mail,
      path: input.path,
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.bytes.length,
      sha256: input.sha,
      source: 'gmail_attachment',
    },
    update: {},
    select: { id: true },
  })
  return { fileId: file.id, reused: false }
}

export type StoredAttachment = {
  attachmentRowId: string
  fileId: string
  reused: boolean
  contentId: string | null
}

export async function storeAttachment(
  input: {
    mailboxId: string
    messageId: string
    gmailId: string
    internalDate: string
    meta: AttachmentMeta
  },
  gmail?: GmailApi
): Promise<StoredAttachment> {
  const { meta } = input
  const existing = await opsDb.mailAttachment.findFirst({
    where: {
      messageId: input.messageId,
      gmailAttachmentId: meta.attachmentId ?? `part:${meta.partId}`,
    },
    select: { id: true, fileId: true },
  })
  if (existing?.fileId)
    return {
      attachmentRowId: existing.id,
      fileId: existing.fileId,
      reused: true,
      contentId: meta.contentId,
    }

  let data = meta.inlineData
  if (!data && meta.attachmentId) {
    const client = gmail ?? gmailFor(input.mailboxId, 'live')
    data =
      (await client.messages.attachments.get({ messageId: input.gmailId, id: meta.attachmentId }))
        .data ?? null
  }
  const bytes = new Uint8Array(Buffer.from(data ?? '', 'base64url'))
  const sha = sha256(bytes)
  const filename = safeFilename(meta.filename)
  const path = `${messageFolder(input.mailboxId, input.gmailId, input.internalDate)}${sha.slice(0, 16)}-${filename}`
  const stored = await storeBytes({
    mailboxId: input.mailboxId,
    path,
    filename: meta.filename,
    mimeType: meta.mimeType,
    bytes,
    sha,
  })

  const zip = await zipVerdict(meta, bytes)
  const row = await opsDb.mailAttachment.create({
    data: {
      messageId: input.messageId,
      gmailAttachmentId: meta.attachmentId ?? `part:${meta.partId}`,
      filename: meta.filename,
      mimeType: meta.mimeType,
      sizeBytes: bytes.length,
      sha256: sha,
      fileId: stored.fileId,
      // Over a zip limit: stored as it came, never expanded (the enum has no 'skipped'; 'unsupported' + note).
      ...(zip ? { extractionStatus: 'unsupported' as const, extractionNote: zip } : {}),
    },
    select: { id: true },
  })
  return {
    attachmentRowId: row.id,
    fileId: stored.fileId,
    reused: stored.reused,
    contentId: meta.contentId,
  }
}

/** For a .zip: a note when the archive must be stored but not expanded (zip-bomb guard), else null. */
async function zipVerdict(meta: AttachmentMeta, bytes: Uint8Array): Promise<string | null> {
  const isZip = /zip/i.test(meta.mimeType) || /\.zip$/i.test(meta.filename)
  if (!isZip) return null
  const { scanZip } = await import('./attachments')
  return scanZip(bytes)
}

/** Sanitised HTML body as ops-mail …/body.html (cid images pointing at their stored files). */
export async function storeBodyHtml(input: {
  mailboxId: string
  messageId: string
  gmailId: string
  internalDate: string
  html: string
  cidMap: Record<string, string>
}): Promise<string> {
  const clean = sanitizeMailHtml(input.html, new Map(Object.entries(input.cidMap)))
  const bytes = new Uint8Array(Buffer.from(clean, 'utf8'))
  const path = `${messageFolder(input.mailboxId, input.gmailId, input.internalDate)}body.html`
  const stored = await storeBytes({
    mailboxId: input.mailboxId,
    path,
    filename: 'body.html',
    mimeType: 'text/html',
    bytes,
    sha: sha256(bytes),
  })
  await opsDb.mailMessage.update({
    where: { id: input.messageId },
    data: { bodyHtmlFileId: stored.fileId },
  })
  return stored.fileId
}

/**
 * The raw RFC 822 copy of a message that has become evidence (a PO, a supplier quote, a client acceptance),
 * kept as …/message.eml for the 5-year retention. Called by S08/S15/S22, never on every message.
 */
export async function fetchRawEvidence(messageId: string, gmail?: GmailApi): Promise<string> {
  const m = await opsDb.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      mailboxId: true,
      gmailMessageId: true,
      internalDate: true,
      sentAt: true,
      rawEmlFileId: true,
    },
  })
  if (m.rawEmlFileId) return m.rawEmlFileId
  const client = gmail ?? gmailFor(m.mailboxId, 'live')
  const raw = await client.messages.get({ id: m.gmailMessageId, format: 'raw' })
  const bytes = new Uint8Array(Buffer.from(raw.raw ?? '', 'base64url'))
  const internal = (m.internalDate ?? m.sentAt).toISOString()
  const stored = await storeBytes({
    mailboxId: m.mailboxId,
    path: `${messageFolder(m.mailboxId, m.gmailMessageId, internal)}message.eml`,
    filename: 'message.eml',
    mimeType: 'message/rfc822',
    bytes,
    sha: sha256(bytes),
  })
  await opsDb.mailMessage.update({
    where: { id: messageId },
    data: { rawEmlFileId: stored.fileId },
  })
  return stored.fileId
}
