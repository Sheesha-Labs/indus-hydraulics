/**
 * Rules for staff invitation and password-reset links.
 *
 * Deliberately pure: no imports, no database, no framework. The landing page,
 * the server action and the tests all judge a link through these same
 * functions, so a link cannot be usable in one place and dead in another.
 *
 * Invites and resets share one mechanism — an emailed, expiring, single-use
 * link ending at a set-your-password screen. Only the copy and the lifetime
 * differ, so only the copy and the lifetime branch on `purpose`.
 */

export type InvitationPurpose = 'invite' | 'reset'

/**
 * How long each kind of link lives.
 *
 * An invite has to survive someone getting round to it — a new colleague may
 * not read work email for days. A reset is issued in response to an immediate
 * request, so a long window is pure extra exposure; 60 minutes matches the
 * customer-side reset already in this codebase.
 */
export const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000
export const RESET_TTL_MS = 60 * 60 * 1000

export function ttlFor(purpose: InvitationPurpose): number {
  return purpose === 'invite' ? INVITE_TTL_MS : RESET_TTL_MS
}

/** Human-readable lifetime, for the email body. */
export function validityWindowFor(purpose: InvitationPurpose): string {
  return purpose === 'invite' ? '14 days' : '60 minutes'
}

export type LinkRow = {
  purpose: InvitationPurpose
  expiresAt: Date
  activatedAt: Date | null
}

export type LinkState =
  | { usable: true }
  | { usable: false; reason: 'unknown' | 'used' | 'expired' }

/**
 * The single place a link is judged.
 *
 * Order matters: "already used" is reported ahead of "expired" because it is
 * the more actionable message — an expired link can be reissued by the same
 * route, a used one usually means the person already has what they needed.
 */
export function linkState(row: LinkRow | null | undefined, nowMs: number): LinkState {
  if (!row) return { usable: false, reason: 'unknown' }
  if (row.activatedAt) return { usable: false, reason: 'used' }
  if (row.expiresAt.getTime() <= nowMs) return { usable: false, reason: 'expired' }
  return { usable: true }
}

/**
 * Why a link cannot be used, phrased for the person holding it.
 *
 * Takes the purpose so an expired reset is not described as an expired
 * invitation — the reference implementation this was ported from got that
 * wrong precisely because the purpose was not passed down.
 */
export function linkStateMessage(
  reason: 'unknown' | 'used' | 'expired',
  purpose: InvitationPurpose,
): string {
  const noun = purpose === 'invite' ? 'invitation' : 'password reset link'
  switch (reason) {
    case 'used':
      return `This ${noun} has already been used. Sign in with your password, or request a new link.`
    case 'expired':
      return `This ${noun} has expired. Ask an administrator to send you a new one.`
    case 'unknown':
      return `This ${noun} is not valid. Check you copied the whole link from your email.`
  }
}

export type ActivationCopy = {
  eyebrow: string
  heading: string
  intro: string
  submitLabel: string
}

/** Page copy for the set-your-password screen. */
export function activationCopy(purpose: InvitationPurpose, name: string): ActivationCopy {
  const first = name.trim().split(/\s+/)[0] || 'there'
  return purpose === 'invite'
    ? {
        eyebrow: 'Set up your account',
        heading: `Welcome, ${first}.`,
        intro: 'Choose a password to finish setting up your Indus Hydraulics staff account.',
        submitLabel: 'Create account',
      }
    : {
        eyebrow: 'New password',
        heading: `Set a new password, ${first}.`,
        intro: 'Choose a new password for your Indus Hydraulics staff account.',
        submitLabel: 'Update password',
      }
}

/** Minimum staff password length. Longer than the customer side — these accounts can price and email quotes. */
export const MIN_STAFF_PASSWORD_LENGTH = 12

/**
 * Password rule, shared by the client form and the server action so the two
 * can never disagree about what is acceptable.
 */
export function validateStaffPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_STAFF_PASSWORD_LENGTH) {
    return `Use at least ${MIN_STAFF_PASSWORD_LENGTH} characters.`
  }
  if (password !== confirm) return "Both passwords must match."
  return null
}
