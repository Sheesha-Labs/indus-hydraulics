import 'server-only'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as Sentry from '@sentry/nextjs'
import { Prisma, opsDb, type $Enums } from '@indus/ops-db'
import { Resend } from 'resend'
import { env, type OpsEnv } from '../../lib/env'
import { systemEmailSender } from '../access/auth-defaults'

/**
 * The minimal system-mail sender (ADR-07, C26): password reset, invitations, security notices.
 *
 * Every message is an `ops.outbound_email` row (channel `system`) with an idempotency key, so the
 * one-record-of-every-email rule holds before the queue exists. Auth mail is sent at once — the
 * 5-minute hold is for business sends (decision, S03-T01) — and moves onto `ops.mail.send` in S19.
 *
 * - The stored body has every string in `redactions` (the reset link, the token) replaced by
 *   "[link removed]": the row never holds a working credential.
 * - Outside production a recipient not on OPS_TEST_RECIPIENTS is not sent to; the row says
 *   `suppressed_preview`.
 * - OPS_E2E_MAIL_SINK (refused in production by env.ts) also writes the UNREDACTED message as JSON
 *   to that directory, so tests can follow the link.
 * - No key (RESEND_OPS_API_KEY unset) → the row says `failed` with reason `not_configured`.
 * - Links are built by the caller from NEXT_PUBLIC_OPS_BASE_URL (`opsUrl`), never a Host header.
 */
export type SystemEmailKind = Extract<
  $Enums.OutboundKind,
  'auth_password_reset' | 'auth_invite' | 'auth_security_notice'
>

export type SystemEmail = {
  kind: SystemEmailKind
  to: string
  subject: string
  html: string
  text: string
  /** Unique per logical send; a repeat returns the first row and sends nothing. */
  idempotencyKey: string
  /** Strings removed from the stored copy (links, tokens). */
  redactions?: string[]
}

export type SystemEmailResult = {
  id: string
  status: 'sent' | 'failed' | 'suppressed_preview' | 'duplicate'
}

export const REDACTED = '[link removed]'

export function redact(body: string, redactions: readonly string[] = []): string {
  let out = body
  // Longest first, so a token inside a link does not leave half a link behind.
  for (const secret of [...redactions].filter(Boolean).sort((a, b) => b.length - a.length)) {
    out = out.split(secret).join(REDACTED)
  }
  return out
}

