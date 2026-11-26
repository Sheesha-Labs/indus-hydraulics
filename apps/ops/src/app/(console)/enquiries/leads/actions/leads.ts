'use server'

import { opsDb } from '@indus/ops-db'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { SafeError } from '../../../../../lib/safe-message'
import { TX_OPTIONS } from '../../../../../lib/tx-options'
import { announceEnquiryCreated } from '../../../../../server/enquiry/created'
import { createLead } from '../../../../../server/lead/create'
import { convertLeadToEnquiry, UNCATEGORISED } from '../../../../../server/lead/convert'
import { importLeadsCsv } from '../../../../../server/lead/import-csv'
import {
  setLeadStage,
  updateLeadLineSpec,
  updateLeadNotes,
} from '../../../../../server/lead/update'

/**
 * Boards 03, 22 and 23 (S09-T05). Owner and Helper. Every change is logged; the stage goes through the lead
 * machine; converting is one transaction that returns the same enquiry when repeated.
 */
const roles = ['owner', 'helper'] as const
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

function refresh(ref?: string) {
  revalidatePath('/enquiries/leads')
  if (ref) revalidatePath(`/enquiries/leads/${ref}`, 'layout')
}

export const createLeadAction = defineAction({
  name: 'lead.create',
  schema: z.object({
    name: z.string().trim().min(1).max(160),
    companyId: z.uuid().optional(),
    companyName: z.string().trim().max(160).optional(),
    email: z.email().optional(),
    phone: z.string().trim().max(40).optional(),
    source: z.enum(['callback', 'website', 'email', 'manual', 'import']),
    title: z.string().trim().max(200).optional(),
    interest: z.string().trim().max(200).optional(),
    estValue: z
      .string()
      .regex(/^\d{1,14}(\.\d{1,4})?$/)
      .optional(),
    estCurrency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
    nextAction: z.string().trim().max(200).optional(),
    nextActionAt: day.optional(),
    ownerId: z.uuid().optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx(async (tx) => {
      if (input.ownerId) {
        const ok = await tx.user.findFirst({
          where: { id: input.ownerId, status: 'active' },
          select: { id: true },
        })
        if (!ok) throw new SafeError('Choose an active team member as owner.')
      }
      return createLead(
        tx,
        {
          ...input,
          estValue: input.estValue ?? null,
          estCurrency: input.estValue ? (input.estCurrency ?? 'USD') : null,
          nextActionAt: input.nextActionAt ? new Date(`${input.nextActionAt}T06:00:00.000Z`) : null,
        },
        ctx.user
      )
    })
    refresh()
    return out
  },
})

export const importLeadsCsvAction = defineAction({
  name: 'lead.import_csv',
  schema: z.object({ text: z.string().min(1).max(2_000_000) }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await importLeadsCsv(input.text, ctx.user)
    refresh()
    return out
  },
})

export const setLeadStageAction = defineAction({
  name: 'lead.stage',
  schema: z.object({
    leadId: z.uuid(),
    ref: z.string().regex(/^L-\d{4,}$/),
    version: z.number().int().min(0),
    to: z.enum(['new', 'contacted', 'qualified', 'dropped']),
  }),
  roles: [...roles],
  handler: async ({ ref, ...input }, ctx) => {
    const out = await ctx.withTx((tx) => setLeadStage(tx, input, ctx.user))
    refresh(ref)
    return out
  },
})

export const updateLeadLineSpecAction = defineAction({
  name: 'lead.line.spec',
  schema: z.object({
    lineId: z.uuid(),
    ref: z.string().regex(/^L-\d{4,}$/),
    version: z.number().int().min(0),
    specNotes: z.string().max(500).nullable(),
  }),
  roles: [...roles],
  handler: async ({ ref, ...input }, ctx) => {
    const out = await ctx.withTx((tx) => updateLeadLineSpec(tx, input, ctx.user))
    refresh(ref)
    return out
  },
})

export const updateLeadNotesAction = defineAction({
  name: 'lead.notes',
  schema: z.object({
    leadId: z.uuid(),
    ref: z.string().regex(/^L-\d{4,}$/),
    version: z.number().int().min(0),
    notes: z.string().max(4000).nullable(),
  }),
  roles: [...roles],
  handler: async ({ ref, ...input }, ctx) => {
    const out = await ctx.withTx((tx) => updateLeadNotes(tx, input, ctx.user))
    refresh(ref)
    return out
  },
})

export const convertLeadAction = defineAction({
  name: 'lead.convert',
  schema: z.object({
    leadId: z.uuid(),
    ref: z.string().regex(/^L-\d{4,}$/),
    clientRef: z.string().trim().max(120).nullable(),
    deadline: day.nullable(),
    ownerId: z.uuid(),
    categories: z
      .array(z.union([z.uuid(), z.literal(UNCATEGORISED)]))
      .min(1)
      .max(100),
    preallocate: z.boolean(),
  }),
  roles: [...roles],
  // Idempotent in the service (a converted lead returns its enquiry). Not an action-held transaction: the
  // follow-up events leave after the commit.
  handler: async ({ ref, ...input }, ctx) => {
    const out = await opsDb.$transaction(
      (tx) => convertLeadToEnquiry(tx, input, ctx.user),
      TX_OPTIONS
    )
    if (!out.replayed)
      after(() =>
        announceEnquiryCreated({
          enquiryId: out.enquiryId,
          ref: out.ref,
          ackSkipped: out.ackSkipped,
          requestedById: ctx.user.id,
        })
      )
    refresh(ref)
    revalidatePath('/enquiries')
    return { ref: out.ref, lines: out.lines, replayed: out.replayed }
  },
})
