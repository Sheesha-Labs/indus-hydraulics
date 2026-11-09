'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@indus/db'
import { renderCallbackConfirmation, renderCallbackSalesAlert, sendEmail } from '@indus/email'
import { loadEmailBranding } from '../lib/email-branding'
import { clientIp } from '../lib/request-origin'
import { OFFICES } from '../lib/site-locations'
import { deskStatus, dubaiNow, parseOpeningHours } from '../lib/opening-hours'
import { callbackCountries } from '../lib/callback/countries'
import {
  CALLBACK_CATEGORIES,
  CALLBACK_SURFACES,
  CALLBACK_TRIGGERS,
  DESCRIPTION_MAX,
  categoryLabel,
  displayPhone,
  toE164,
  validateCallbackFields,
  type CallbackFieldErrors,
} from '../lib/callback/rules'

/**
 * The call-back prompt's one server action (surfaces B, D and E all post
 * here). The handoff asks for `POST /api/callback`; this codebase routes
 * client mutations through Server Actions instead (CLAUDE.md §3.2), and the
 * response carries the same information: success with the desk state, field
 * errors, rate-limited, or failed.
 *
 * Order of work: bot floor → validation → rate limit → store → sales email →
 * visitor confirmation. The lead counts as received once EITHER the row or the
 * sales email lands; a failed sales email is retried by the hourly SentEmail
 * cron, and the row is there for the desk regardless.
 */

export type CallbackResult =
  | { success: true; data: { deskOpen: boolean; nextOpen: string | null } }
  | { success: false; error: 'invalid'; fieldErrors: CallbackFieldErrors }
  | { success: false; error: 'rate_limited' | 'failed' }

/** Requests per hashed IP. Generous for a buyer who corrects a typo, tight for a script. */
const LIMIT_PER_HOUR = 3
const LIMIT_PER_DAY = 10

/** Anything faster than this from open to submit is not a person. */
const MIN_ELAPSED_MS = 1500

const SURFACE_LABEL = { B: 'Split modal (desktop)', D: 'Corner card (desktop)', E: 'Mobile sheet' } as const
const TRIGGER_LABEL = {
  inactivity: 'inactivity',
  exit: 'exit intent',
  tab_return: 'returned to the tab',
  manual: 'opened manually (?cb=)',
} as const

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(4000)
    .transform((v) => v.replace(/<[^>]*>/g, '').slice(0, max).trim() || null)
    .nullable()
    .catch(null)

const Payload = z.object({
  surface: z.enum(CALLBACK_SURFACES),
  trigger: z.enum(CALLBACK_TRIGGERS),
  category: z
    .enum(CALLBACK_CATEGORIES.map((c) => c.value) as [string, ...string[]])
    .nullable()
    .catch(null),
  description: optionalText(DESCRIPTION_MAX),
  name: z.string().trim().max(200),
  email: z.string().trim().toLowerCase().max(254),
  phoneCountry: z.string().trim().toUpperCase().max(2),
  phone: z.string().trim().max(40),
  pageUrl: optionalText(500),
  pageTitle: optionalText(200),
  referrer: optionalText(500),
  market: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,60}$/)
    .nullable()
    .catch(null),
  utm_source: optionalText(120),
  utm_medium: optionalText(120),
  utm_campaign: optionalText(120),
  utm_term: optionalText(120),
  utm_content: optionalText(120),
  elapsedMs: z.coerce.number().catch(0),
})

function field(fd: FormData, key: string): string | null {
  const v = fd.get(key)
  return typeof v === 'string' ? v : null
}

/** Only our own pages are recorded as the page; anything else is dropped. */
function sameSitePath(url: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url, 'https://indushydraulics.com')
    return /(^|\.)indushydraulics\.com$|^localhost$|\.vercel\.app$/.test(u.hostname) ? u.toString() : null
  } catch {
    return null
  }
}

