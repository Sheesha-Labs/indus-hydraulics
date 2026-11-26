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
    /** S08-T07 (board 93): how a date in the email was worked out, shown beside the card ("Why 26 Sep"). */
    whyDate: z
      .object({
        title: z.string().max(40),
        steps: z
          .array(
            z.object({
              label: z.string().max(120),
              value: z.string().max(60),
              note: z.string().max(160).optional(),
            })
          )
          .max(8),
      })
      .optional(),
    /**
     * S09-T06 (board 168): a required choice on the card (the regret reason), recorded as the chosen option and
     * read by the effect. `value` is the suggestion, preselected.
     */
    reasonChips: z
      .object({
        label: z.string().max(60),
        options: z
          .array(z.object({ value: z.string().max(40), label: z.string().max(60) }))
          .min(1)
          .max(8),
        value: z.string().max(40).optional(),
      })
      .optional(),
    /**
     * S09-T06 (board 168 "Include the 'glad to quote on' line"): a switch on the body. Off sends `textOff`
     * instead of the body, recorded as an edit.
     */
    toggle: z
      .object({
        name: z.string().max(40),
        label: z.string().max(160),
        defaultOn: z.boolean(),
        textOff: z.string().max(50_000),
      })
      .optional(),
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
