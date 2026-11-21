/**
 * The control on Google sign-in (ADR-05). The `hd` URL parameter only hints the
 * account picker; the ID token's `hd` and `email_verified` claims decide.
 */
export type GoogleProfile = {
  email?: string | null
  email_verified?: boolean | null
  hd?: string | null
}

export type ProfileCheck =
  | { ok: true; email: string }
  | { ok: false; reason: 'personal_account' | 'wrong_domain' | 'email_unverified'; email: string }

export function checkGoogleProfile(profile: GoogleProfile, workspaceDomain: string): ProfileCheck {
  const email = (profile.email ?? '').trim().toLowerCase()
  if (profile.email_verified !== true) return { ok: false, reason: 'email_unverified', email }
  if (!profile.hd) return { ok: false, reason: 'personal_account', email }
  if (profile.hd.toLowerCase() !== workspaceDomain.toLowerCase()) {
    return { ok: false, reason: 'wrong_domain', email }
  }
  if (!email.endsWith('@' + workspaceDomain.toLowerCase())) {
    return { ok: false, reason: 'wrong_domain', email }
  }
  return { ok: true, email }
}
