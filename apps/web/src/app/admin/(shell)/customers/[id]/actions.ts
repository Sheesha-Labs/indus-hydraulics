'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../../lib/result'

const Tier = z.enum(['bronze', 'silver', 'gold', 'platinum'])
const Status = z.enum(['prospect', 'active', 'at_risk', 'archived'])

const UpdateAccountMetaSchema = z.object({
  id: z.string().uuid(),
  tier: Tier,
  status: Status,
  assignedRepId: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  creditLimit: z.coerce.number().min(0).optional(),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).optional(),
})

export async function updateAccountMeta(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.ACCOUNT_WRITE)
    const parsed = UpdateAccountMetaSchema.parse({
      id: formData.get('id'),
      tier: formData.get('tier'),
      status: formData.get('status'),
      assignedRepId: formData.get('assignedRepId') ?? '',
      creditLimit: formData.get('creditLimit') || undefined,
      paymentTermsDays: formData.get('paymentTermsDays') || undefined,
    })

    const updateData: Record<string, unknown> = {
      tier: parsed.tier,
      status: parsed.status,
      assignedRepId: parsed.assignedRepId,
    }
    if (parsed.creditLimit !== undefined) updateData.creditLimit = parsed.creditLimit
    if (parsed.paymentTermsDays !== undefined) updateData.paymentTermsDays = parsed.paymentTermsDays

    await db.account.update({ where: { id: parsed.id }, data: updateData })

    revalidatePath(`/admin/customers/${parsed.id}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const AddActivityNoteSchema = z.object({
  accountId: z.string().uuid(),
  body: z.string().trim().min(1, 'Note cannot be empty').max(5000),
})

export async function addActivityNote(formData: FormData): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.ACCOUNT_WRITE)
    const parsed = AddActivityNoteSchema.parse({
      accountId: formData.get('accountId'),
      body: formData.get('body'),
    })

    await db.accountActivity.create({
      data: {
        accountId: parsed.accountId,
        actorType: 'staff',
        actorId: session.user.id,
        verb: 'staff_note',
        payload: { body: parsed.body },
      },
    })

    revalidatePath(`/admin/customers/${parsed.accountId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deactivateContact(contactId: string, accountId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.ACCOUNT_WRITE)
    z.string().uuid().parse(contactId)
    z.string().uuid().parse(accountId)
    await db.accountContact.update({ where: { id: contactId }, data: { isActive: false } })
    revalidatePath(`/admin/customers/${accountId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function reactivateContact(contactId: string, accountId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.ACCOUNT_WRITE)
    z.string().uuid().parse(contactId)
    z.string().uuid().parse(accountId)
    await db.accountContact.update({ where: { id: contactId }, data: { isActive: true } })
    revalidatePath(`/admin/customers/${accountId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function approveAddress(addressId: string, accountId: string): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.ACCOUNT_WRITE)
    z.string().uuid().parse(addressId)
    z.string().uuid().parse(accountId)
    await db.accountAddress.update({
      where: { id: addressId },
      data: { approvedAt: new Date(), approvedById: session.user.id },
    })
    revalidatePath(`/admin/customers/${accountId}`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
