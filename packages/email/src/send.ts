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
  | 'quote_expired'
  | 'email_change_verification'
  | 'staff_invitation'
  | 'staff_password_reset'
  | 'newsletter_confirmation'
  | 'newsletter_welcome'
  | 'newsletter_test'
  | 'newsletter_campaign'

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
  /**
   * Plain-text alternative. Sent as the text/plain part; mail clients that
   * do not render HTML, and spam filters scoring HTML-only mail, read this.
   * Every newsletter email carries one.
   */
  text?: string
  /**
   * Extra headers — `List-Unsubscribe` and `List-Unsubscribe-Post` on
   * newsletter mail (RFC 8058). Never use this for From/To/Subject.
   */
  headers?: Record<string, string>
  fromEmail: string
  fromName?: string
  replyTo?: string
  attachments?: EmailAttachment[]
  rfqId?: string
  quoteId?: string
  /**
   * Resend `Idempotency-Key`. A retried request with the same key is not
   * sent twice (Resend keeps keys for 24 h).
   */
  idempotencyKey?: string
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

function formatFrom(input: Pick<SendEmailInput, 'fromEmail' | 'fromName'>): string {
  return input.fromName ? `${input.fromName} <${input.fromEmail}>` : input.fromEmail
}

/**
 * Subset of `SendEmailInput` that survives JSON serialisation. Stashed on
 * the SentEmail row so the retry cron can re-call Resend without the
 * caller having to hold onto the original input. Attachments are
 * deliberately excluded — Buffers don't round-trip through JSON, and
 * emails with attachments are not retried in v1.
 */
export type RetryablePayload = {
  kind: EmailKind
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text?: string
  headers?: Record<string, string>
  fromEmail: string
  fromName?: string
  replyTo?: string
  rfqId?: string
  quoteId?: string
}

function buildRetryablePayload(input: SendEmailInput): RetryablePayload | null {
  if (input.attachments && input.attachments.length > 0) return null
  return {
    kind: input.kind,
    to: input.to,
    ...(input.cc ? { cc: input.cc } : {}),
    ...(input.bcc ? { bcc: input.bcc } : {}),
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
    ...(input.headers && Object.keys(input.headers).length ? { headers: input.headers } : {}),
    fromEmail: input.fromEmail,
    ...(input.fromName ? { fromName: input.fromName } : {}),
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    ...(input.rfqId ? { rfqId: input.rfqId } : {}),
    ...(input.quoteId ? { quoteId: input.quoteId } : {}),
  }
}

/** The Resend request body for one message. Shared by single and batch sends. */
export function toResendPayload(input: SendEmailInput) {
  return {
    from: formatFrom(input),
    to: input.to,
    ...(input.cc && input.cc.length ? { cc: input.cc } : {}),
    ...(input.bcc && input.bcc.length ? { bcc: input.bcc } : {}),
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
    ...(input.headers && Object.keys(input.headers).length ? { headers: input.headers } : {}),
    ...(input.attachments && input.attachments.length
      ? {
          attachments: input.attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            ...(a.contentType ? { contentType: a.contentType } : {}),
          })),
        }
      : {}),
  }
}

function auditData(input: SendEmailInput) {
  const retryablePayload = buildRetryablePayload(input)
  return {
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
    ...(retryablePayload ? { payload: retryablePayload } : {}),
  }
}

/**
 * Send a transactional email and persist a SentEmail audit row.
 *
 * Sandbox mode: if RESEND_API_KEY is unset, the message is logged with
 * status='sandboxed' and not actually delivered. This lets us build/test
 * locally before DNS is wired up. The function never throws — call sites
 * use the returned ok flag.
 *
 * Failed sends (status='failed') are eligible for the `email.retry-failed`
 * Inngest cron which retries up to 3× with exponential backoff. Emails
 * with attachments are skipped by the retry queue.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const audit = await db.sentEmail.create({ data: auditData(input) })

  if (SANDBOX || !resendClient) {
    const attachInfo = input.attachments?.length ? ` attachments=${input.attachments.length}` : ''
    // eslint-disable-next-line no-console
    console.info(`[email:sandbox] kind=${input.kind} to=${input.to.join(',')} subject="${input.subject}"${attachInfo}`)
    return { ok: true, sentEmailId: audit.id, providerId: null, status: 'sandboxed' }
  }

  try {
    const result = await resendClient.emails.send(
      toResendPayload(input),
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    )

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

/** Resend's batch endpoint takes at most this many messages per request. */
export const BATCH_LIMIT = 100

