import { z } from 'zod'
import { proposalBase } from './base'

/**
 * An internal action shown in the log and Why? (classify, link, labels, out-of-office facts): no preview to
 * approve. A preview, when present, is kept as untyped detail for the log's "inputs and output".
 */
export const noticeProposal = proposalBase.extend({
  kind: z.literal('notice'),
  detail: z.unknown().optional(),
})
export type NoticeProposal = z.infer<typeof noticeProposal>
