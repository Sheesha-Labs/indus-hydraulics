/**
 * TODO(S03-T04): temporary home of the sign-in defaults until the settings service lands. The
 * orchestrator replaces this module with `getSetting('auth')`, `getSetting('system_email.sender')`
 * and `getSetting('company.profile')`, whose rows are seeded with `signoffStatus = 'awaiting'`
 * (P01 "Needs sign-off": lock after 5 attempts for 15 minutes, invite expiry 7 days, reset link
 * 30 minutes; C26 sender). Nothing else may hard-code these values: read them through the three
 * functions below so the swap is one file.
 */
export type AuthSettings = {
  /** Failed attempts (password or second factor) before the account locks. */
  lockAttempts: number
  /** How long a lock lasts. */
  lockMinutes: number
  /** How long an invitation link works (S03-T03). */
  inviteDays: number
  /** How long a password-reset link works. */
  resetMinutes: number
}

export type SystemEmailSender = {
  from: string
  replyTo: string
}

const AUTH_DEFAULTS: AuthSettings = {
  lockAttempts: 5,
  lockMinutes: 15,
  inviteDays: 7,
  resetMinutes: 30,
}

/** C26, awaiting sign-off: Resend from the verified .com domain, replies go to sales@. */
const SYSTEM_EMAIL_SENDER: SystemEmailSender = {
  from: 'Indus Operations <no-reply@indushydraulics.com>',
  replyTo: 'sales@indushydraulics.me',
}

/** TODO(S03-T04): `getSetting('auth')`. */
export async function authSettings(): Promise<AuthSettings> {
  return AUTH_DEFAULTS
}

/** TODO(S03-T04): `getSetting('system_email.sender')`. */
export async function systemEmailSender(): Promise<SystemEmailSender> {
  return SYSTEM_EMAIL_SENDER
}

/**
 * TODO(S03-T04): `getSetting('company.profile').legalName`, the sign-in card's subtitle. Until the
 * settings service exists it is empty and the card shows the title alone.
 */
export async function companyLegalName(): Promise<string> {
  return ''
}
