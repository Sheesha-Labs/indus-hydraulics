'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { initialsOf, signatureToHtml } from '../../../../../server/access/team-core'

/**
 * Settings › Team #profile (board 84, S03-T03): the signed-in person's own name, phone and signature.
 * Self only: the row is always the session's user, never an id from input. The signature is plain
 * text until S04 reads it from Gmail.
 */
export const updateProfileAction = defineAction({
  name: 'profile.update',
  schema: z.object({
    name: z.string().trim().min(1, 'Enter your name.').max(80),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[+0-9 ()-]*$/, 'Use digits, spaces and + ( ) - only.'),
    signature: z.string().max(2000),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) =>
      tx.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          initials: initialsOf(input.name),
          phone: input.phone || null,
          signatureHtml: input.signature.trim() ? signatureToHtml(input.signature) : null,
        },
      })
    )
    revalidatePath('/settings/team')
    return { name: input.name }
  },
})
