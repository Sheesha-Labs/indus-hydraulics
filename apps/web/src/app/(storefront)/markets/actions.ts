'use server'

import { z } from 'zod'
import { db, nextRfqCode } from '@indus/db'
import {
  buildApplicationContext,
  enquiryUrgency,
  marketBySlug,
  marketEnquirySubject,
  releasedMarketPage,
  normaliseIncoterm,
  normaliseNeededBy,
  signQuoteAccessToken,
  splitContactName,
} from '@indus/domain'
import { resolveOrCreateAnonymousContact, sendRfqEmails } from '../../../lib/rfq-intake'
import { STORAGE_BUCKETS } from '../../../lib/supabase-admin'

/**
 * Lead capture on the export-market pages and on the `/markets` index.
 *
 * Three forms feed this, and they are NOT redundant. The mid-page quote form
 * catches a reader who has just seen the catalogue and knows what they want;
 * the closing card on a market page catches one who scrolled to the bottom
 * undecided; the index form catches someone whose destination has no page at
 * all. They post to the same action with different `source` values so the
 * split is measurable, and so a change in the ratio is a signal about the
 * pages rather than noise.
 *
 * THE INDEX FORM HAS NO MARKET. Its destination field is free text — the whole
 * reason it exists is destinations outside the 126 — so it sends
 * `destinationCountry` instead of `marketSlug` and the enquiry is recorded
 * against a name the buyer typed. `buildApplicationContext` flags that in the
 * first two lines so the desk confirms the lane before quoting one.
 *
 * WHY THIS IS NOT `submitRfq`. The catalogue quote builder posts product
 * lines: SKUs resolved against the catalogue, with quantities. A market
 * enquiry has none — the buyer types "3/4in bore, JIC 37° female, 275 bar" or
 * attaches a drawing, and `RfqLine` requires a `productId`, so there is
 * nothing to create. The part list therefore lands in `customerMessage` and
 * the RFQ carries zero lines. Everything downstream — the admin queue, the
 * signed customer tracking link, both emails — works the same way, because
 * `lineCount: 0` is a real state a stock enquiry can be in.
 *
 * The commercially useful fields (delivery city, Incoterm, needed-by) are
 * written to the RFQ's own columns where they can be filtered and reported on,
 * not appended to the message body where they cannot.
 */

type SubmitResult =
  | { success: true; code: string; token: string }
  | { success: false; error: string }

/**
 * Anti-spam floor. A human takes a few seconds over these fields; a bot posts
 * instantly. Generous, so a paste-and-go buyer is never blocked.
 *
 * Unlike `submitRfq`, a rejection here cannot answer "success": this action
 * returns the RFQ code and a signed tracking token, and the form renders them.
 * A fake confirmation carrying a made-up reference is worse for a real person
 * who trips the check than a plain "try again" is for a bot.
 */
const MIN_FORM_DURATION_MS = 1500

/** Matches only the paths /api/rfq/attachments/sign generates. */
const ATTACHMENT_PATH = /^rfq-attachments\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/

const EnquirySchema = z.object({
  /** Absent on an index enquiry, which names a free-text destination instead. */
  marketSlug: z.string().trim().max(80).optional().or(z.literal('')),
  destinationCountry: z.string().trim().max(120).optional().or(z.literal('')),
  source: z.enum(['market_quote_form', 'market_quick_enquiry', 'markets_index_enquiry']),
  company: z.string().trim().min(1, 'a company name').max(200),
  contactName: z.string().trim().min(1, 'a contact name').max(200),
  email: z.string().trim().toLowerCase().email('a valid work email').max(254),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  deliveryCity: z.string().trim().max(120).optional().or(z.literal('')),
  incoterm: z.string().trim().max(60).optional().or(z.literal('')),
  neededBy: z.string().trim().max(60).optional().or(z.literal('')),
  partList: z.string().trim().max(8000).optional().or(z.literal('')),
  wantsChecklist: z.boolean().optional(),
})

