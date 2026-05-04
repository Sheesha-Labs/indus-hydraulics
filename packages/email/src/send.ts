import { Resend } from 'resend'
import { db } from '@indus/db'

export type EmailKind =
  | 'rfq_confirmation'
  | 'rfq_internal_alert'
  | 'quote_sent'
  | 'quote_accepted_ack'
  | 'quote_declined_ack'
  | 'password_reset'
  | 'contact_inquiry'
  | 'quote_expiry_reminder'

export type EmailAttachment = {
  filename: string
  /** Raw bytes of the attachment. */
  content: Buffer
  /** Optional MIME type; defaults to application/octet-stream. */
  contentType?: string
}

export type SendEmailInput = {
  kind: EmailKind
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  fromEmail: string
  fromName?: string
  replyTo?: string
  attachments?: EmailAttachment[]
  rfqId?: string
  quoteId?: string
}

export type SendEmailResult =
  | { ok: true; sentEmailId: string; providerId: string | null; status: 'sent' | 'sandboxed' }
  | { ok: false; sentEmailId: string; error: string }

const resendClient = (() => {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
})()

const SANDBOX = !resendClient

function formatFrom(input: SendEmailInput): string {
  return input.fromName ? `${input.fromName} <${input.fromEmail}>` : input.fromEmail
}

/**
 * Send a transactional email and persist a SentEmail audit row.
 *
 * Sandbox mode: if RESEND_API_KEY is unset, the message is logged with
 * status='sandboxed' and not actually delivered. This lets us build/test
 * locally before DNS is wired up. The function never throws — call sites
 * use the returned ok flag.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const audit = await db.sentEmail.create({
    data: {
      kind: input.kind,
      toEmails: input.to,
      ccEmails: input.cc ?? [],
      bccEmails: input.bcc ?? [],
      fromEmail: input.fromEmail,
      replyTo: input.replyTo ?? null,
      subject: input.subject,
      bodyHtml: input.html,
      status: SANDBOX ? 'sandboxed' : 'queued',
      ...(input.rfqId ? { rfqId: input.rfqId } : {}),
      ...(input.quoteId ? { quoteId: input.quoteId } : {}),
    },
  })

  if (SANDBOX || !resendClient) {
    const attachInfo = input.attachments?.length ? ` attachments=${input.attachments.length}` : ''
    // eslint-disable-next-line no-console
    console.info(`[email:sandbox] kind=${input.kind} to=${input.to.join(',')} subject="${input.subject}"${attachInfo}`)
    return { ok: true, sentEmailId: audit.id, providerId: null, status: 'sandboxed' }
  }

  try {
    const result = await resendClient.emails.send({
      from: formatFrom(input),
      to: input.to,
      ...(input.cc && input.cc.length ? { cc: input.cc } : {}),
      ...(input.bcc && input.bcc.length ? { bcc: input.bcc } : {}),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      subject: input.subject,
      html: input.html,
      ...(input.attachments && input.attachments.length
        ? {
            attachments: input.attachments.map((a) => ({
              filename: a.filename,
              content: a.content,
              ...(a.contentType ? { contentType: a.contentType } : {}),
            })),
          }
        : {}),
    })

    if (result.error) {
      await db.sentEmail.update({
        where: { id: audit.id },
        data: { status: 'failed', error: result.error.message },
      })
      return { ok: false, sentEmailId: audit.id, error: result.error.message }
    }

    await db.sentEmail.update({
      where: { id: audit.id },
      data: {
        status: 'sent',
        providerId: result.data?.id ?? null,
        sentAt: new Date(),
      },
    })
    return { ok: true, sentEmailId: audit.id, providerId: result.data?.id ?? null, status: 'sent' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email send error'
    await db.sentEmail.update({
      where: { id: audit.id },
      data: { status: 'failed', error: message },
    })
    return { ok: false, sentEmailId: audit.id, error: message }
  }
}
