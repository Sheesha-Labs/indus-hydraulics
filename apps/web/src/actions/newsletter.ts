'use server'

import { createHash } from 'node:crypto'
import { clientIp } from '../lib/request-origin'
import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@indus/db'

type Result = { success: true } | { success: false; error: string }

const NewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
  source: z.string().trim().max(64).optional().or(z.literal('')),
  // Honeypot: real browsers leave this blank. Bots fill every input.
  // Server-side check is intentionally generic — never tell the bot why
  // the submission was rejected.
  website: z.string().max(0).optional().or(z.literal('')),
})

export async function subscribeToNewsletter(formData: FormData): Promise<Result> {
  const parsed = NewsletterSchema.safeParse({
    email: formData.get('email'),
    source: formData.get('source') ?? '',
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { success: false, error: issue?.message ?? 'Invalid submission.' }
  }

  // Treat honeypot-tripped or any other validation miss as a silent success
  // from the client's perspective — never reveal the spam trap.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { success: true }
  }

  const { email } = parsed.data
  const source = parsed.data.source || 'homepage_footer'

  // Best-effort metadata. Never store raw IP.
  //
  // Reads through `clientIp` rather than the first XFF hop: that hop is
  // whatever the caller sent, so hashing it produced a fresh, meaningless
  // value per request — the opposite of what a dedupe hash is for.
  let ipHash: string | null = null
  let userAgent: string | null = null
  try {
    const h = await headers()
    const ip = clientIp(h)
    if (ip !== 'unknown') {
      ipHash = createHash('sha256').update(ip).digest('hex')
    }
    userAgent = h.get('user-agent')?.slice(0, 500) ?? null
  } catch {
    // headers() can throw in some edge cases; metadata is non-critical
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        source,
        ipHash,
        userAgent,
        status: 'active',
      },
      update: {
        // Re-subscribe path: unsubscribed users who opt in again come back
        // to active. Active users get the most recent source recorded so we
        // can see which CTA reactivated their intent.
        status: 'active',
        unsubscribedAt: null,
        source,
      },
    })
  } catch (err) {
    console.error('[subscribeToNewsletter] db error', err)
    return { success: false, error: 'Could not save your subscription. Try again in a moment.' }
  }

  return { success: true }
}
