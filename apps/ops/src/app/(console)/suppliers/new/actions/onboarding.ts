'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import {
  createDocumentRequest,
  revokeRequest,
} from '../../../../../server/directory/document-request'
import {
  createSupplierUpload,
  supplierFilePrefix,
} from '../../../../../server/directory/document-files'
import {
  companyStepSchema,
  contactStepSchema,
  createSupplierDraft,
  documentRecordSchema,
  recordSupplierDocument,
  updateSupplierDraft,
  upsertSupplierContact,
} from '../../../../../server/directory/onboarding'

/**
 * Board 50 (S10-T04): the company step (creates the draft supplier the first time), the three contacts, each of the
 * nine documents (status, expiry, file), and the document request with its secure link. Owner and Helper.
 */
const roles = ['owner', 'helper'] as const
const refresh = (id: string) => {
  revalidatePath(`/suppliers/new/${id}`, 'layout')
  revalidatePath('/suppliers')
}

export const saveCompanyStepAction = defineAction({
  name: 'supplier.onboarding.company',
  schema: z.object({
    supplierId: z.uuid().optional(),
    expectedVersion: z.number().int().optional(),
    company: companyStepSchema,
    contacts: z.array(contactStepSchema).max(6),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx(async (tx) => {
      const id = input.supplierId
        ? (await updateSupplierDraft(
            tx,
            input.supplierId,
            input.company,
            ctx.user,
            input.expectedVersion
          ),
          input.supplierId)
        : (await createSupplierDraft(tx, input.company, ctx.user)).id
      for (const c of input.contacts)
        if (c.email?.trim() || c.name?.trim()) await upsertSupplierContact(tx, id, c, ctx.user)
      return { id }
    })
    refresh(out.id)
    return out
  },
})

export const documentUploadSlotAction = defineAction({
  name: 'supplier.onboarding.upload_slot',
  schema: z.object({ supplierId: z.uuid(), name: z.string().max(200), size: z.number().int() }),
  roles: [...roles],
  handler: (input) =>
    createSupplierUpload(supplierFilePrefix(input.supplierId, 'documents'), {
      name: input.name,
      size: input.size,
    }),
})

export const recordDocumentAction = defineAction({
  name: 'supplier.onboarding.document',
  schema: z.object({ supplierId: z.uuid(), document: documentRecordSchema }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await recordSupplierDocument(input.supplierId, input.document, ctx.user)
    refresh(input.supplierId)
    return out
  },
})

export const sendDocumentRequestAction = defineAction({
  name: 'supplier.onboarding.request',
  schema: z.object({
    supplierId: z.uuid(),
    kinds: z.array(z.string().max(40)).min(1).max(9),
    contactId: z.uuid().optional(),
    remindersOn: z.boolean().default(true),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await createDocumentRequest(
      {
        supplierId: input.supplierId,
        contactId: input.contactId ?? null,
        kinds: input.kinds,
        remindersOn: input.remindersOn,
      },
      ctx.user
    )
    refresh(input.supplierId)
    return out
  },
})

export const revokeDocumentRequestAction = defineAction({
  name: 'supplier.onboarding.request.revoke',
  schema: z.object({ supplierId: z.uuid(), requestId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) => revokeRequest(tx, input.requestId, ctx.user))
    refresh(input.supplierId)
    return { ok: true }
  },
})
