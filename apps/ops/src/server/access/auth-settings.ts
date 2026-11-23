import 'server-only'
import { getCompanyLegalName, getSetting } from '../settings/get'
import type { AuthSettings, SystemEmailSender } from '../settings/registry'

/**
 * Sign-in reads its configuration from the settings service (S03-T04): `auth` (lock after
 * lockAttempts failures for lockMinutes, invite and reset link lifetimes), `system_email.sender`
 * (C26) and the company legal name for the sign-in card. All three rows are seeded by migration
 * `…_ops_settings_defaults_seed.sql`; `auth` and `system_email.sender` carry
 * `signoffStatus = 'awaiting'` until the Owner signs them off. No value is hard-coded here.
 */
export type { AuthSettings, SystemEmailSender }

export function authSettings(): Promise<AuthSettings> {
  return getSetting('auth')
}

export function systemEmailSender(): Promise<SystemEmailSender> {
  return getSetting('system_email.sender')
}

/** The sign-in card's subtitle; empty while Setup 1 has not filled the legal name. */
export async function companyLegalName(): Promise<string> {
  return (await getCompanyLegalName()) ?? ''
}