export async function submitMarketEnquiry(formData: FormData): Promise<SubmitResult> {
  // Honeypot — a real browser never populates an off-screen field with no
  // label. The reply is deliberately vague and offers the email fallback, so a
  // person who somehow trips it still has a way through.
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return { success: false, error: 'Something went wrong. Email sales@indushydraulics.me and we will pick it up.' }
  }

  const startedAtRaw = formData.get('formStartedAt')
  const startedAt = typeof startedAtRaw === 'string' ? Number(startedAtRaw) : Number.NaN
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FORM_DURATION_MS) {
    return { success: false, error: 'That was quick — give the form a moment and try again.' }
  }

  const parsed = EnquirySchema.safeParse({
    marketSlug: formData.get('marketSlug') ?? '',
    destinationCountry: formData.get('destinationCountry') ?? '',
    source: formData.get('source'),
    company: formData.get('company'),
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    deliveryCity: formData.get('deliveryCity') ?? '',
    incoterm: formData.get('incoterm') ?? '',
    neededBy: formData.get('neededBy') ?? '',
    partList: formData.get('partList') ?? '',
    wantsChecklist: formData.get('wantsChecklist') === 'on',
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { success: false, error: `Please check the form — we need ${issue?.message ?? 'the missing details'}.` }
  }

  const input = parsed.data

  /*
    Two shapes of destination, and only one of them is a registry lookup.

    A market-page enquiry MUST resolve — its slug came from a rendered page, so
    a miss means the market was retired mid-session and quoting it would be
    wrong. An index enquiry never resolves, by design: the buyer typed a
    country and we take it as typed. Recording it against a market we guessed
    from a fuzzy name match would be the one genuinely dangerous behaviour
    here — the desk would quote a lane the buyer never asked about.
  */
  const isIndexEnquiry = input.source === 'markets_index_enquiry'
  const market = input.marketSlug ? marketBySlug(input.marketSlug) : undefined

  if (isIndexEnquiry) {
    if (!input.destinationCountry) {
      return { success: false, error: 'Please check the form — we need a destination country.' }
    }
  } else if (!market) {
    return { success: false, error: 'That market is no longer listed. Email sales@indushydraulics.me.' }
  }

  const destinationName = market?.name ?? input.destinationCountry ?? ''
  /*
    `releasedMarketPage`, not the raw lookup. All 46 records exist, but a market
    still waiting on its forwarder sign-off renders the plain layout — so the
    buyer never saw the designed page's quoting currency and an Estimate raised
    in it would come out of nowhere. An unreleased market quotes in the store
    default, same as one with no record at all.
  */
  const page = market ? releasedMarketPage(market.slug) : undefined

  if (formData.get('attachmentsPending') === '1') {
    return { success: false, error: 'An attachment is still uploading. Give it a moment and try again.' }
  }

  const attachments = readAttachments(formData.get('attachments'))

  /*
    Something has to describe what is wanted. Without either a part list or a
    drawing there is nothing to quote, and an empty enquiry costs the desk a
    round trip that the form could have prevented. The closing card asks the
    same question in one field, so this rule holds for both sources.
  */
  if (!input.partList && attachments.length === 0) {
    return {
      success: false,
      error: 'Tell us what you need — part numbers, or bore, thread and pressure — or attach a drawing.',
    }
  }

  // Allow-listed, not sanitised — both land in columns the desk quotes and
  // reports against. See the docblocks in @indus/domain/market-enquiry.
  const incoterm = normaliseIncoterm(input.incoterm)
  const neededBy = normaliseNeededBy(input.neededBy)
  const urgency = enquiryUrgency(neededBy)

  const { firstName, lastName } = splitContactName(input.contactName)
  const { accountId, contactId } = await resolveOrCreateAnonymousContact({
    firstName,
    lastName,
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    company: input.company,
  })

  const subject = marketEnquirySubject(destinationName)
  const applicationContext = buildApplicationContext({
    marketName: destinationName,
    countryCode: market?.countryCode ?? null,
    deliveryCity: input.deliveryCity ?? null,
    neededBy,
    wantsChecklist: input.wantsChecklist === true,
    source: input.source,
  })

  const rfq = await db.$transaction(async (tx) => {
    const code = await nextRfqCode(tx)
    const created = await tx.rfq.create({
      data: {
        code,
        accountId,
        submittedByContactId: contactId,
        subject,
        applicationContext,
        urgency,
        ...(incoterm ? { incoterm } : {}),
        // The quoting currency is the market's, not the store default. Nigeria
        // raises its Form M and its letter of credit in USD; an AED Estimate
        // creates work at the buyer's bank.
        currency: page?.currency ?? 'AED',
        customerMessage: input.partList || null,
        internalNotes: 'Submitted from the export-market page — verify contact details before fulfilment.',
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    for (const file of attachments) {
      const media = await tx.media.create({
        data: {
          kind: file.contentType.startsWith('image/')
            ? 'image'
            : file.contentType === 'application/pdf'
              ? 'document'
              : 'cad',
          // Bucket-PREFIXED, matching uploadToStorage's convention for private
          // buckets — signedUrlFor() splits on the first slash to recover the
          // bucket. A bare object key makes the attachment unreadable.
          storagePath: `${STORAGE_BUCKETS.documents}/${file.path}`,
          originalFilename: file.label,
          mimeType: file.contentType,
          bytes: file.size,
        },
      })
      await tx.rfqAttachment.create({
        data: { rfqId: created.id, mediaId: media.id, uploaderType: 'contact', uploaderId: contactId },
      })
    }

    await tx.accountActivity.create({
      data: {
        accountId,
        actorType: 'contact',
        actorId: contactId,
        verb: 'submitted_rfq',
        payload: {
          rfqId: created.id,
          code: created.code,
          anonymous: true,
          attachmentCount: attachments.length,
          market: market?.slug ?? null,
          destination: market ? null : destinationName,
          source: input.source,
        },
      },
    })

    return created
  })

  // The RFQ is committed. A mail failure must not undo it, or lose it.
  try {
    await sendRfqEmails({
      rfqId: rfq.id,
      rfqCode: rfq.code,
      urgency,
      lineCount: 0,
      subject,
      customerMessage: input.partList || null,
      contactId,
      accountId,
      shipToAddressId: null,
    })
  } catch (err) {
    console.error('[submitMarketEnquiry] email send error', err)
  }

  /*
    No redirect. The reader is 12,000 pixels down a page they scrolled through
    to get here; navigating away and asking them to come back is how a
    conversion becomes a bounce. The form replaces itself with a confirmation
    that carries the signed tracking link, and they can follow it or not.
  */
  return { success: true, code: rfq.code, token: signQuoteAccessToken(rfq.code) }
}

/**
 * Attachments arrive as a manifest of storage paths, never as bytes — the
 * browser uploaded them straight to the private documents bucket against a
 * single-use signed URL. Everything here is still untrusted: the path must
 * match the shape the server generates, so a caller cannot point an
 * RfqAttachment at an arbitrary object elsewhere in the bucket.
 */
function readAttachments(
  raw: FormDataEntryValue | null
): Array<{ path: string; label: string; size: number; contentType: string }> {
  if (typeof raw !== 'string' || !raw.trim() || raw === '[]') return []
  const out: Array<{ path: string; label: string; size: number; contentType: string }> = []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    for (const entry of parsed.slice(0, 6)) {
      if (!entry || typeof entry !== 'object') continue
      const { path, label, size, contentType } = entry as Record<string, unknown>
      if (typeof path !== 'string' || !ATTACHMENT_PATH.test(path)) continue
      out.push({
        path,
        label: typeof label === 'string' ? label.slice(0, 180) : 'attachment',
        size: typeof size === 'number' && Number.isFinite(size) ? size : 0,
        contentType: typeof contentType === 'string' ? contentType.slice(0, 120) : 'application/octet-stream',
      })
    }
  } catch {
    // A malformed manifest loses the attachments but must never lose the
    // enquiry — the enquiry is what matters commercially.
  }
  return out
}
