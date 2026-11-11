'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'

import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'called', 'quoted', 'closed', 'spam']),
  notes: z.string().max(4000).optional(),
})

/** Move a call-back along — called, quoted, closed or spam — and keep a note. */
export async function updateCallbackLead(input: z.input<typeof schema>): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.RFQ_REVIEW)
    const { id, status, notes } = schema.parse(input)
    const found = await db.callbackLead.findUnique({ where: { id }, select: { id: true, assignedToId: true } })
    if (!found) return fail('NOT_FOUND', 'That call-back no longer exists.')
    await db.callbackLead.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes: notes.trim() || null } : {}),
        // Whoever first moves it on owns it, unless someone already does.
        ...(found.assignedToId ? {} : { assignedToId: session.user.id }),
      },
    })
    revalidatePath('/admin/enquiries')
    revalidatePath(`/admin/enquiries/callbacks/${id}`)
    return ok({ message: 'Saved.' })
  } catch (err) {
    return failFromError(err)
  }
}
