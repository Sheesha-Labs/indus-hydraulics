'use server'

import { db } from '@indus/db'
import { linkOrigin } from '../../../lib/request-origin'
import { issueStaffLink, normaliseEmail } from '../../../lib/staff-invitations'
import type { ForgotState } from './copy'


export async function requestStaffPasswordReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = normaliseEmail(String(formData.get('email') ?? ''))
  if (!email || !email.includes('@')) return { error: 'Enter a valid email address.' }

  const staff = await db.staffUser.findUnique({
    where: { email },
    select: { id: true, name: true, role: true, isActive: true },
  })

  // Deactivated accounts get the same neutral answer as unknown ones. Telling
  // someone their account was suspended is information they should get from a
  // colleague, not from a login form.
  if (!staff || !staff.isActive) return { done: true }

  const result = await issueStaffLink({
    email,
    name: staff.name,
    role: staff.role,
    purpose: 'reset',
    baseUrl: linkOrigin(),
  })

  // A genuine send failure is a configuration problem the person cannot act
  // on, and saying "sent" would leave them waiting for nothing. Surface it
  // without revealing whether the account existed — this branch is only
  // reachable once we already know it does, so it leaks nothing new.
  if (result.status !== 'sent') {
    console.error('[forgot-password] link issue failed', result)
    return { error: 'We could not send the email just now. Try again shortly.' }
  }

  return { done: true }
}
