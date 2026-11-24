import { z } from 'zod'
import { proposalBase } from './base'

/**
 * An email a person approves (S06-T01): ask_open_copy, resend_alternate_contact, manual_reply,
 * correction_email, and later RFQs and quotations. `preview` holds the email as it would go; Edit changes
 * to, cc, subject and body into `effectivePayload`, never the stored proposal.
 */
export const emailPreview = z
  .object({
    mailbox: z.string().min(3).max(254).nullable(),
    to: z.array(z.string().min(3).max(254)).min(1).max(20),
    cc: z.array(z.string().min(3).max(254)).max(20).optional(),
    subject: z.string().max(300),
    /** Sanitised HTML (manual_reply), or plain text (drafted notes). */
    html: z.string().max(200_000).optional(),
    text: z.string().max(50_000).optional(),
    /** The earlier email the body quotes (resend_alternate_contact). */
    quotedOutboundId: z.uuid().optional(),
  })
  .refine((p) => p.html !== undefined || p.text !== undefined, { message: 'An email needs a body' })
export type EmailPreview = z.infer<typeof emailPreview>

export const EMAIL_EDITABLE = ['to', 'cc', 'subject', 'body'] as const
export type EmailEditableField = (typeof EMAIL_EDITABLE)[number]

export const emailProposal = proposalBase.extend({
  kind: z.literal('email'),
  email: emailPreview,
})
export type EmailProposal = z.infer<typeof emailProposal> & {
  editable: readonly EmailEditableField[]
}

/** A person's edit of an email proposal (Edit, then Save and approve): only the editable fields. */
export const emailEdit = z
  .object({
    to: z.array(z.email()).min(1).max(20).optional(),
    cc: z.array(z.email()).max(20).optional(),
    subject: z.string().trim().min(1).max(300).optional(),
    body: z.string().trim().min(1).max(50_000).optional(),
  })
  .strict()
export type EmailEdit = z.infer<typeof emailEdit>
