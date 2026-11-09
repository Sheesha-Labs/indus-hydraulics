import { MARKETING_DOMAIN, assertMarketingSender } from '@indus/domain'
import { z } from 'zod'

/**
 * Who campaigns come from. Staff choose the From name, the part of the From
 * address before the @, and the Reply-To; the From DOMAIN is always the
 * newsletter subdomain — never the domain quotes and RFQs depend on (plan
 * D1). Ported in spirit from Bazar's lib/newsletter/sender.ts, which let the
 * whole address be typed and checked the domain after.
 */

export type NewsletterSenderSettings = { fromName: string; fromLocal: string; replyTo: string }
export type NewsletterSender = { fromEmail: string; fromName: string; replyTo: string }

export const DEFAULT_SENDER_SETTINGS: NewsletterSenderSettings = {
  fromName: 'Indus Hydraulics',
  fromLocal: 'newsletter',
  replyTo: 'sales@indushydraulics.me',
}

export const senderSettingsSchema = z.object({
  fromName: z
    .string()
    .trim()
    .min(1, 'Give the sender a name.')
    .max(80, 'Keep the name under 80 characters.')
    // A From display name with these breaks the header or invites spoofing.
    .refine((v) => !/[<>"@\r\n]/.test(v), 'The name cannot contain < > " @ or line breaks.'),
  fromLocal: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9._-]{0,63}$/, 'Letters, numbers, dots, dashes and underscores only, starting with a letter or number.'),
  replyTo: z.string().trim().toLowerCase().email('Enter the address replies should go to.').max(254),
})

/** Settings → the address campaigns send from. Throws if it is not on the newsletter subdomain. */
export function resolveSender(s: NewsletterSenderSettings): NewsletterSender {
  const fromEmail = `${s.fromLocal}@${MARKETING_DOMAIN}`
  assertMarketingSender(fromEmail)
  return { fromEmail, fromName: s.fromName, replyTo: s.replyTo }
}

/** `Name <address>` as it will show in an inbox. */
export function formatFrom(sender: NewsletterSender): string {
  return `${sender.fromName} <${sender.fromEmail}>`
}
