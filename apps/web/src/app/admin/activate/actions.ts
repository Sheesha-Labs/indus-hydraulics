'use server'

import { db } from '@indus/db'
import { validateStaffPassword } from '@indus/domain'
import { hash } from '../../../lib/password'
import { loadActivationLink, normaliseEmail } from '../../../lib/staff-invitations'

export type ActivateState = { error?: string } | { ok: true; email: string } | null

/**
 * Consume an invitation or reset link and set the account's password.
 *
 * The token is re-validated here rather than trusted from the page that
 * rendered the form. The page's check happened at render time; the link could
 * have been consumed in another tab, or expired, in between. Skipping this is
 * the difference between single-use and single-use-most-of-the-time.
 */
export async function activateStaffAccount(
  _prev: ActivateState,
  formData: FormData,
): Promise<ActivateState> {
  const token = String(formData.get('token') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  const passwordError = validateStaffPassword(password, confirm)
  if (passwordError) return { error: passwordError }

  const { invitation, state } = await loadActivationLink(token)
  if (!state.usable || !invitation) {
    // Deliberately terse: the page already explained the specific reason when
    // it rendered. Repeating it here would be the only place a caller could
    // probe a token's state, so keep it uninformative.
    return { error: 'This link is no longer valid. Request a new one.' }
  }

  const email = normaliseEmail(invitation.email)
  const passwordHash = await hash(password)

  try {
    await db.$transaction(async (tx) => {
      // Mark consumed FIRST, conditioned on it still being unconsumed. If two
      // submissions race, the second updates zero rows and throws, so the
      // password is never written twice from one link.
      const consumed = await tx.staffInvitation.updateMany({
        where: { id: invitation.id, activatedAt: null },
        data: { activatedAt: new Date() },
      })
      if (consumed.count !== 1) throw new Error('LINK_ALREADY_CONSUMED')

      await tx.staffUser.upsert({
        where: { email },
        // An invite for an existing address behaves as a password set, which
        // is what an administrator re-inviting a locked-out colleague means.
        update: {
          passwordHash,
          isActive: true,
          failedSignInCount: 0,
          lockedUntil: null,
        },
        create: {
          email,
          name: invitation.name,
          role: invitation.role as never,
          passwordHash,
          isActive: true,
        },
      })

      // Any other outstanding link for this address is now stale — the
      // password it would have set has been superseded.
      await tx.staffInvitation.updateMany({
        where: { email, activatedAt: null, id: { not: invitation.id } },
        data: { activatedAt: new Date() },
      })
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'LINK_ALREADY_CONSUMED') {
      return { error: 'This link has just been used. Sign in with your new password.' }
    }
    console.error('[activate] failed', err)
    return { error: 'Could not set your password. Try again.' }
  }

  return { ok: true, email }
}

