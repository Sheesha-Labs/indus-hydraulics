'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '../../../lib/auth'
import { db, nextRfqCode } from '@indus/db'
import { assertTransition, signQuoteAccessToken } from '@indus/domain'
import { resolveOrCreateAnonymousContact, sendRfqEmails } from '../../../lib/rfq-intake'
import { STORAGE_BUCKETS } from '../../../lib/supabase-admin'

type LineItem = {
  sku: string
  qty: number
  targetPrice?: string
}

type SubmitResult = { success: true } | { success: false; error: string }

const AnonymousContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  company: z.string().trim().min(1).max(200),
})

// Anti-spam: the visible RFQ form takes humans at least a few seconds to
// fill in. Bots submit instantly. We hold a generous floor so paste-and-go
// power users aren't blocked.
const MIN_FORM_DURATION_MS = 1500

/** Matches only the paths /api/rfq/attachments/sign generates. */
const ATTACHMENT_PATH = /^rfq-attachments\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/

export async function submitRfq(formData: FormData): Promise<SubmitResult> {
  // Honeypot field — real browsers never populate this. Treat as silent
  // success: the bot gets a "200 OK" and never knows we ignored it.
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return { success: true }
  }

  const startedAtRaw = formData.get('formStartedAt')
  const startedAt = typeof startedAtRaw === 'string' ? Number(startedAtRaw) : NaN
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_FORM_DURATION_MS) {
      // Silent success — don't reveal the timing check to a bot.
      return { success: true }
    }
  }

  const session = await auth()

  const subject = (formData.get('subject') as string | null) ?? undefined
  const applicationContext = (formData.get('applicationContext') as string | null) ?? undefined
  const urgency = (formData.get('urgency') as 'routine' | 'priority' | 'plant_down') ?? 'routine'
  const requestedDeliveryRaw = formData.get('requestedDelivery') as string | null
  const requestedDeliveryDate = requestedDeliveryRaw ? new Date(requestedDeliveryRaw) : undefined
  const customerMessage = (formData.get('customerMessage') as string | null) ?? undefined
  const shipToAddressId = (formData.get('shipToAddressId') as string | null) ?? undefined
  const linesJson = formData.get('lines') as string

  let lines: LineItem[] = []
  try {
    lines = JSON.parse(linesJson)
  } catch {
    return { success: false, error: 'Your quote items are unreadable — please rebuild from the catalogue.' }
  }

  if (!lines.length) {
    return { success: false, error: 'No items in your quote.' }
  }

  // Resolve who is submitting: a logged-in contact, or capture details from
  // the anonymous form. Anonymous submitters land in (or re-attach to) an
  // Account so the rest of the pipeline (admin RFQ list, customer-portal
  // viewing via signed link, email confirmations) treats them identically.
  let accountId: string
  let contactId: string
  const isAnonymous = !session?.user?.accountId

  if (!isAnonymous) {
    accountId = session!.user.accountId
    contactId = session!.user.id
  } else {
    const contactParsed = AnonymousContactSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone') ?? '',
      company: formData.get('company'),
    })

    if (!contactParsed.success) {
      const issue = contactParsed.error.issues[0]
      const fieldLabels: Record<string, string> = {
        firstName: 'first name',
        lastName: 'last name',
        email: 'work email',
        phone: 'phone',
        company: 'company',
      }
      const fieldKey = typeof issue?.path[0] === 'string' ? issue.path[0] : undefined
      const label = fieldKey ? (fieldLabels[fieldKey] ?? fieldKey) : 'contact details'
      return { success: false, error: `Please check the ${label} field — ${issue?.message ?? 'invalid value'}.` }
    }

    const contactData = contactParsed.data
    const resolved = await resolveOrCreateAnonymousContact(contactData)
    accountId = resolved.accountId
    contactId = resolved.contactId
  }

  /*
    Attachments arrive as a manifest of storage paths, never as bytes — the
    browser uploaded them straight to the private documents bucket against a
    single-use signed URL (see /api/rfq/attachments/sign).

    Everything here is still treated as untrusted: the path must match the
    shape this server generates, so a caller cannot point an RfqAttachment at
    an arbitrary object elsewhere in the bucket.
  */
  if (formData.get('attachmentsPending') === '1') {
    return { success: false, error: 'An attachment is still uploading. Give it a moment and try again.' }
  }

  const attachments: Array<{ path: string; label: string; size: number; contentType: string }> = []
  const attachmentsRaw = formData.get('attachments')
  if (typeof attachmentsRaw === 'string' && attachmentsRaw.trim() && attachmentsRaw !== '[]') {
    try {
      const parsed = JSON.parse(attachmentsRaw) as unknown
      if (Array.isArray(parsed)) {
        for (const entry of parsed.slice(0, 6)) {
          if (!entry || typeof entry !== 'object') continue
          const { path, label, size, contentType } = entry as Record<string, unknown>
          if (typeof path !== 'string' || !ATTACHMENT_PATH.test(path)) continue
          attachments.push({
            path,
            label: typeof label === 'string' ? label.slice(0, 180) : 'attachment',
            size: typeof size === 'number' && Number.isFinite(size) ? size : 0,
            contentType: typeof contentType === 'string' ? contentType.slice(0, 120) : 'application/octet-stream',
          })
        }
      }
    } catch {
      // A malformed manifest loses the attachments but must never lose the
      // RFQ — the enquiry itself is what matters commercially.
    }
  }

  const products = await db.product.findMany({
    where: { sku: { in: lines.map((l) => l.sku) } },
    select: { id: true, sku: true },
  })

  const productBySku = new Map(products.map((p) => [p.sku, p]))

  const rfq = await db.$transaction(async (tx) => {
    const code = await nextRfqCode(tx)
    const created = await tx.rfq.create({
      data: {
        code,
        accountId,
        submittedByContactId: contactId,
        subject: subject || undefined,
        applicationContext: applicationContext || undefined,
        urgency,
        requestedDeliveryDate,
        shipToAddressId: shipToAddressId || undefined,
        customerMessage: customerMessage || undefined,
        // Flag anonymous submissions so the engineer triages contact-detail
        // accuracy before fulfilment.
        internalNotes: isAnonymous ? 'Submitted via anonymous form — verify contact details before fulfilment.' : undefined,
        status: 'submitted',
        submittedAt: new Date(),
        lines: {
          create: lines
            .filter((l) => productBySku.has(l.sku))
            .map((l, i) => ({
              productId: productBySku.get(l.sku)!.id,
              requestedQty: l.qty,
              customerTargetPrice: l.targetPrice ? parseFloat(l.targetPrice) : undefined,
              position: i,
            })),
        },
      },
    })

    if (attachments.length > 0) {
      for (const file of attachments) {
        const media = await tx.media.create({
          data: {
            // MediaKind is a closed enum: an image, a document, or CAD.
            // Derived from the mime type we already validated at signing.
            kind: file.contentType.startsWith('image/')
              ? 'image'
              : file.contentType === 'application/pdf'
                ? 'document'
                : 'cad',
            // Bucket-PREFIXED, matching uploadToStorage's convention for
            // private buckets — signedUrlFor() splits on the first slash to
            // recover the bucket. Storing the bare object key made every
            // attachment unreadable: the reader signed against a bucket
            // called "rfq-attachments", which does not exist.
            storagePath: `${STORAGE_BUCKETS.documents}/${file.path}`,
            originalFilename: file.label,
            mimeType: file.contentType,
            bytes: file.size,
          },
        })
        await tx.rfqAttachment.create({
          data: {
            rfqId: created.id,
            mediaId: media.id,
            uploaderType: 'contact',
            uploaderId: contactId,
          },
        })
      }
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
          anonymous: isAnonymous,
          attachmentCount: attachments.length,
        },
      },
    })

    return created
  })

  // Fire transactional emails. Failures are logged but never break the user
  // submission — the RFQ is already saved.
  try {
    await sendRfqEmails({
      rfqId: rfq.id,
      rfqCode: rfq.code,
      urgency,
      lineCount: lines.length,
      subject: subject ?? null,
      customerMessage: customerMessage ?? null,
      contactId,
      accountId,
      shipToAddressId: shipToAddressId ?? null,
    })
  } catch (err) {

    console.error('[submitRfq] email send error', err)
  }

  // `?confirmed=1` marks this as the first landing from a fresh submission
  // so the status page can fire the `rfq_submitted` analytics event exactly
  // once. Subsequent visits to /quote/<code> won't double-count.
  //
  // Anonymous submitters additionally carry a signed access token in the
  // URL so they can view the RFQ confirmation + download any future quote
  // PDF without creating an account.
  if (isAnonymous) {
    const token = signQuoteAccessToken(rfq.code)
    redirect(`/quote/${rfq.code}?token=${encodeURIComponent(token)}&confirmed=1`)
  }

  redirect(`/quote/${rfq.code}?confirmed=1`)
}

export async function updateRfqTransition(rfqId: string, to: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const rfq = await db.rfq.findUnique({ where: { id: rfqId }, select: { status: true, accountId: true } })
  if (!rfq) throw new Error('RFQ not found')
  if (rfq.accountId !== session.user.accountId) throw new Error('Forbidden')

  assertTransition(rfq.status, to as never)

  await db.rfq.update({
    where: { id: rfqId },
    data: { status: to as never },
  })
}
