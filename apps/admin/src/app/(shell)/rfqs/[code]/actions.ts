'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { assertTransition } from '@indus/domain'
import { renderEstimatePdf, uploadQuotePdf, computeTotals } from '@indus/pdf'
import { sendEmail, renderQuoteSent } from '@indus/email'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { buildEstimateInputFromRfq } from '../../../../lib/build-estimate-input'
import { nextQuoteCodeForRfq, quoteCodeToSlug } from '../../../../lib/quote-numbering'
import { formatAed, formatDayMonthYear } from '../../../../lib/format'

const UpdateRfqStatusInput = z.object({
  rfqId: z.string().uuid(),
  to: z.string().min(1),
})

export async function updateRfqStatus(rfqId: string, to: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)
    const parsed = UpdateRfqStatusInput.parse({ rfqId, to })

    const rfq = await db.rfq.findUnique({
      where: { id: parsed.rfqId },
      select: { status: true },
    })
    if (!rfq) return fail('NOT_FOUND', 'RFQ not found')

    try {
      assertTransition(rfq.status, parsed.to as never)
    } catch (e) {
      return fail('PRECONDITION_FAILED', e instanceof Error ? e.message : 'Invalid state transition')
    }

    await db.rfq.update({
      where: { id: parsed.rfqId },
      data: {
        status: parsed.to as never,
        ...(parsed.to === 'quote_sent' ? { quoteSentAt: new Date() } : {}),
        ...(parsed.to === 'accepted' ? { acceptedAt: new Date() } : {}),
      },
    })

    revalidatePath(`//rfqs`)
    revalidatePath(`//rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
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

    revalidatePath(`/rfqs`)
    revalidatePath(`/rfqs/[code]`, 'page')
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

    revalidatePath(`//rfqs/[code]`, 'page')
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
    })
    if (!estimate) return fail('NOT_FOUND', 'Could not build estimate from RFQ')

    const baseTotals = computeTotals(estimate)
    const subtotal = baseTotals.subtotal
    const vatAmount = baseTotals.vatAmount
    const discountTotal = parsed.discountTotal
    const shipping = parsed.shipping
    const total = subtotal - discountTotal + vatAmount + shipping

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
      const fromEmail = settings?.quoteFromEmail ?? 'sales@indushydraulics.me'
      const fromName = settings?.quoteFromName ?? null
      const customerName = `${rfq.submittedBy.firstName} ${rfq.submittedBy.lastName}`.trim() || rfq.submittedBy.email

      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
      const viewUrl = `${baseUrl}/quote/${rfq.code}`

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
        replyTo: fromEmail,
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
      // eslint-disable-next-line no-console
      console.error('[sendQuote] email send error', err)
    }

    revalidatePath(`/rfqs`)
    revalidatePath(`/rfqs/[code]`, 'page')
    return ok({ quoteCode: codeInfo.code })
  } catch (err) {
    return failFromError(err)
  }
}
