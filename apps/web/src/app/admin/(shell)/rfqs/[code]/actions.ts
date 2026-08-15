'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO, assertTransition } from '@indus/domain'
import { renderEstimatePdf, uploadQuotePdf, computeTotals } from '@indus/pdf'
import { sendEmail, renderQuoteSent, renderQuoteAck } from '@indus/email'
import { signQuoteAccessToken } from '@indus/domain'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'
import { buildEstimateInputFromRfq } from '../../../../../lib/build-estimate-input'
import { nextQuoteCodeForRfq, quoteCodeToSlug } from '../../../../../lib/quote-numbering'
import { formatAed, formatDayMonthYear } from '../../../../../lib/format'

const UpdateRfqStatusInput = z.object({
  rfqId: z.string().uuid(),
  to: z.string().min(1),
})

export async function updateRfqStatus(rfqId: string, to: string): Promise<Result<void>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)
    const parsed = UpdateRfqStatusInput.parse({ rfqId, to })

    const rfq = await db.rfq.findUnique({
      where: { id: parsed.rfqId },
      select: {
        id: true,
        code: true,
        status: true,
        accountId: true,
        submittedByContactId: true,
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        quotes: { orderBy: { revision: 'desc' }, take: 1 },
      },
    })
    if (!rfq) return fail('NOT_FOUND', 'RFQ not found')

    try {
      assertTransition(rfq.status, parsed.to as never)
    } catch (e) {
      return fail('PRECONDITION_FAILED', e instanceof Error ? e.message : 'Invalid state transition')
    }

    const previousStatus = rfq.status
    // requireRole has already guaranteed a valid staff session, but TS
    // doesn't see that — assert here so the activity row's actorId is typed.
    const staffId = session?.user?.id
    if (!staffId) return fail('UNAUTHORIZED', 'No staff session')

    await db.$transaction(async (tx) => {
      await tx.rfq.update({
        where: { id: parsed.rfqId },
        data: {
          status: parsed.to as never,
          ...(parsed.to === 'quote_sent' ? { quoteSentAt: new Date() } : {}),
          ...(parsed.to === 'accepted' ? { acceptedAt: new Date() } : {}),
        },
      })

      // Audit-log every transition. The storefront /quote/[code] timeline
      // reads the timestamps for order_placed / shipped / delivered from
      // these rows so we don't need new dated columns on the RFQ table.
      await tx.accountActivity.create({
        data: {
          accountId: rfq.accountId,
          actorType: 'staff',
          actorId: staffId,
          verb: ACTIVITY_VERB_FOR_STATUS[parsed.to] ?? `status_changed_to_${parsed.to}`,
          payload: {
            rfqId: rfq.id,
            rfqCode: rfq.code,
            from: previousStatus,
            to: parsed.to,
          },
        },
      })
    })

    // Side effects on terminal customer-visible transitions
    if ((parsed.to === 'accepted' || parsed.to === 'declined') && rfq.submittedBy && rfq.quotes[0]) {
      void fireQuoteAckSideEffects({
        rfqId: rfq.id,
        rfqCode: rfq.code,
        outcome: parsed.to,
        contactId: rfq.submittedByContactId,
        contactName: `${rfq.submittedBy.firstName} ${rfq.submittedBy.lastName}`.trim() || rfq.submittedBy.email,
        contactEmail: rfq.submittedBy.email,
        quote: rfq.quotes[0],
      })
    }

    revalidatePath(`/admin/rfqs`)
    revalidatePath(`/admin/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// Map RFQ states to friendlier activity verbs that read well in the
// customer detail timeline (which displays `verb.replace(/_/g, ' ')`).
const ACTIVITY_VERB_FOR_STATUS: Record<string, string> = {
  engineer_review: 'review_started',
  engineer_questions_pending: 'questions_pending',
  quote_sent: 'quote_sent',
  accepted: 'quote_accepted',
  declined: 'quote_declined',
  cancelled: 'rfq_cancelled',
  order_created: 'order_placed',
  shipped: 'order_shipped',
  delivered: 'order_delivered',
}

async function fireQuoteAckSideEffects(input: {
  rfqId: string
  rfqCode: string
  outcome: 'accepted' | 'declined'
  contactId: string | null
  contactName: string
  contactEmail: string
  quote: { id: string; code: string; revision: number; total: unknown }
}): Promise<void> {
  try {
    const settings = await db.storeSettings.findFirst()
    const fromEmail = settings?.quoteFromEmail ?? DEFAULT_FROM_EMAIL
    // Reply-To must be the Workspace inbox, never the sending address —
    // the sending domain has no MX, so a customer's reply would vanish.
    const replyTo = settings?.contactEmail ?? DEFAULT_REPLY_TO
    const fromName = settings?.quoteFromName ?? null

    const totalNum = Number(input.quote.total)
    const ack = renderQuoteAck({
      customerName: input.contactName,
      quoteCode: input.quote.code,
      ...(input.quote.revision > 1 ? { revisionLabel: `R${input.quote.revision}` } : {}),
      outcome: input.outcome,
      totalDisplay: formatAed(totalNum),
      branding: {
        legalName: settings?.legalName ?? 'Indus Hydraulic Power Trading LLC',
        vatTrn: settings?.vatTrn ?? null,
        registeredAddressLines: (settings?.registeredAddressLines as string[] | null) ?? [],
        signatureName: settings?.signatureName ?? null,
        signatureTitle: settings?.signatureTitle ?? null,
        signaturePhone: settings?.signaturePhone ?? null,
        signatureEmail: settings?.signatureEmail ?? null,
      },
    })

    await sendEmail({
      kind: input.outcome === 'accepted' ? 'quote_accepted_ack' : 'quote_declined_ack',
      to: [input.contactEmail],
      subject: ack.subject,
      html: ack.html,
      fromEmail,
      ...(fromName ? { fromName } : {}),
      replyTo,
      rfqId: input.rfqId,
      quoteId: input.quote.id,
    })

    // In-app notification for the customer's account portal bell.
    if (input.contactId) {
      await db.notification.create({
        data: {
          recipientKind: 'contact',
          contactId: input.contactId,
          kind: 'rfq_status_change',
          payload: {
            rfqId: input.rfqId,
            rfqCode: input.rfqCode,
            quoteCode: input.quote.code,
            outcome: input.outcome,
          },
        },
      })
    }
  } catch (err) {
     
    console.error('[updateRfqStatus] ack side-effect error', err)
  }
}

export async function assignEngineer(rfqId: string, engineerId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)
    z.string().uuid().parse(rfqId)
    z.string().uuid().parse(engineerId)

    await db.rfq.update({
      where: { id: rfqId },
      data: { assignedEngineerId: engineerId },
    })

    revalidatePath(`/admin/rfqs`)
    revalidatePath(`/admin/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateTrackingSchema = z.object({
  rfqId: z.string().uuid(),
  trackingCarrier: z.string().trim().max(120).optional().or(z.literal('')),
  trackingNumber: z.string().trim().max(120).optional().or(z.literal('')),
})

/**
 * Set or clear the carrier + tracking number on an RFQ. Both fields are
 * stored as free-text strings (no carrier integration). The customer's
 * /quote/[code] page surfaces them under the Shipped step on the
 * timeline once the RFQ status reaches `shipped` or beyond.
 */
export async function updateTracking(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)

    const parsed = UpdateTrackingSchema.parse({
      rfqId: formData.get('rfqId'),
      trackingCarrier: formData.get('trackingCarrier') ?? '',
      trackingNumber: formData.get('trackingNumber') ?? '',
    })

    await db.rfq.update({
      where: { id: parsed.rfqId },
      data: {
        trackingCarrier: parsed.trackingCarrier ? parsed.trackingCarrier : null,
        trackingNumber: parsed.trackingNumber ? parsed.trackingNumber : null,
      },
    })

    revalidatePath(`/admin/rfqs`)
    revalidatePath(`/admin/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const SaveLineReviewSchema = z.object({
  rfqId: z.string().uuid(),
  internalNotes: z.string().optional().transform((v) => v ?? null),
})

export async function saveLineReview(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)
    const parsed = SaveLineReviewSchema.parse({
      rfqId: formData.get('rfqId'),
      internalNotes: (formData.get('internalNotes') as string | null) ?? '',
    })

    // Parse line data
    const lineIds: string[] = []
    const unitPrices: Record<string, string> = {}
    const leadTimes: Record<string, string> = {}
    const lineNotes: Record<string, string> = {}

    for (const [key, val] of formData.entries()) {
      if (key.startsWith('unitPrice_')) {
        const id = key.replace('unitPrice_', '')
        lineIds.push(id)
        unitPrices[id] = val as string
      }
      if (key.startsWith('leadTime_')) leadTimes[key.replace('leadTime_', '')] = val as string
      if (key.startsWith('lineNote_')) lineNotes[key.replace('lineNote_', '')] = val as string
    }

    // Validate every line id is a UUID before opening the tx.
    for (const id of lineIds) z.string().uuid().parse(id)

    await db.$transaction(async (tx) => {
      await tx.rfq.update({
        where: { id: parsed.rfqId },
        data: { internalNotes: parsed.internalNotes ?? undefined },
      })

      for (const lineId of lineIds) {
        const unitPrice = unitPrices[lineId]
        const leadTime = leadTimes[lineId]
        const note = lineNotes[lineId]

        await tx.rfqLine.update({
          where: { id: lineId },
          data: {
            engineerUnitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
            engineerLeadTimeDays: leadTime ? parseInt(leadTime) : undefined,
            engineerNotes: note || undefined,
          },
        })
      }
    })

    revalidatePath(`/admin/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND QUOTE — composer → Quote row → PDF → Storage → Email → state
// ─────────────────────────────────────────────────────────────────────────────

const SendQuoteSchema = z.object({
  rfqId: z.string().uuid(),
  validityDays: z.coerce.number().int().min(1).max(365).default(30),
  paymentTerms: z.string().trim().min(1).max(120).default('Advance with order'),
  vatRatePctOverride: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length ? Number(v) : undefined)),
  discountTotal: z.coerce.number().min(0).default(0),
  shipping: z.coerce.number().min(0).default(0),
  referenceLine: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  subjectOverride: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  notesOverride: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  customerEmailMessage: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
})