/** Recipients allowed outside production (ADR-07): the comma list, lower-cased. */
export function testRecipients(e: Pick<OpsEnv, 'OPS_TEST_RECIPIENTS'>): Set<string> {
  return new Set(
    (e.OPS_TEST_RECIPIENTS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function mayDeliver(
  to: string,
  e: Pick<OpsEnv, 'APP_ENV' | 'OPS_TEST_RECIPIENTS'>
): boolean {
  return e.APP_ENV === 'production' || testRecipients(e).has(to.trim().toLowerCase())
}

/** An absolute link into Ops, from NEXT_PUBLIC_OPS_BASE_URL only. */
export function opsUrl(path: string, e: Pick<OpsEnv, 'NEXT_PUBLIC_OPS_BASE_URL'> = env()): string {
  const base = e.NEXT_PUBLIC_OPS_BASE_URL
  if (!base) throw new Error('NEXT_PUBLIC_OPS_BASE_URL is not set')
  return new URL(path, base).toString()
}

type Deliver = (input: {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
  text: string
  idempotencyKey: string
}) => Promise<{ id: string } | { error: string }>

function resendDeliver(apiKey: string): Deliver {
  const resend = new Resend(apiKey)
  return async (m) => {
    const { data, error } = await resend.emails.send(
      {
        from: m.from,
        to: [m.to],
        replyTo: m.replyTo,
        subject: m.subject,
        html: m.html,
        text: m.text,
        tags: [{ name: 'app', value: 'ops' }],
      },
      { idempotencyKey: m.idempotencyKey }
    )
    if (error || !data) return { error: error?.name ?? 'unknown' }
    return { id: data.id }
  }
}

async function writeSink(dir: string, id: string, message: SystemEmail, status: string) {
  await mkdir(dir, { recursive: true })
  const { redactions: _r, ...rest } = message
  await writeFile(
    join(dir, `${Date.now()}-${id}.json`),
    JSON.stringify({ id, status, ...rest }, null, 2)
  )
}

export async function sendSystemEmail(
  message: SystemEmail,
  deps: { env?: OpsEnv; deliver?: Deliver } = {}
): Promise<SystemEmailResult> {
  const e = deps.env ?? env()
  const to = message.to.trim().toLowerCase()
  const sender = await systemEmailSender()

  const existing = await opsDb.outboundEmail.findUnique({
    where: { idempotencyKey: message.idempotencyKey },
    select: { id: true },
  })
  if (existing) return { id: existing.id, status: 'duplicate' }

  const deliverable = mayDeliver(to, e)
  const row = await createRow(message, to, deliverable)
  if (!row) {
    // A concurrent call with the same key won the insert: it sends, this one does not.
    const first = await opsDb.outboundEmail.findUniqueOrThrow({
      where: { idempotencyKey: message.idempotencyKey },
      select: { id: true },
    })
    return { id: first.id, status: 'duplicate' }
  }
  return finish(message, to, row.id, deliverable, e, sender, deps.deliver)
}

async function createRow(message: SystemEmail, to: string, deliverable: boolean) {
  try {
    return await opsDb.outboundEmail.create({
      data: {
        channel: 'system',
        kind: message.kind,
        toAddresses: [to],
        ccAddresses: [],
        bccAddresses: [],
        subject: message.subject,
        bodyHtml: redact(message.html, message.redactions),
        bodyText: redact(message.text, message.redactions),
        status: deliverable ? 'sending' : 'suppressed_preview',
        idempotencyKey: message.idempotencyKey,
      },
      select: { id: true },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return null
    throw error
  }
}

async function finish(
  message: SystemEmail,
  to: string,
  rowId: string,
  deliverable: boolean,
  e: OpsEnv,
  sender: { from: string; replyTo: string },
  injected: Deliver | undefined
): Promise<SystemEmailResult> {
  const row = { id: rowId }
  let status: SystemEmailResult['status'] = 'suppressed_preview'
  if (deliverable) {
    const deliver = injected ?? (e.RESEND_OPS_API_KEY ? resendDeliver(e.RESEND_OPS_API_KEY) : null)
    let outcome: { id: string } | { error: string }
    try {
      outcome = deliver
        ? await deliver({
            from: sender.from,
            replyTo: sender.replyTo,
            to,
            subject: message.subject,
            html: message.html,
            text: message.text,
            idempotencyKey: message.idempotencyKey,
          })
        : { error: 'not_configured' }
    } catch (error) {
      // The provider's error may echo the message; only its name leaves this function.
      Sentry.captureException(new Error(`system email ${message.kind} failed`), {
        tags: { outbound_email: row.id },
      })
      outcome = { error: error instanceof Error ? error.name : 'unknown' }
    }
    if ('id' in outcome) {
      status = 'sent'
      await opsDb.outboundEmail.update({
        where: { id: row.id },
        data: { status: 'sent', sentAt: new Date(), providerMessageId: outcome.id },
      })
    } else {
      status = 'failed'
      await opsDb.outboundEmail.update({
        where: { id: row.id },
        data: { status: 'failed', failureReason: outcome.error.slice(0, 120) },
      })
    }
  }

  if (e.OPS_E2E_MAIL_SINK && e.APP_ENV !== 'production') {
    await writeSink(e.OPS_E2E_MAIL_SINK, row.id, { ...message, to }, status)
  }
  return { id: row.id, status }
}
