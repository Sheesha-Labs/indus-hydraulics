'use server'

import { db, nextEnquiryCode } from '@indus/db'
import { attributeReply, attributeSupplier, extractFromPaste } from '@indus/domain'
import { revalidatePath } from 'next/cache'

import { inngest } from '../../../../inngest/client'
import { extractOffer } from '../../../../lib/offer-extraction'
import { z } from 'zod'

import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

const createSchema = z.object({
  title: z.string().trim().min(1, 'A title is required').max(500),
  rawText: z.string().trim().min(1, 'Paste the enquiry text'),
  buyerName: z.string().trim().max(200).optional(),
  sourcePortal: z.string().trim().max(200).optional(),
  closingAt: z.string().trim().optional(),
})

/**
 * Create an enquiry from pasted text, extracting draft line items.
 *
 * Extraction is deterministic and every line stores the verbatim substring it
 * came from — a DB CHECK enforces that for non-manual rows. Lines land as
 * `needs_review`; nothing here is treated as confirmed.
 */
export async function createEnquiryFromPaste(formData: FormData): Promise<Result<{ code: string }>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)

    const parsed = createSchema.safeParse({
      title: formData.get('title'),
      rawText: formData.get('rawText'),
      buyerName: formData.get('buyerName') || undefined,
      sourcePortal: formData.get('sourcePortal') || undefined,
      closingAt: formData.get('closingAt') || undefined,
    })
    if (!parsed.success) return failFromError(parsed.error)

    const input = parsed.data
    const extraction = extractFromPaste({ rawText: input.rawText, title: input.title })

    let closingAt: Date | null = null
    if (input.closingAt) {
      const d = new Date(input.closingAt)
      if (Number.isNaN(d.getTime())) return fail('VALIDATION', 'That closing date is not valid.')
      closingAt = d
    }

    const staffId = session?.user?.id ?? null

    const enquiry = await db.$transaction(async (tx) => {
      const code = await nextEnquiryCode(tx)
      return tx.enquiry.create({
        data: {
          code,
          title: extraction.title || input.title,
          bidNo: extraction.bidNo,
          revision: extraction.revision,
          buyerName: input.buyerName ?? null,
          sourcePortal: input.sourcePortal ?? null,
          sourceRef: extraction.bidNo
            ? `${extraction.bidNo}${extraction.revision ? `/${extraction.revision}` : ''}`
            : null,
          closingAt,
          rawText: extraction.normalisedText,
          extractorName: extraction.extractorName,
          createdById: staffId,
          lines: {
            create: extraction.lines.map((line) => ({
              position: line.position,
              description: line.description,
              partNumber: line.partNumber,
              qty: line.qty,
              unit: line.unit,
              certification: line.certification,
              sourceKind: line.sourceKind,
              sourceText: line.sourceText,
              reviewFlags: line.flags,
            })),
          },
        },
        select: { code: true },
      })
    })

    revalidatePath('/admin/enquiries')
    return ok({ code: enquiry.code })
  } catch (error) {
    return failFromError(error)
  }
}

const reviewSchema = z.object({
  lineId: z.string().uuid(),
  reviewStatus: z.enum(['needs_review', 'confirmed', 'rejected']),
})

/** Mark a single extracted line confirmed or rejected. */
export async function setLineReviewStatus(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)

    const parsed = reviewSchema.safeParse({
      lineId: formData.get('lineId'),
      reviewStatus: formData.get('reviewStatus'),
    })
    if (!parsed.success) return failFromError(parsed.error)

    const line = await db.enquiryLine.update({
      where: { id: parsed.data.lineId },
      data: { reviewStatus: parsed.data.reviewStatus },
      select: { enquiry: { select: { code: true } } },
    })

    revalidatePath(`/admin/enquiries/${line.enquiry.code}`)
    return ok(undefined)
  } catch (error) {
    return failFromError(error)
  }
}

/**
 * Queue supplier research for every non-rejected line on an enquiry.
 *
 * Creates the run row synchronously so the screen has something to show
 * immediately, then hands off to Inngest. Refuses a second run while one is
 * still moving — two concurrent runs on one enquiry double the bill and race
 * each other's result rows.
 */
