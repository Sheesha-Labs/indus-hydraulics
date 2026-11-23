import 'server-only'
import { OUTBOUND_HEADER, proposedMessageId, replySubject } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import MailComposer from 'nodemailer/lib/mail-composer'
import { htmlToText } from '../gmail/html'
import type { OpsBucket } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * The exact bytes of one outbound email (S04-T06, 08-map-integrations §1.9). nodemailer's MailComposer only,
 * never SMTP. multipart/alternative text + HTML, attachments as multipart/mixed with the names the sending rule
 * gave them, and:
 *
 *   X-Indus-Outbound  the row id: an ambiguous send is reconciled by finding it in Sent
 *   Message-ID        proposed `<ops.<id>@indushydraulics.me>`; the stored rfcMessageId is read back after the
 *                     send, never assumed (Gmail may rewrite it)
 *   In-Reply-To, References and a single "Re: " for a reply in the thread
 *   From              the verified alias with the mailbox's display name
 *   Bcc               kept in the raw message: the Gmail API delivers to the Bcc header and strips it
 *
 * The Gmail API does not add the Gmail signature, so the mailbox's signature (read from send-as and sanitised
 * at connect by send-as.ts sanitizeSignature) is appended to both bodies.
 */
export type BuiltMime = { raw: string; messageId: string; bytes: number }

export class MimeBuildError extends Error {
  constructor(
    readonly code: 'attachment_missing' | 'mime_failed',
    message: string
  ) {
    super(message)
    this.name = 'MimeBuildError'
  }
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  const reader = stream.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  return Buffer.concat(chunks)
}

function quoteName(name: string): string {
  return `"${name.replace(/["\\]/g, '')}"`
}

export function withSignature(
  bodyHtml: string,
  bodyText: string | null,
  signatureHtml: string | null
): { html: string; text: string } {
  const text = bodyText ?? htmlToText(bodyHtml)
  if (!signatureHtml?.trim()) return { html: bodyHtml, text }
  return {
    html: `${bodyHtml}\n<br>\n<div class="indus-signature">${signatureHtml}</div>`,
    text: `${text}\n\n-- \n${htmlToText(signatureHtml)}`,
  }
}

function compile(options: ConstructorParameters<typeof MailComposer>[0]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const node = new MailComposer(options).compile()
    ;(node as unknown as { keepBcc: boolean }).keepBcc = true
    node.build((error, message) => (error ? reject(error) : resolve(message)))
  })
}

export async function buildMime(outboundId: string): Promise<BuiltMime> {
  const row = await opsDb.outboundEmail.findUniqueOrThrow({
    where: { id: outboundId },
    select: {
      id: true,
      subject: true,
      bodyHtml: true,
      bodyText: true,
      toAddresses: true,
      ccAddresses: true,
      bccAddresses: true,
      fromAlias: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
      proposedRfcMessageId: true,
      mailbox: { select: { address: true, displayName: true, signatureHtml: true } },
      attachments: {
        orderBy: { position: 'asc' },
        select: {
          filename: true,
          file: { select: { bucket: true, path: true, mimeType: true, purgedAt: true } },
        },
      },
    },
  })
  if (!row.mailbox) throw new MimeBuildError('mime_failed', 'The email has no mailbox')

  const storage = getStorage()
  const attachments = []
  for (const a of row.attachments) {
    const stream = a.file.purgedAt
      ? null
      : await storage.openRead(a.file.bucket as OpsBucket, a.file.path)
    if (!stream)
      throw new MimeBuildError('attachment_missing', `Attachment ${a.filename} is missing`)
    attachments.push({
      filename: a.filename,
      content: await readAll(stream),
      contentType: a.file.mimeType,
    })
  }

  const messageId = row.proposedRfcMessageId ?? proposedMessageId(row.id)
  const { html, text } = withSignature(row.bodyHtml, row.bodyText, row.mailbox.signatureHtml)
  const reply = !!row.inReplyToRfcId
  try {
    const bytes = await compile({
      from: `${quoteName(row.mailbox.displayName)} <${row.fromAlias ?? row.mailbox.address}>`,
      to: row.toAddresses,
      ...(row.ccAddresses.length ? { cc: row.ccAddresses } : {}),
      ...(row.bccAddresses.length ? { bcc: row.bccAddresses } : {}),
      subject: reply ? replySubject(row.subject) : row.subject,
      text,
      html,
      messageId,
      ...(reply
        ? {
            inReplyTo: row.inReplyToRfcId as string,
            references: row.referencesRfcIds.length
              ? row.referencesRfcIds
              : [row.inReplyToRfcId as string],
          }
        : {}),
      headers: { [OUTBOUND_HEADER]: row.id },
      attachments,
    })
    return { raw: bytes.toString('base64url'), messageId, bytes: bytes.length }
  } catch (error) {
    throw new MimeBuildError('mime_failed', (error as Error).message)
  }
}
