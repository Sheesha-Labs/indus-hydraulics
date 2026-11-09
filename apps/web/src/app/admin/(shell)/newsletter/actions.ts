'use server'

import { db } from '@indus/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { auth } from '../../../../lib/admin-auth'
import {
  addContact,
  describeImport,
  exportFileName,
  exportListCsv,
  exportSubscribersCsv,
  importContacts,
  removeContact,
  resendConfirmations,
  suppressionFor,
  unsubscribeContact,
  unsubscribeSubscriber,
  type ImportReport,
  type SubscriberFilters,
} from '../../../../lib/newsletter/admin'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

/**
 * Newsletter admin actions (Phase 2). Each checks the role, calls one
 * function in lib/newsletter/admin.ts, and revalidates the admin paths it
 * changed. Reads and hand edits: NEWSLETTER_WRITE. Imports, exports and
 * deletes — the actions that move personal data in bulk or destroy it:
 * NEWSLETTER_SEND.
 */

const SUBSCRIBERS_PATH = '/admin/newsletter/subscribers'
const LISTS_PATH = '/admin/newsletter/lists'

/** Known errors (auth, role, validation, P2002/P2025) as their typed result; anything else logged and answered generically. */
function failure(err: unknown, what: string): Result<never> {
  // Say the first problem in words; the forms here show one message line.
  if (err instanceof z.ZodError) return fail('VALIDATION', err.issues[0]?.message ?? 'Check the form.')
  try {
    return failFromError(err)
  } catch {
    console.error(`[newsletter-admin] ${what} failed`, err instanceof Error ? err.message : err)
    return fail('INTERNAL', `Could not ${what}. Try again.`)
  }
}

// ── Subscribers ────────────────────────────────────────────────────────

const filtersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'unsubscribed', 'bounced']).nullish(),
  q: z.string().max(200).nullish(),
  from: z.string().max(10).nullish(),
  to: z.string().max(10).nullish(),
})

export async function exportSubscribersAction(filters: SubscriberFilters): Promise<Result<{ csv: string; filename: string; rows: number }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const f = filtersSchema.parse(filters)
    const { csv, rows } = await exportSubscribersCsv(f)
    return ok({ csv, rows, filename: exportFileName(`newsletter-subscribers${f.status ? `-${f.status}` : ''}`) })
  } catch (err) {
    return failure(err, 'export the subscribers')
  }
}

export async function resendConfirmationsAction(ids: string[] | null): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const parsed = z.array(z.string().uuid()).max(500).nullable().parse(ids)
    const r = await resendConfirmations(parsed)
    revalidatePath(SUBSCRIBERS_PATH)
    if (r.sent === 0 && r.failed === 0) {
      return ok({ message: 'Nothing to send — everyone selected was mailed in the last 24 hours, has confirmed, or cannot be mailed.' })
    }
    const parts = [`${r.sent} confirmation email${r.sent === 1 ? '' : 's'} sent`]
    if (r.skipped) parts.push(`${r.skipped} skipped (mailed in the last 24 hours, confirmed, or cannot be mailed)`)
    if (r.failed) parts.push(`${r.failed} failed — try again later`)
    return ok({ message: `${parts.join(', ')}.` })
  } catch (err) {
    return failure(err, 're-send the confirmations')
  }
}

export async function unsubscribeSubscriberAction(id: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const done = await unsubscribeSubscriber(z.string().uuid().parse(id))
    revalidatePath(SUBSCRIBERS_PATH)
    return done
      ? ok({ message: 'Unsubscribed. They will not be mailed again, from the newsletter or any list.' })
      : fail('CONFLICT', 'Already unsubscribed.')
  } catch (err) {
    return failure(err, 'unsubscribe them')
  }
}

// ── Lists ──────────────────────────────────────────────────────────────

const listSchema = z.object({
  name: z.string().trim().min(1, 'Give the list a name.').max(120, 'Keep the name under 120 characters.'),
  description: z.string().trim().max(400, 'Keep the description under 400 characters.').default(''),
})

export async function createListAction(_prev: unknown, formData: FormData): Promise<Result<never>> {
  let id: string
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const data = listSchema.parse({ name: formData.get('name'), description: formData.get('description') ?? '' })
    const list = await db.newsletterList.create({ data: { ...data, createdById: session.user.id }, select: { id: true } })
    id = list.id
    revalidatePath(LISTS_PATH)
  } catch (err) {
    return failure(err, 'create the list')
  }
  redirect(`${LISTS_PATH}/${id}`)
}