export type SendEmailBatchResult =
  | { ok: true; results: { sentEmailId: string; providerId: string | null }[]; status: 'sent' | 'sandboxed' }
  | { ok: false; sentEmailIds: string[]; error: string }

/**
 * Send up to BATCH_LIMIT messages in ONE Resend request (the batch API), with
 * one SentEmail audit row each.
 *
 * All-or-nothing, as Resend's batch endpoint is: either every message was
 * accepted, and each row is stamped `sent` with its own provider id, or none
 * was and every row is `failed`. Pass an `idempotencyKey` derived from what is
 * being sent (campaign + batch), so a retried request after a timeout cannot
 * deliver the batch twice. Attachments are not supported by the batch API.
 *
 * Never throws; callers use the returned ok flag.
 */
export async function sendEmailBatch(
  inputs: SendEmailInput[],
  options: { idempotencyKey?: string } = {},
): Promise<SendEmailBatchResult> {
  if (inputs.length === 0) return { ok: true, results: [], status: SANDBOX ? 'sandboxed' : 'sent' }
  if (inputs.length > BATCH_LIMIT) {
    return { ok: false, sentEmailIds: [], error: `A batch holds at most ${BATCH_LIMIT} emails, got ${inputs.length}.` }
  }
  if (inputs.some((i) => i.attachments && i.attachments.length > 0)) {
    return { ok: false, sentEmailIds: [], error: 'The batch API does not take attachments.' }
  }

  const rows = await db.$transaction(inputs.map((input) => db.sentEmail.create({ data: auditData(input), select: { id: true } })))
  const ids = rows.map((r) => r.id)

  if (SANDBOX || !resendClient) {
    // eslint-disable-next-line no-console
    console.info(`[email:sandbox] batch of ${inputs.length} kind=${inputs[0]?.kind}`)
    return { ok: true, results: ids.map((sentEmailId) => ({ sentEmailId, providerId: null })), status: 'sandboxed' }
  }

  const fail = async (error: string): Promise<SendEmailBatchResult> => {
    await db.sentEmail.updateMany({ where: { id: { in: ids } }, data: { status: 'failed', error } })
    return { ok: false, sentEmailIds: ids, error }
  }

  try {
    const result = await resendClient.batch.send(
      inputs.map(toResendPayload),
      options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
    )
    if (result.error) return fail(result.error.message)

    const providerIds = result.data?.data.map((d) => d.id) ?? []
    const sentAt = new Date()
    await db.$transaction(
      ids.map((id, i) =>
        db.sentEmail.update({
          where: { id },
          data: { status: 'sent', providerId: providerIds[i] ?? null, sentAt },
        }),
      ),
    )
    return {
      ok: true,
      results: ids.map((sentEmailId, i) => ({ sentEmailId, providerId: providerIds[i] ?? null })),
      status: 'sent',
    }
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Unknown email send error')
  }
}

export type SendingDomainStatus = 'verified' | 'pending' | 'failed' | 'not_found' | 'unknown'

/**
 * Whether Resend has a domain verified for sending — what the newsletter
 * sender settings page shows next to the From address. `unknown` when there
 * is no API key (local dev) or Resend cannot be reached; never throws.
 */
export async function sendingDomainStatus(domain: string): Promise<SendingDomainStatus> {
  if (!resendClient) return 'unknown'
  try {
    const { data, error } = await resendClient.domains.list()
    if (error || !data) return 'unknown'
    const found = data.data.find((d) => d.name.toLowerCase() === domain.toLowerCase())
    if (!found) return 'not_found'
    if (found.status === 'verified') return 'verified'
    if (found.status === 'failed' || found.status === 'temporary_failure') return 'failed'
    return 'pending'
  } catch {
    return 'unknown'
  }
}
