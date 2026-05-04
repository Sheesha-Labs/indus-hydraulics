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
    },
  })

  if (!contact) redirect('/sign-in?next=/account/profile')

  // Don't expose the hash to the client — only the boolean of "do they have one".
  const hasPassword = Boolean(contact.passwordHash)

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
      }}
    />
  )
}
