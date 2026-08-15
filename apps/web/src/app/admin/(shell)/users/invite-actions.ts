'use server'

import { db } from '@indus/db'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole, type StaffRole } from '../../../../lib/rbac'
import { issueStaffLink, normaliseEmail } from '../../../../lib/staff-invitations'

export type InviteState = { error?: string; warning?: string; ok?: string } | null

/** Absolute origin of the live request, so an invite sent from a preview deploy links back to it. */
async function requestOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'
}

/**
 * Invite a colleague to the staff admin.
 *
 * Any email domain is accepted — deliberately. Staff are not all on the
 * company domain (contractors, the owner's personal address), and a domain
 * allowlist would have blocked the second super-admin this system needs to
 * avoid a single point of lockout.
 *
 * The trade-off is real and worth stating: whoever holds the invited address
 * gets to set a password on a staff account. That is why this action requires
 * USERS_WRITE — super_admin only.
 */
export async function inviteStaffUser(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  let inviterId: string | null = null
  try {
    const session = requireRole(await auth(), ROLES.USERS_WRITE)
    inviterId = session.user.id
  } catch {
    return { error: 'You do not have permission to invite staff.' }
  }

  const email = normaliseEmail(String(formData.get('email') ?? ''))
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? '') as StaffRole

  if (!email || !email.includes('@')) return { error: 'Enter a valid email address.' }
  if (name.length < 2) return { error: 'Enter the person’s name.' }
  if (!(ROLES.ANY_STAFF as readonly string[]).includes(role)) return { error: 'Pick a role.' }

  const existing = await db.staffUser.findUnique({ where: { email }, select: { isActive: true } })
  if (existing?.isActive) {
    return { error: 'That address already has an active staff account.' }
  }

  const result = await issueStaffLink({
    email,
    name,
    role,
    purpose: 'invite',
    invitedById: inviterId,
    baseUrl: await requestOrigin(),
  })

  revalidatePath('/admin/users')

  if (result.status === 'email_failed') {
    // The link exists but nobody received it. Saying "invited" here would be a
    // lie the administrator only discovers when the colleague never appears.
    return {
      warning: `Invitation created, but the email could not be sent: ${result.message} You can resend it from this page.`,
    }
  }
  if (result.status === 'error') return { error: result.message }

  return { ok: `Invitation sent to ${email}.` }
}

/** Reissue a link, invalidating the previous one. */
export async function resendStaffInvite(invitationId: string): Promise<InviteState> {
  try {
    requireRole(await auth(), ROLES.USERS_WRITE)
  } catch {
    return { error: 'You do not have permission to do that.' }
  }

  const row = await db.staffInvitation.findUnique({
    where: { id: invitationId },
    select: { email: true, name: true, role: true, purpose: true },
  })
  if (!row) return { error: 'That invitation no longer exists.' }

  const result = await issueStaffLink({
    email: row.email,
    name: row.name,
    role: row.role,
    purpose: row.purpose,
    baseUrl: await requestOrigin(),
  })
  revalidatePath('/admin/users')

  if (result.status === 'sent') return { ok: `New link sent to ${row.email}.` }
  return { error: result.status === 'email_failed' ? result.message : result.message }
}

/** Withdraw an outstanding invitation. Deleting the row kills the link immediately. */
export async function revokeStaffInvite(invitationId: string): Promise<InviteState> {
  try {
    requireRole(await auth(), ROLES.USERS_WRITE)
  } catch {
    return { error: 'You do not have permission to do that.' }
  }
  await db.staffInvitation.deleteMany({ where: { id: invitationId, activatedAt: null } })
  revalidatePath('/admin/users')
  return { ok: 'Invitation revoked.' }
}
