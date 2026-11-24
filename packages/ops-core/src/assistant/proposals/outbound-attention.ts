import { z } from 'zod'
import { proposalBase } from './base'

/**
 * A failed or unknown send with no action of its own (S06, coverage gap G6): what happened and what a person
 * can do. Retry is a person's click (never automatic); Copy opens the text; Mark sent records a send found in
 * Gmail; Fix mailbox goes to Settings.
 */
export const outboundAttentionPreview = z.object({
  outboundId: z.uuid(),
  failure: z.string().min(1).max(400),
  actions: z
    .array(z.enum(['retry', 'copy', 'mark_sent', 'fix_mailbox']))
    .min(1)
    .max(4),
})
export const outboundAttentionProposal = proposalBase.extend({
  kind: z.literal('outbound_attention'),
  attention: outboundAttentionPreview,
})
export type OutboundAttentionProposal = z.infer<typeof outboundAttentionProposal>