export async function startSupplierResearch(formData: FormData): Promise<Result<{ runId: string }>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)

    const parsed = z.object({ enquiryId: z.string().uuid() }).safeParse({
      enquiryId: formData.get('enquiryId'),
    })
    if (!parsed.success) return failFromError(parsed.error)

    const enquiry = await db.enquiry.findUnique({
      where: { id: parsed.data.enquiryId },
      select: { id: true, code: true, _count: { select: { lines: true } } },
    })
    if (!enquiry) return fail('NOT_FOUND', 'That enquiry no longer exists.')
    if (enquiry._count.lines === 0) {
      return fail('PRECONDITION_FAILED', 'This enquiry has no line items to research yet.')
    }

    const inFlight = await db.researchRun.findFirst({
      where: { enquiryId: enquiry.id, status: { in: ['queued', 'running'] } },
      select: { id: true },
    })
    if (inFlight) {
      return fail('CONFLICT', 'Research is already running for this enquiry.')
    }

    const run = await db.researchRun.create({
      data: { enquiryId: enquiry.id, triggeredById: session?.user?.id ?? null },
      select: { id: true },
    })

    // Fired outside any transaction: an event sent inside one that later rolls
    // back leaves a job running against a row that does not exist.
    await inngest.send({
      name: 'procurement/research.requested',
      data: { researchRunId: run.id },
    })

    revalidatePath(`/admin/enquiries/${enquiry.code}`)
    return ok({ runId: run.id })
  } catch (error) {
    return failFromError(error)
  }
}

/**
 * Record a supplier's reply against an enquiry and extract its offer lines.
 *
 * Attribution is checked but never overridden: if the pasted reply quotes a
 * DIFFERENT enquiry reference than the one being viewed, this refuses rather
 * than filing it here. A mis-attributed reply prices the wrong enquiry, the
 * numbers all look real, and the error only surfaces on an invoice.
 */
export async function recordSupplierOffer(formData: FormData): Promise<Result<{ offerId: string; lines: number; dropped: number }>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)

    const parsed = z
      .object({
        enquiryId: z.string().uuid(),
        rawText: z.string().trim().min(1, 'Paste the supplier reply'),
        supplierName: z.string().trim().max(200).optional(),
      })
      .safeParse({
        enquiryId: formData.get('enquiryId'),
        rawText: formData.get('rawText'),
        supplierName: formData.get('supplierName') || undefined,
      })
    if (!parsed.success) return failFromError(parsed.error)

    const enquiry = await db.enquiry.findUnique({
      where: { id: parsed.data.enquiryId },
      select: { id: true, code: true },
    })
    if (!enquiry) return fail('NOT_FOUND', 'That enquiry no longer exists.')

    const attribution = attributeReply(parsed.data.rawText)
    if (attribution.enquiryCode && attribution.enquiryCode !== enquiry.code) {
      return fail(
        'PRECONDITION_FAILED',
        `This reply quotes ${attribution.enquiryCode}, not ${enquiry.code}. File it against that enquiry instead.`,
      )
    }

    const knownSuppliers = await db.supplier.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, domain: true },
      take: 500,
    })
    const supplierMatch = attributeSupplier({
      rawText: parsed.data.rawText,
      candidates: knownSuppliers,
    })

    const extracted = await extractOffer({ rawText: parsed.data.rawText })

    const supplierName =
      parsed.data.supplierName ??
      extracted.supplierName ??
      knownSuppliers.find((s) => s.id === supplierMatch.supplierId)?.name ??
      'Unidentified supplier'

    const offer = await db.supplierOffer.create({
      data: {
        enquiryId: enquiry.id,
        supplierId: supplierMatch.supplierId,
        supplierName,
        currency: extracted.currency,
        incoterm: extracted.incoterm,
        validUntil: extracted.validUntil ? new Date(extracted.validUntil) : null,
        decimalConvention: extracted.decimalConvention,
        attributionMethod: attribution.enquiryCode ? 'reference_token' : supplierMatch.method,
        rawText: parsed.data.rawText,
        extractorName: 'offer/v1',
        createdById: session?.user?.id ?? null,
        lines: {
          create: extracted.lines.map((line, i) => {
            const money = extracted.parsed[i]
            const flags: string[] = []
            if (extracted.decimalConvention === 'ambiguous') flags.push('decimal_convention_ambiguous')
            if (line.unitPriceRaw && money?.unitPrice == null) flags.push('price_unreadable')
            if (line.kind === 'alternative') flags.push('alternative_part')
            return {
              position: i + 1,
              description: line.description,
              kind: line.kind,
              unitPrice: money?.unitPrice ?? null,
              qty: money?.qty ?? null,
              moq: money?.moq ?? null,
              statedTotal: money?.total ?? null,
              leadTimeDays: line.leadTimeDays,
              sourceQuote: line.sourceQuote,
              reviewFlags: flags,
            }
          }),
        },
      },
      select: { id: true },
    })

    revalidatePath(`/admin/enquiries/${enquiry.code}/offers`)
    return ok({ offerId: offer.id, lines: extracted.lines.length, dropped: extracted.droppedForNoEvidence })
  } catch (error) {
    return failFromError(error)
  }
}
