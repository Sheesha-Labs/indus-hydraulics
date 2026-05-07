import type { Metadata } from 'next'
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@indus/db'
import ProfileFormClient from './ProfileFormClient'

export const metadata: Metadata = { title: 'Account profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?next=/account/profile')
  }

  const contact = await db.accountContact.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      ssoProvider: true,
      passwordHash: true,
      lastSignInAt: true,
      role: true,
      pendingEmailNew: true,
      pendingEmailExpiresAt: true,
    },
  })

  if (!contact) redirect('/sign-in?next=/account/profile')

  // Don't expose the hash to the client — only the boolean of "do they have one".
  const hasPassword = Boolean(contact.passwordHash)

  // Treat an expired pending change as no pending change — the user can
  // request a new one. The cancel-on-confirm cleanup handles this in code,
  // but rendering treats it the same way as a safety net.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const pendingActive =
    contact.pendingEmailNew &&
    contact.pendingEmailExpiresAt &&
    contact.pendingEmailExpiresAt.getTime() > now

  return (
    <ProfileFormClient
      initial={{
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        ssoProvider: contact.ssoProvider,
        hasPassword,
        lastSignInAt: contact.lastSignInAt ? contact.lastSignInAt.toISOString() : null,
        role: contact.role,
        pendingEmail: pendingActive
          ? {
              newEmail: contact.pendingEmailNew!,
              expiresAt: contact.pendingEmailExpiresAt!.toISOString(),
            }
          : null,
      }}
    />
  )
}
