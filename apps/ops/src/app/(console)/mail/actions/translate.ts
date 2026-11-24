'use server'

import { z } from 'zod'
import { defineAction, SafeError } from '../../../../lib/define-action'
import { askForOpenCopy } from '../../../../server/mail/router'
import { TranslateError, translateMessage } from '../../../../server/mail/translate'

/**
 * Board 97: "English" on the Original / English toggle (mail.translate, Haiku, cached on the message), and
 * "Draft “Ask sender for an open copy”" when the router has not already asked (mail.askOpenCopy).
 */
export const translateAction = defineAction({
  name: 'mail.translate',
  schema: z.object({ messageId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input) => {
    try {
      const t = await translateMessage(input.messageId)
      return { english: t.english, languageName: t.languageName }
    } catch (e) {
      if (e instanceof TranslateError) throw new SafeError(e.message)
      throw e
    }
  },
})

export const askOpenCopyAction = defineAction({
  name: 'mail.askOpenCopy',
  schema: z.object({ messageId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input) => {
    const out = await askForOpenCopy(input.messageId)
    if (out === 'nothing') throw new SafeError('Nothing here is password-protected')
    if (out === 'failed')
      throw new SafeError('Could not ask the Assistant now. Try again in a minute.')
    return { queued: true }
  },
})
