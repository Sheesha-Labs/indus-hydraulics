'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { setMailPipeline } from '../../../../../server/assistant/pipeline-switch'

/**
 * "Let the Assistant sort new mail" (S05-T09): the mail pipeline switch. Owner only; the setting's own
 * audit row is written by updateSetting. Turning it on sorts the unclassified backlog oldest first.
 */
export const setMailPipelineAction = defineAction({
  name: 'assistant.mailPipeline',
  schema: z.object({ enabled: z.boolean() }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await setMailPipeline(input.enabled, ctx.user, (work) => after(work))
    revalidatePath('/settings/mailboxes')
    return out
  },
})