export async function sendQuote(formData: FormData): Promise<Result<{ quoteCode: string }>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)
    const staffId = session?.user?.id
    if (!staffId) return fail('UNAUTHORIZED', 'Staff session required')
    const parsed = SendQuoteSchema.parse({
      rfqId: formData.get('rfqId'),
      validityDays: formData.get('validityDays') ?? 30,
      paymentTerms: formData.get('paymentTerms') ?? 'Advance with order',
      vatRatePctOverride: formData.get('vatRatePctOverride') ?? '',
      discountTotal: formData.get('discountTotal') ?? 0,
      shipping: formData.get('shipping') ?? 0,
      referenceLine: formData.get('referenceLine') ?? '',
      subjectOverride: formData.get('subjectOverride') ?? '',
      notesOverride: formData.get('notesOverride') ?? '',
      customerEmailMessage: formData.get('customerEmailMessage') ?? '',
    })

    const rfq = await db.rfq.findUnique({
      where: { id: parsed.rfqId },
      select: {
        id: true,
        code: true,
        status: true,
        accountId: true,
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    })
    if (!rfq) return fail('NOT_FOUND', 'RFQ not found')
    if (!rfq.submittedBy) return fail('PRECONDITION_FAILED', 'RFQ has no contact email to send to')

    const allowedStates = ['engineer_review', 'engineer_questions_pending', 'quote_sent']
    if (!allowedStates.includes(rfq.status)) {
      return fail('PRECONDITION_FAILED', `Cannot send a quote from status "${rfq.status}". Move to engineer_review first.`)
    }

    const codeInfo = await nextQuoteCodeForRfq(rfq.id)
    const validityDays = parsed.validityDays
    const estimateDate = new Date()
    const expiryDate = new Date(estimateDate.getTime() + validityDays * 24 * 60 * 60 * 1000)

    const estimate = await buildEstimateInputFromRfq(rfq.code, {
      code: codeInfo.code,
      ...(codeInfo.kind === 'revision' ? { revisionLabel: `R${codeInfo.revision}` } : {}),
      estimateDate,
      expiryDate,
      validityDays,
      ...(parsed.subjectOverride !== null ? { subject: parsed.subjectOverride } : {}),
      ...(parsed.notesOverride !== null ? { notes: parsed.notesOverride } : {}),
      ...(parsed.referenceLine !== null ? { referenceLine: parsed.referenceLine } : {}),
      ...(parsed.vatRatePctOverride !== undefined ? { vatRatePct: parsed.vatRatePctOverride } : {}),
      discountTotal: parsed.discountTotal,
      shipping: parsed.shipping,
    })
    if (!estimate) return fail('NOT_FOUND', 'Could not build estimate from RFQ')

    // Compute totals from the same EstimateInput the PDF will render — this
    // guarantees PDF Total === Quote.total. Previously discount/shipping were
    // applied only to Quote.total, leaving the PDF showing a different number.
    const baseTotals = computeTotals(estimate)
    const subtotal = baseTotals.subtotal
    const discountTotal = baseTotals.discountTotal
    const vatAmount = baseTotals.vatAmount
    const shipping = baseTotals.shipping
    const total = baseTotals.total

    if (subtotal <= 0) {
      return fail('PRECONDITION_FAILED', 'Cannot send a quote with no priced line items. Set engineer unit prices first.')
    }

    const pdf = await renderEstimatePdf(estimate)

    let upload: Awaited<ReturnType<typeof uploadQuotePdf>>
    try {
      upload = await uploadQuotePdf({
        pdf,
        fileSlug: quoteCodeToSlug(codeInfo.code),
        meta: { rfqId: rfq.id },
      })
    } catch (err) {
      return fail('INTERNAL', err instanceof Error ? err.message : 'PDF upload failed')
    }

    const quote = await db.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          code: codeInfo.code,
          rfqId: rfq.id,
          revision: codeInfo.revision,
          subtotal,
          discountTotal,
          shipping,
          tax: vatAmount,
          total,
          currency: 'AED',
          termsPayment: parsed.paymentTerms,
          termsValidityDays: validityDays,
          pdfMediaId: upload.mediaId,
          sentAt: new Date(),
          expiresAt: expiryDate,
        },
      })

      await tx.rfq.update({
        where: { id: rfq.id },
        data: {
          status: 'quote_sent',
          quoteSentAt: new Date(),
          quoteExpiresAt: expiryDate,
        },
      })

      await tx.accountActivity.create({
        data: {
          accountId: rfq.accountId,
          actorType: 'staff',
          actorId: staffId,
          verb: 'quote_sent',
          payload: { rfqId: rfq.id, rfqCode: rfq.code, quoteId: created.id, quoteCode: created.code, revision: created.revision },
        },
      })

      return created
    })

    // Send the email — outside the transaction so PDF/email failures don't roll
    // back the Quote row. If the email errors, the quote is still saved and the
    // engineer can resend (which produces a new revision).
    try {
      const settings = await db.storeSettings.findFirst()
      const fromEmail = settings?.quoteFromEmail ?? DEFAULT_FROM_EMAIL
      // Reply-To must be the Workspace inbox, never the sending address —
      // the sending domain has no MX, so a customer's reply would vanish.
      const replyTo = settings?.contactEmail ?? DEFAULT_REPLY_TO
      const fromName = settings?.quoteFromName ?? null
      const customerName = `${rfq.submittedBy.firstName} ${rfq.submittedBy.lastName}`.trim() || rfq.submittedBy.email

      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
      // Signed access token so a non-logged-in recipient (e.g. the procurement
      // person who got the email forwarded) can still view + download the PDF.
      const accessToken = signQuoteAccessToken(rfq.code)
      const viewUrl = `${baseUrl}/quote/${rfq.code}?token=${encodeURIComponent(accessToken)}`

      const emailContent = renderQuoteSent({
        customerName,
        quoteCode: codeInfo.code,
        ...(codeInfo.kind === 'revision' ? { revisionLabel: `R${codeInfo.revision}` } : {}),
        totalDisplay: formatAed(total),
        expiresOnDisplay: formatDayMonthYear(expiryDate),
        paymentTerms: parsed.paymentTerms,
        ...(parsed.customerEmailMessage ? { engineerMessage: parsed.customerEmailMessage } : {}),
        viewUrl,
        branding: {
          legalName: settings?.legalName ?? 'Indus Hydraulic Power Trading LLC',
          vatTrn: settings?.vatTrn ?? null,
          registeredAddressLines: (settings?.registeredAddressLines as string[] | null) ?? [],
          signatureName: settings?.signatureName ?? null,
          signatureTitle: settings?.signatureTitle ?? null,
          signaturePhone: settings?.signaturePhone ?? null,
          signatureEmail: settings?.signatureEmail ?? null,
        },
      })

      await sendEmail({
        kind: 'quote_sent',
        to: [rfq.submittedBy.email],
        subject: emailContent.subject,
        html: emailContent.html,
        fromEmail,
        ...(fromName ? { fromName } : {}),
        replyTo,
        attachments: [
          {
            filename: `${quoteCodeToSlug(codeInfo.code)}.pdf`,
            content: pdf,
            contentType: 'application/pdf',
          },
        ],
        rfqId: rfq.id,
        quoteId: quote.id,
      })
    } catch (err) {
       
      console.error('[sendQuote] email send error', err)
    }

    revalidatePath(`/admin/rfqs`)
    revalidatePath(`/admin/rfqs/[code]`, 'page')
    return ok({ quoteCode: codeInfo.code })
  } catch (err) {
    return failFromError(err)
  }
}