export async function updateListAction(listId: string, _prev: unknown, formData: FormData): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const data = listSchema.parse({ name: formData.get('name'), description: formData.get('description') ?? '' })
    const r = await db.newsletterList.updateMany({ where: { id: listId }, data: { ...data, updatedAt: new Date() } })
    if (r.count === 0) return fail('NOT_FOUND', 'That list no longer exists.')
    revalidatePath(`${LISTS_PATH}/${listId}`)
    revalidatePath(LISTS_PATH)
    return ok({ message: 'Saved.' })
  } catch (err) {
    return failure(err, 'save the list')
  }
}

/** Deletes the list and every address on it. Suppressions stay. */
/** On success this redirects to the lists page, so it only ever returns a failure. */
export async function deleteListAction(listId: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const r = await db.newsletterList.deleteMany({ where: { id: listId } })
    if (r.count === 0) return fail('NOT_FOUND', 'That list no longer exists.')
    revalidatePath(LISTS_PATH)
  } catch (err) {
    return failure(err, 'delete the list')
  }
  redirect(LISTS_PATH)
}

export async function addContactAction(listId: string, _prev: unknown, formData: FormData): Promise<Result<{ message: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const outcome = await addContact(
      listId,
      { email: String(formData.get('email') ?? ''), name: String(formData.get('name') ?? '') },
      session.user.id,
    )
    switch (outcome) {
      case 'added':
        revalidatePath(`${LISTS_PATH}/${listId}`)
        revalidatePath(LISTS_PATH)
        return ok({ message: 'Added.' })
      case 'already_on_list':
        return fail('CONFLICT', 'That address is already on the list.')
      case 'suppressed':
        return fail(
          'PRECONDITION_FAILED',
          'That address unsubscribed or bounced before, so it cannot be added. They can sign up again on the site.',
        )
      case 'invalid':
        return fail('VALIDATION', 'Enter an email address.', { email: ['Enter an email address.'] })
      case 'no_list':
        return fail('NOT_FOUND', 'That list no longer exists.')
    }
  } catch (err) {
    return failure(err, 'add the address')
  }
}

export async function importContactsAction(input: {
  listId: string
  pairs: [string, string][]
  fileName: string
  consent: boolean
}): Promise<Result<{ message: string; report: ImportReport }>> {
  try {
    const session = requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const r = await importContacts({ ...input, staffId: session.user.id })
    if (r.status === 'error') return fail('VALIDATION', r.message)
    revalidatePath(`${LISTS_PATH}/${input.listId}`)
    revalidatePath(LISTS_PATH)
    return ok({ message: `${describeImport(r.report)}.`, report: r.report })
  } catch (err) {
    return failure(err, 'import the file')
  }
}

export async function unsubscribeContactAction(listId: string, contactId: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const done = await unsubscribeContact(listId, contactId)
    revalidatePath(`${LISTS_PATH}/${listId}`)
    return done
      ? ok({ message: 'Unsubscribed — they will not receive anything from any list or the newsletter.' })
      : fail('CONFLICT', 'Already unsubscribed.')
  } catch (err) {
    return failure(err, 'unsubscribe them')
  }
}

export async function removeContactAction(listId: string, contactId: string): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const done = await removeContact(listId, contactId)
    revalidatePath(`${LISTS_PATH}/${listId}`)
    revalidatePath(LISTS_PATH)
    return done ? ok({ message: 'Removed from the list.' }) : fail('NOT_FOUND', 'Already removed.')
  } catch (err) {
    return failure(err, 'remove the address')
  }
}

export async function exportListAction(listId: string): Promise<Result<{ csv: string; filename: string; rows: number }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_SEND)
    const r = await exportListCsv(listId)
    if (!r) return fail('NOT_FOUND', 'That list no longer exists.')
    return ok({ csv: r.csv, rows: r.rows, filename: exportFileName(r.name) })
  } catch (err) {
    return failure(err, 'export the list')
  }
}

// ── Suppressions ───────────────────────────────────────────────────────

export async function checkSuppressionAction(
  _prev: unknown,
  formData: FormData,
): Promise<Result<{ message: string }>> {
  try {
    requireRole(await auth(), ROLES.NEWSLETTER_WRITE)
    const email = String(formData.get('email') ?? '').slice(0, 254)
    if (!email.includes('@')) return fail('VALIDATION', 'Enter an email address.')
    const s = await suppressionFor(email)
    if (!s) return ok({ message: 'Not suppressed — this address can be mailed.' })
    const why = s.reason === 'complained' ? 'reported a newsletter as spam' : s.reason === 'bounced' ? 'bounced permanently' : 'unsubscribed'
    return ok({ message: `Suppressed since ${s.createdAt.toISOString().slice(0, 10)}: the address ${why}.` })
  } catch (err) {
    return failure(err, 'check the address')
  }
}
