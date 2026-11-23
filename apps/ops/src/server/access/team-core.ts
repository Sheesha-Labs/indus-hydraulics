/**
 * The pure rules behind Settings › Team (board 84, 84b; S03-T03): invite domains, invite states,
 * names and initials for a new person, the last-Owner sentence and the "who may sign in" decision.
 * No database, no Next: invites.ts, team.ts and auth.ts call these, and the tests pin them.
 */

export const DAY_MS = 24 * 60 * 60 * 1000

export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function domainOf(email: string): string {
  const at = email.lastIndexOf('@')
  return at < 0 ? '' : email.slice(at + 1).toLowerCase()
}

/**
 * "Invites must be @<domain> unless you override it." `override` is the Owner's explicit choice and
 * is recorded in auth_event (invite_domain_override); without it a foreign address is refused.
 */
export type DomainVerdict = 'workspace' | 'override' | 'refused'

export function inviteDomainVerdict(
  email: string,
  workspaceDomain: string,
  overrideDomain: boolean
): DomainVerdict {
  if (domainOf(email) === workspaceDomain.trim().toLowerCase()) return 'workspace'
  return overrideDomain ? 'override' : 'refused'
}

export type InviteRowLike = {
  expiresAt: Date
  acceptedAt: Date | null
  revokedAt: Date | null
}

export type InviteState = 'valid' | 'expired' | 'revoked' | 'used'

/** Used beats revoked beats expired: a link that worked once says so, whatever happened later. */
export function inviteState(row: InviteRowLike, now: Date): InviteState {
  if (row.acceptedAt) return 'used'
  if (row.revokedAt) return 'revoked'
  if (row.expiresAt.getTime() <= now.getTime()) return 'expired'
  return 'valid'
}

/** An invite made now lives `days` whole days (auth.inviteDays, default 7). */
export function inviteExpiry(now: Date, days: number): Date {
  return new Date(now.getTime() + days * DAY_MS)
}

/**
 * A name for someone known only by their address, until they sign in with Google (which gives
 * their name) or change it in Profile: `first.last@…` → "First Last".
 */
export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  const words = local
    .split(/[._+-]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)
  if (words.length === 0) return 'Helper'
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

/** "Owner Example" → "OE"; one word → its first two letters; at most three (the column). */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
}

/** Board 84b: the guard's sentence when a change would leave no active Owner. */
export function lastOwnerMessage(name: string): string {
  return `${name} is the only Owner. Transfer ownership first.`
}

/** Board 84b banner: the longer form on the team page. */
export function lastOwnerBanner(firstName: string): string {
  return `${firstName} is the only Owner. Transfer ownership to someone else first; a console without an Owner can’t approve quotations or payments.`
}

/**
 * Whether a sign-in may go on, from the user row alone (auth.ts signIn callback). Null: yes.
 * An invited (not yet accepted) user reads the same answer as an unknown address. A suspended or
 * removed account is told so only after Google proved the person owns the address.
 */
export type SignInRefusal = 'not_invited' | 'deactivated'

/** A Google sign-in that carried an invitation which could not be accepted (/sign-in?error=…). */
export type InviteSignInRefusal = 'invite_mismatch' | 'invite_invalid' | 'email_unverified'

export function signInRefusal(
  row: { status: 'invited' | 'active' | 'suspended' | 'removed' } | null,
  method: 'google' | 'password'
): SignInRefusal | null {
  if (row?.status === 'active') return null
  const ended = row !== null && (row.status === 'suspended' || row.status === 'removed')
  return ended && method === 'google' ? 'deactivated' : 'not_invited'
}

/**
 * Profile › Signature is plain text until S04 reads the Gmail signature (`user.signatureHtml`):
 * stored escaped, lines as <br>, and read back as the same text.
 */
export function signatureToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .split('\n')
    .join('<br>')
}

export function signatureToText(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
}

/** Remove-helper consequences (ConfirmDialog): the counts reassignOpenWork reports. */
export type OpenWork = { supplierRfqs: number; draftChasers: number }

function workCounts(work: OpenWork): string {
  const rfqs = `${work.supplierRfqs} supplier ${work.supplierRfqs === 1 ? 'RFQ' : 'RFQs'}`
  const chasers = `${work.draftChasers} draft ${work.draftChasers === 1 ? 'chaser' : 'chasers'}`
  return `${rfqs} and ${chasers}`
}

export function openWorkSentence(ownerFirstName: string, work: OpenWork): string {
  return `Their open work moves to ${ownerFirstName}: ${workCounts(work)}. Their log entries stay.`
}

/** The note under "What each role can do" (board 84). */
export function removalNote(
  ownerFirstName: string,
  helperFirstName: string,
  work: OpenWork
): string {
  return `Removing a helper reassigns their open work to ${ownerFirstName}: ${workCounts(work)} for ${helperFirstName} today. Their log entries stay.`
}
