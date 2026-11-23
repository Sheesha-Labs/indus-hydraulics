/**
 * Board 77's states as data: the result types the sign-in server actions return, and every sentence
 * the cards show. Shared by the pages (server) and the forms (client); no server imports.
 *
 * Copy is #s77's, with these changes (each a recorded decision):
 * - Title "Indus Operations", not the board's "Indus Ops" (P01 sign-off).
 * - "Not invited" says "Ask the Owner", not a name, and echoes no email: the page is public and the
 *   refusal travels as a URL code, so it carries neither a name nor an address.
 * - "Wrong Google account" likewise names no address ("That Google account is a personal account…").
 * - Forgot password always shows the board's sentence; Google-only accounts get theirs by email.
 */
export type BannerTone = 'warn' | 'bad' | 'info' | 'ok'

export type AuthNotice = { tone: BannerTone; text: string; resetLink?: boolean }

/** Password step result (useActionState). */
export type PasswordFormState =
  | null
  | { status: 'invalid' | 'rate_limited' | 'no_second_factor' | 'missing' }
  | { status: 'locked'; minutes: number }

/** Two-factor step result. */
export type TwoFactorFormState = null | { status: 'wrong_code' | 'rate_limited' | 'missing' }

/** New password result. */
export type ResetFormState =
  | null
  | { status: 'password'; message: string }
  | { status: 'code' }
  | { status: 'locked'; minutes: number }

/** Accept invitation · Set a password (S03-T03): the policy's sentence when it refuses. */
export type InviteFormState = null | { status: 'password'; message: string }

/** Authenticator setup result: the backup codes, shown once. */
export type SetupFormState =
  | null
  | { status: 'wrong_code' | 'rate_limited' | 'expired' }
  | { status: 'done'; backupCodes: string[] }

export function minutesText(minutes: number): string {
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

export const TEXT = {
  invalid: "That email and password don't match.",
  missing: 'Enter your email and password.',
  rateLimited: 'Too many attempts from this network. Try again in 15 minutes.',
  noSecondFactor:
    'Password sign-in needs an authenticator app. Continue with Google, then set one up in Settings › Security.',
  locked: (minutes: number) =>
    `Too many attempts. Try again in ${minutesText(minutes)}, or reset your password.`,
  personalAccount:
    'That Google account is a personal account. Indus Operations only accepts your Indus Workspace account.',
  wrongDomain: (domain: string) =>
    `That Google account is not an @${domain} account. Indus Operations only accepts @${domain}.`,
  notInvited: 'That account has no access yet. Ask the Owner to invite you from Settings › Team.',
  emailUnverified: 'Google has not verified that email address. Use another account.',
  deactivated: 'This account is no longer active. Ask the Owner.',
  sessionEnded: (page: string) =>
    `Your session ended after 8 hours. Sign in again to return to ${page}.`,
  sessionRevoked: 'You were signed out from another device.',
  reauth: 'Sign in again to change your password. It keeps your account safe.',
  reauthTransfer: 'Sign in again to transfer ownership. It keeps your account safe.',
  ownershipTransferred: 'Ownership has moved. Sign in again to continue with your new role.',
  inviteMismatch:
    'That Google account is not the address the invitation was sent to. Use the invited account.',
  inviteInvalid: 'That invitation no longer works. Ask the Owner to send a new one.',
  expired: 'That sign-in took too long. Enter your password again.',
  passwordSaved:
    'Your new password is saved. Password sign-in also needs an authenticator app: continue with Google, then set one up in Settings › Security.',
  generic: 'Sign-in failed. Try again.',
  wrongCode: "That code didn't work. Check your authenticator app and try again.",
  wrongBackupCode: "That backup code didn't work. Each code works once.",
  codeRateLimited: 'Too many codes tried. Wait 15 minutes, then try again.',
  forgotSent: 'If that account exists, a link is on its way. It works for 30 minutes.',
} as const

/** The /sign-in banner for `?error=` / `?reason=` (Google refusals, proxy redirects, timeouts). */
export function signInNotice(
  query: { error?: string | undefined; reason?: string | undefined; minutes?: string | undefined },
  ctx: { domain: string; pageLabel: string }
): AuthNotice | null {
  switch (query.reason) {
    case 'session_ended':
      return { tone: 'info', text: TEXT.sessionEnded(ctx.pageLabel) }
    case 'session_revoked':
      return { tone: 'info', text: TEXT.sessionRevoked }
    case 'reauth':
      return { tone: 'info', text: TEXT.reauth }
    case 'reauth_transfer':
      return { tone: 'info', text: TEXT.reauthTransfer }
    case 'ownership_transferred':
      return { tone: 'info', text: TEXT.ownershipTransferred }
    case 'deactivated':
      return { tone: 'warn', text: TEXT.deactivated }
    case 'password_saved':
      return { tone: 'ok', text: TEXT.passwordSaved }
  }
  switch (query.error) {
    case undefined:
    case '':
      return null
    case 'personal_account':
      return { tone: 'warn', text: TEXT.personalAccount }
    case 'wrong_domain':
      return { tone: 'warn', text: TEXT.wrongDomain(ctx.domain) }
    case 'not_invited':
      return { tone: 'warn', text: TEXT.notInvited }
    case 'email_unverified':
      return { tone: 'warn', text: TEXT.emailUnverified }
    case 'deactivated':
      return { tone: 'warn', text: TEXT.deactivated }
    case 'invite_mismatch':
      return { tone: 'warn', text: TEXT.inviteMismatch }
    case 'invite_invalid':
      return { tone: 'warn', text: TEXT.inviteInvalid }
    case 'locked': {
      const n = Number.parseInt(query.minutes ?? '', 10)
      const minutes = Number.isFinite(n) && n > 0 && n <= 24 * 60 ? n : 15
      return { tone: 'bad', text: TEXT.locked(minutes), resetLink: true }
    }
    case 'expired':
      return { tone: 'info', text: TEXT.expired }
    case 'rate_limited':
      return { tone: 'bad', text: TEXT.codeRateLimited }
    default:
      return { tone: 'bad', text: TEXT.generic }
  }
}

/** Google refusals: the account picker is the way out, so the Google button says so. */
export function isGoogleRefusal(error: string | undefined): boolean {
  return (
    error === 'personal_account' ||
    error === 'wrong_domain' ||
    error === 'not_invited' ||
    error === 'email_unverified' ||
    error === 'deactivated' ||
    error === 'invite_mismatch'
  )
}

export function passwordNotice(state: PasswordFormState): AuthNotice | null {
  if (!state) return null
  switch (state.status) {
    case 'invalid':
      return { tone: 'bad', text: TEXT.invalid }
    case 'missing':
      return { tone: 'bad', text: TEXT.missing }
    case 'rate_limited':
      return { tone: 'bad', text: TEXT.rateLimited }
    case 'no_second_factor':
      return { tone: 'warn', text: TEXT.noSecondFactor }
    case 'locked':
      return { tone: 'bad', text: TEXT.locked(state.minutes), resetLink: true }
  }
}
