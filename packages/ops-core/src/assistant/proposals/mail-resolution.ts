import { z } from 'zod'
import { proposalBase, storedOption } from './base'

/** The S05 Unsure items (#1 Classify, #2 Link): resolved in Mail's Unsure pile, not in Review. */
export const mailResolutionProposal = proposalBase.extend({
  kind: z.literal('mail_resolution'),
  options: z.array(storedOption).min(1).max(8),
})
export type MailResolutionProposal = z.infer<typeof mailResolutionProposal>
