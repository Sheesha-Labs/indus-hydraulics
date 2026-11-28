'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import {
  archiveOwnBankAccount,
  bankAccountSchema,
  confirmBankBlock,
  createEstimateUpload,
  parseZohoEstimateBankBlock,
  saveOwnBankAccount,
} from '../../../../../server/company/bank'
import {
  archiveCompanyDocument,
  companyDocSchema,
  createCompanyDocUpload,
  saveCompanyDocument,
} from '../../../../../server/company/documents'

/**
 * Board 213 actions (S11-T07). Owner only: the bank block and Indus's documents are the Owner's. The bank
 * service checks the role again, so a call from anywhere else is refused too.
 */
const PATH = '/settings/documents'
const roles = ['owner'] as const
const upload = z.object({ key: z.string().max(300), filename: z.string().min(1).max(200) })
const done = <T>(v: T) => {
  revalidatePath(PATH)
  return v
}

export const companyDocSlotAction = defineAction({
  name: 'company.document.slot',
  schema: z.object({ name: z.string().max(200), size: z.number().int() }),
  roles: [...roles],
  handler: (input) => createCompanyDocUpload(input),
})

export const saveCompanyDocumentAction = defineAction({
  name: 'company.document.save',
  schema: companyDocSchema.extend({ upload: upload.nullable(), replaces: z.uuid().nullable() }),
  roles: [...roles],
  handler: async (input, ctx) => done(await saveCompanyDocument(input, ctx.user)),
})

export const archiveCompanyDocumentAction = defineAction({
  name: 'company.document.archive',
  schema: z.object({ id: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => archiveCompanyDocument(tx, input.id, ctx.user))),
})

export const estimateSlotAction = defineAction({
  name: 'company.bank.estimate_slot',
  schema: z.object({ name: z.string().max(200), size: z.number().int() }),
  roles: [...roles],
  handler: (input) => createEstimateUpload(input),
})

export const parseEstimateAction = defineAction({
  name: 'company.bank.parse',
  schema: upload,
  roles: [...roles],
  handler: (input, ctx) => parseZohoEstimateBankBlock(input, ctx.user),
})

export const saveBankAccountAction = defineAction({
  name: 'company.bank.save',
  schema: bankAccountSchema.extend({
    id: z.uuid().nullable(),
    sourceFileId: z.uuid().nullable(),
  }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => saveOwnBankAccount(tx, input, ctx.user))),
})

export const confirmBankBlockAction = defineAction({
  name: 'company.bank.confirm',
  schema: z.object({ accountId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => confirmBankBlock(tx, input.accountId, ctx.user))),
})

export const archiveBankAccountAction = defineAction({
  name: 'company.bank.archive',
  schema: z.object({ accountId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => archiveOwnBankAccount(tx, input.accountId, ctx.user))),
})
