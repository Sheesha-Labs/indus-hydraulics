import 'server-only'
import { db } from '@indus/db'
import {
  DEFAULT_FROM_EMAIL,
  DEFAULT_REPLY_TO,
  type InvitationPurpose,
  type LinkState,
  linkState,
  ttlFor,
  validityWindowFor,
} from '@indus/domain'
import { renderStaffInvitation, sendEmail } from '@indus/email'
import crypto from 'node:crypto'
import { loadEmailBranding } from './email-branding'

/**
 * Issuing and consuming staff invitation / password-reset links.
 *
 * ── Token handling ─────────────────────────────────────────────────────────
 *
 * The raw token exists in exactly two places: the email, and the URL the
 * recipient clicks. Only sha256(token) is written to the database, so reading
 * the table — via a backup, a logged query, a leaked connection string —
 * yields nothing usable. Lookup is by hash, which is a single indexed read
 * rather than a scan.
 *
 * ── Single use ─────────────────────────────────────────────────────────────
 *
 * `activatedAt` is the marker, and it is set inside the same transaction that
 * writes the password. A link cannot be half-consumed.
 */

/** 32 bytes = 256 bits. Hex rather than base64url so it survives careless copy-paste out of any mail client. */
function generateToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex')
  return { raw, hash: hashToken(raw) }
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

/** Normalised once, here, so lookups and uniqueness never disagree over casing. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type IssueResult =
  | { status: 'sent' }
  | { status: 'email_failed'; message: string }
  | { status: 'error'; message: string }

type IssueInput = {
  email: string
  name: string
  role: string
  purpose: InvitationPurpose
  invitedById?: string | null
  /** Origin of the live request, so links work on preview deploys too. */
  baseUrl: string
}

/**
 * Create a link and email it.
 *
 * Any outstanding link of the same purpose for the same address is deleted
 * first, so a person never holds two live links and an old email cannot be
 * used after a newer one is sent. Scoped by purpose deliberately: issuing an
 * invite must not silently destroy someone's in-flight password reset.
 */
export async function issueStaffLink(input: IssueInput): Promise<IssueResult> {
  const email = normaliseEmail(input.email)
  const { raw, hash } = generateToken()
  const expiresAt = new Date(Date.now() + ttlFor(input.purpose))

  try {
    await db.$transaction(async (tx) => {
      await tx.staffInvitation.deleteMany({
        where: { email, purpose: input.purpose, activatedAt: null },
      })
      await tx.staffInvitation.create({
        data: {
          email,
          name: input.name.trim(),
          role: input.role as never,
          purpose: input.purpose,
          tokenHash: hash,
          invitedById: input.invitedById ?? null,
          expiresAt,
        },
      })
    })
  } catch (err) {
    console.error('[staff-invitations] failed to create link', err)
    return { status: 'error', message: 'Could not create the link. Try again.' }
  }

  const branding = await loadEmailBranding()
  const activateUrl = `${input.baseUrl.replace(/\/$/, '')}/admin/activate?token=${encodeURIComponent(raw)}`

  const content = renderStaffInvitation({
    recipientName: input.name,
    purpose: input.purpose,
    activateUrl,
    validityWindow: validityWindowFor(input.purpose),
    branding,
  })

  const result = await sendEmail({
    kind: input.purpose === 'invite' ? 'staff_invitation' : 'staff_password_reset',
    to: [email],
    subject: content.subject,
    html: content.html,
    fromEmail: branding.fromEmail || DEFAULT_FROM_EMAIL,
    ...(branding.fromName ? { fromName: branding.fromName } : {}),
    replyTo: branding.replyTo || DEFAULT_REPLY_TO,
  })

  // A link that exists but was never delivered is worse than no link, because
  // the UI would otherwise claim success. Report it distinctly.
  if (!result.ok) {
    return {
      status: 'email_failed',
      message: result.error ?? 'The link was created but the email could not be sent.',
    }
  }
  return { status: 'sent' }
}

export type LookupResult = {
  id: string
  email: string
  name: string
  role: string
  purpose: InvitationPurpose
  expiresAt: Date
  activatedAt: Date | null
}

/**
 * Load a link and judge it in one step.
 *
 * The clock is read here rather than at the call site: a Server Component
 * must not call `Date.now()` during render (React's purity rule), and having
 * one loader also means the page and the server action cannot disagree about
 * what "usable" meant.
 */
export async function loadActivationLink(
  rawToken: string,
): Promise<{ invitation: LookupResult | null; state: LinkState }> {
  const invitation = await findByToken(rawToken)
  return { invitation, state: linkState(invitation, Date.now()) }
}

/** Find a link by its raw token. Returns null for anything unrecognised. */
export async function findByToken(rawToken: string): Promise<LookupResult | null> {
  if (!rawToken || rawToken.length < 32) return null
  const row = await db.staffInvitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      purpose: true,
      expiresAt: true,
      activatedAt: true,
    },
  })
  return row as LookupResult | null
}