export async function requestCallback(fd: FormData): Promise<CallbackResult> {
  // Honeypot and timing: answered as a success, so a bot learns nothing and
  // no confirmation email goes to an address that is usually a stranger's.
  const honeypot = field(fd, 'website')
  const elapsedRaw = Number(field(fd, 'elapsedMs'))
  const desk = deskStatus(
    parseOpeningHours(OFFICES.find((o) => o.kind === 'hq')?.openingHours ?? []),
    dubaiNow(),
  )
  const accepted: CallbackResult = { success: true, data: { deskOpen: desk.open, nextOpen: desk.nextOpen } }
  if ((honeypot && honeypot.trim()) || !Number.isFinite(elapsedRaw) || elapsedRaw < MIN_ELAPSED_MS) return accepted

  const parsed = Payload.safeParse({
    surface: field(fd, 'surface'),
    trigger: field(fd, 'trigger'),
    category: field(fd, 'category'),
    description: field(fd, 'description'),
    name: field(fd, 'name') ?? '',
    email: field(fd, 'email') ?? '',
    phoneCountry: field(fd, 'phoneCountry') ?? '',
    phone: field(fd, 'phone') ?? '',
    pageUrl: field(fd, 'pageUrl'),
    pageTitle: field(fd, 'pageTitle'),
    referrer: field(fd, 'referrer'),
    market: field(fd, 'market'),
    utm_source: field(fd, 'utm_source'),
    utm_medium: field(fd, 'utm_medium'),
    utm_campaign: field(fd, 'utm_campaign'),
    utm_term: field(fd, 'utm_term'),
    utm_content: field(fd, 'utm_content'),
    elapsedMs: field(fd, 'elapsedMs'),
  })
  if (!parsed.success) return { success: false, error: 'failed' }
  const p = parsed.data

  // The dial code comes from our own list, never from the browser.
  const dial = callbackCountries().find(([iso]) => iso === p.phoneCountry)?.[1] ?? null
  const fieldErrors = validateCallbackFields({ name: p.name, email: p.email, dial: dial ?? '', phone: p.phone })
  const phoneE164 = dial ? toE164(dial, p.phone) : null
  if (Object.keys(fieldErrors).length > 0 || !dial || !phoneE164) {
    return { success: false, error: 'invalid', fieldErrors }
  }

  // Never the raw IP: the hash is enough to count a network's requests.
  let ipHash: string | null = null
  let userAgent: string | null = null
  try {
    const h = await headers()
    const ip = clientIp(h)
    if (ip !== 'unknown') ipHash = createHash('sha256').update(`callback:${ip}`).digest('hex')
    userAgent = h.get('user-agent')?.slice(0, 500) ?? null
  } catch {
    // Metadata is non-critical.
  }

  if (ipHash) {
    try {
      const now = Date.now()
      const [hour, day] = await Promise.all([
        db.callbackLead.count({ where: { ipHash, createdAt: { gte: new Date(now - 3_600_000) } } }),
        db.callbackLead.count({ where: { ipHash, createdAt: { gte: new Date(now - 86_400_000) } } }),
      ])
      if (hour >= LIMIT_PER_HOUR || day >= LIMIT_PER_DAY) return { success: false, error: 'rate_limited' }
    } catch (err) {
      // A failed count must not cost a real buyer the call-back.
      console.error('[requestCallback] rate-limit count failed', err)
    }
  }

  const name = p.name.replace(/\s+/g, ' ')
  const pageUrl = sameSitePath(p.pageUrl)
  const utmPairs = (
    [
      ['source', p.utm_source],
      ['medium', p.utm_medium],
      ['campaign', p.utm_campaign],
      ['term', p.utm_term],
      ['content', p.utm_content],
    ] as const
  ).filter(([, v]) => v)
  const utm = utmPairs.length > 0 ? utmPairs.map(([k, v]) => `${k}=${v}`).join(' · ') : null
  const catLabel = p.surface === 'B' ? categoryLabel(p.category) : null

  let stored = false
  try {
    await db.callbackLead.create({
      data: {
        name,
        email: p.email,
        phoneE164,
        phoneCountry: p.phoneCountry,
        category: p.surface === 'B' ? p.category : null,
        description: p.surface === 'B' ? p.description : null,
        surface: p.surface,
        trigger: p.trigger,
        pageUrl,
        pageTitle: p.pageTitle,
        referrer: p.referrer,
        market: p.market,
        utmSource: p.utm_source,
        utmMedium: p.utm_medium,
        utmCampaign: p.utm_campaign,
        utmTerm: p.utm_term,
        utmContent: p.utm_content,
        ipHash,
        userAgent,
        deskOpen: desk.open,
      },
    })
    stored = true
  } catch (err) {
    console.error('[requestCallback] insert failed', err)
  }

  const branding = await loadEmailBranding().catch(() => null)
  const hq = OFFICES.find((o) => o.kind === 'hq')
  const deskEmail = hq?.email ?? 'sales@indushydraulics.me'
  const deskPhone = hq?.telephone ?? '+971 52 2477942'
  let alerted = false
  if (branding) {
    const recipients = branding.internalAlertEmails.length > 0 ? branding.internalAlertEmails : [deskEmail]
    const alert = renderCallbackSalesAlert({
      name,
      email: p.email,
      phoneE164,
      categoryLabel: catLabel,
      description: p.surface === 'B' ? p.description : null,
      surfaceLabel: SURFACE_LABEL[p.surface],
      triggerLabel: TRIGGER_LABEL[p.trigger],
      pageUrl,
      pageTitle: p.pageTitle,
      market: p.market,
      referrer: p.referrer,
      utm,
      deskOpen: desk.open,
      branding,
    })
    const sent = await sendEmail({
      kind: 'callback_request',
      to: recipients,
      subject: alert.subject,
      html: alert.html,
      text: alert.text,
      fromEmail: branding.fromEmail,
      ...(branding.fromName ? { fromName: branding.fromName } : {}),
      replyTo: p.email,
    }).catch((err: unknown) => {
      console.error('[requestCallback] sales email threw', err)
      return null
    })
    // A failed send still writes a SentEmail row the retry cron picks up.
    alerted = sent !== null
  }

  if (!stored && !alerted) return { success: false, error: 'failed' }

  if (branding) {
    const confirmation = renderCallbackConfirmation({
      phoneDisplay: displayPhone(phoneE164, dial),
      categoryLabel: catLabel,
      deskOpen: desk.open,
      nextOpen: desk.nextOpen,
      deskPhone,
      deskEmail,
      branding,
    })
    await sendEmail({
      kind: 'callback_confirmation',
      to: [p.email],
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
      fromEmail: branding.fromEmail,
      ...(branding.fromName ? { fromName: branding.fromName } : {}),
      replyTo: deskEmail,
    }).catch((err: unknown) => console.error('[requestCallback] confirmation threw', err))
  }

  return accepted
}
