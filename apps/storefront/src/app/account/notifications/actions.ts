'use server'

import { db } from '@indus/db'
import { auth } from '../../../lib/auth'
import { revalidatePath } from 'next/cache'

export async function markNotificationRead(id: string) {
  const session = await auth()
  if (!session) return

  await db.notification.updateMany({
    where: { id, contactId: session.user.id },
    data: { readAt: new Date() },
  })

  revalidatePath('/account')
}

export async function markAllRead() {
  const session = await auth()
  if (!session) return

  await db.notification.updateMany({
    where: { contactId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  })

  revalidatePath('/account')
}
