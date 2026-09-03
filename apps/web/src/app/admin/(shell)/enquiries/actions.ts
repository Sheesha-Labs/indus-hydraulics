'use server'

import { db, nextEnquiryCode, nextQuoteCodeForEnquiry } from '@indus/db'
import {
  applyMarkup,
  attributeReply,
  attributeSupplier,
  computeQuoteTotals,
  computeVatRate,
  extractFromPaste,
  type MarkupMode,
} from '@indus/domain'
import { renderEstimatePdf, uploadQuotePdf } from '@indus/pdf'

import { extractFromAttachment } from '../../../../lib/attachment-extraction'
import { runResearchInline } from '../../../../lib/research-inline'
import { signedUrlFor } from '../../../../lib/supabase'
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
export async function startSupplierResearch(formData: FormData): Promise<Result<{ runId: string; mode: 'background' | 'inline' }>> {
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

    // A run older than this that never started is stale, not in-flight. Without
    // this, one undelivered event disables the button permanently — which is
    // exactly what happened the first time this shipped.
    const STALE_AFTER_MS = 15 * 60 * 1000
    await db.researchRun.updateMany({
      where: {
        enquiryId: enquiry.id,
        status: { in: ['queued', 'running'] },
        createdAt: { lt: new Date(Date.now() - STALE_AFTER_MS) },
      },
      data: {
        status: 'failed',
        error: 'Timed out before starting. Background jobs may not be configured — see INNGEST_SETUP.md.',
        finishedAt: new Date(),
      },
    })

    const inFlight = await db.researchRun.findFirst({
      where: { enquiryId: enquiry.id, status: { in: ['queued', 'running'] } },
      select: { id: true },
    })
    if (inFlight) return fail('CONFLICT', 'Research is already running for this enquiry.')

    const run = await db.researchRun.create({
      data: { enquiryId: enquiry.id, triggeredById: session?.user?.id ?? null },
      select: { id: true },
    })

    // Inngest is a NO-OP without INNGEST_EVENT_KEY — it accepts the send and
    // drops it, per INNGEST_SETUP.md. Creating a run and firing into that void
    // leaves the row queued forever, so the mode is decided explicitly here
    // rather than assumed.
    const hasBackgroundJobs = Boolean(process.env.INNGEST_EVENT_KEY)

    if (hasBackgroundJobs) {
      await inngest.send({
        name: 'procurement/research.requested',
        data: { researchRunId: run.id },
      })
      revalidatePath(`/admin/enquiries/${enquiry.code}`)
      return ok({ runId: run.id, mode: 'background' as const })
    }

    await runResearchInline(run.id)
    revalidatePath(`/admin/enquiries/${enquiry.code}`)
    return ok({ runId: run.id, mode: 'inline' as const })
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

/**
 * Tick a supplier's offer line as the chosen source for an enquiry line.
 *
 * Selection records WHO chose and WHEN, enforced by a DB CHECK that keeps the
 * two together. That is not bookkeeping pedantry: an `alternative` line means
 * substituting a part on a hydraulic system, which is an engineering decision
 * with liability, and it must be attributable to a person.
 */
export async function selectOfferLine(formData: FormData): Promise<Result<void>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)
    const staffId = session?.user?.id
    if (!staffId) return fail('UNAUTHORIZED', 'Sign in again to record a selection.')

    const parsed = z
      .object({ offerLineId: z.string().uuid(), enquiryLineId: z.string().uuid() })
      .safeParse({
        offerLineId: formData.get('offerLineId'),
        enquiryLineId: formData.get('enquiryLineId'),
      })
    if (!parsed.success) return failFromError(parsed.error)

    const line = await db.supplierOfferLine.findUnique({
      where: { id: parsed.data.offerLineId },
      select: { id: true, unitPrice: true, offer: { select: { enquiry: { select: { code: true } } } } },
    })
    if (!line) return fail('NOT_FOUND', 'That offer line no longer exists.')
    if (line.unitPrice == null) {
      return fail('PRECONDITION_FAILED', 'That line has no readable price — fix it before selecting it.')
    }

    await db.$transaction(async (tx) => {
      // One winner per enquiry line.
      await tx.supplierOfferLine.updateMany({
        where: { enquiryLineId: parsed.data.enquiryLineId, NOT: { id: parsed.data.offerLineId } },
        data: { selectedById: null, selectedAt: null },
      })
      await tx.supplierOfferLine.update({
        where: { id: parsed.data.offerLineId },
        data: {
          enquiryLineId: parsed.data.enquiryLineId,
          selectedById: staffId,
          selectedAt: new Date(),
        },
      })
    })

    revalidatePath(`/admin/enquiries/${line.offer.enquiry.code}/pricing`)
    return ok(undefined)
  } catch (error) {
    return failFromError(error)
  }
}

/**
 * Produce the customer Estimate from the selected supplier offers.
 *
 * Builds an EstimateInput directly rather than going through an Rfq: RfqLine
 * .productId is a required FK to Product, so free-text tender lines cannot live
 * there, while EstimateLine is {description, qty, rate} with no product at all.
 * The existing PDF, totals and VAT code therefore need no changes.
 *
 * Every line is snapshotted into QuoteLine WITH its cost and margin. Without
 * that, issuing R2 would rewrite what R1 said, because the estimate builder
 * reads live rows.
 */
export async function generateEnquiryQuote(formData: FormData): Promise<Result<{ code: string }>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)

    const parsed = z
      .object({
        enquiryId: z.string().uuid(),
        markupMode: z.enum(['percentage', 'absolute', 'target_margin']),
        markupValue: z.coerce.number().min(0),
        shipToCountryCode: z.string().trim().length(2).optional(),
      })
      .safeParse({
        enquiryId: formData.get('enquiryId'),
        markupMode: formData.get('markupMode') || 'percentage',
        markupValue: formData.get('markupValue') || '0',
        shipToCountryCode: formData.get('shipToCountryCode') || undefined,
      })
    if (!parsed.success) return failFromError(parsed.error)

    const enquiry = await db.enquiry.findUnique({
      where: { id: parsed.data.enquiryId },
      select: {
        id: true,
        code: true,
        title: true,
        buyerName: true,
        lines: {
          orderBy: { position: 'asc' },
          select: {
            id: true, position: true, description: true, qty: true, unit: true,
            offerLines: {
              where: { selectedAt: { not: null } },
              select: { id: true, unitPrice: true, offer: { select: { supplierName: true } } },
              take: 1,
            },
          },
        },
      },
    })
    if (!enquiry) return fail('NOT_FOUND', 'That enquiry no longer exists.')

    const priced = enquiry.lines
      .map((line) => {
        const chosen = line.offerLines[0]
        if (!chosen?.unitPrice) return null
        const landed = Number(chosen.unitPrice)
        const money = applyMarkup(landed, {
          mode: parsed.data.markupMode as MarkupMode,
          value: parsed.data.markupValue,
        })
        return { line, chosen, money, qty: line.qty ? Number(line.qty) : 1 }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    if (priced.length === 0) {
      return fail('PRECONDITION_FAILED', 'Select a supplier offer for at least one line first.')
    }

    const settings = await db.storeSettings.findFirst()
    const vat = computeVatRate({
      shipToCountryCode: parsed.data.shipToCountryCode ?? 'AE',
      ...(settings?.defaultVatRatePct ? { defaultRate: Number(settings.defaultVatRatePct) } : {}),
    })

    const totals = computeQuoteTotals({
      lines: priced.map((p) => ({ qty: p.qty, rate: p.money.sellPerUnitAed })),
      vatRatePct: vat.rate,
    })

    const validityDays = settings?.defaultQuoteValidityDays ?? 30
    const estimateDate = new Date()
    const branding = {
      legalName: settings?.legalName ?? 'Indus Hydraulic Power Trading LLC',
      vatTrn: settings?.vatTrn ?? null,
      addressLines: (settings?.registeredAddressLines as string[] | null) ?? [],
    }

    const codeResult = await nextQuoteCodeForEnquiry(enquiry.id)

    const pdf = await renderEstimatePdf({
      documentTitle: 'Estimate',
      code: codeResult.code,
      ...(codeResult.revision > 1 ? { revisionLabel: `r${codeResult.revision}` } : {}),
      estimateDate,
      expiryDate: new Date(estimateDate.getTime() + validityDays * 86_400_000),
      subject: enquiry.title,
      billTo: { name: enquiry.buyerName ?? 'Customer', addressLines: [] },
      lines: priced.map((p) => ({
        description: p.line.description,
        qty: p.qty,
        rate: p.money.sellPerUnitAed,
      })),
      currency: 'AED',
      vatRatePct: vat.rate,
      ...(vat.label ? { vatLabel: vat.label } : {}),
      branding,
      signature: {
        name: settings?.signatureName ?? 'Krishan Bhatia',
        title: settings?.signatureTitle ?? 'Managing Director',
        company: branding.legalName,
        phone: settings?.signaturePhone ?? null,
        email: settings?.signatureEmail ?? null,
        addressLines: branding.addressLines,
      },
      bank: null,
    })

    const upload = await uploadQuotePdf({
      pdf,
      fileSlug: codeResult.code.replace(/[^A-Za-z0-9]+/g, '-'),
    })

    const quote = await db.quote.create({
      data: {
        code: codeResult.code,
        enquiryId: enquiry.id,
        revision: codeResult.revision,
        subtotal: totals.subtotal,
        tax: totals.vatAmount,
        total: totals.total,
        currency: 'AED',
        pdfMediaId: upload.mediaId,
        lines: {
          create: priced.map((p, i) => ({
            position: i + 1,
            description: p.line.description,
            qty: p.qty,
            unitPrice: p.money.sellPerUnitAed,
            lineTotal: Math.round(p.qty * p.money.sellPerUnitAed * 100) / 100,
            landedUnitCostAed: p.money.landedPerUnitAed,
            markupMode: parsed.data.markupMode,
            markupValue: parsed.data.markupValue,
            marginPct: p.money.marginPct,
            supplierOfferLineId: p.chosen.id,
            enquiryLineId: p.line.id,
          })),
        },
      },
      select: { code: true },
    })

    await db.enquiry.update({ where: { id: enquiry.id }, data: { status: 'quoted' } })

    revalidatePath(`/admin/enquiries/${enquiry.code}`)
    revalidatePath(`/admin/enquiries/${enquiry.code}/pricing`)
    return ok({ code: quote.code })
  } catch (error) {
    return failFromError(error)
  }
}

/**
 * Attach an already-uploaded file to an enquiry.
 *
 * The bytes never pass through here. The browser uploads straight to storage
 * with a signed URL minted by the media library, and this only records the
 * finished Media row — Server Actions cap request bodies at 1 MB, so a route
 * that posts a 4 MB RFQ sheet through an action is rejected by the framework
 * before the action runs, and works perfectly in local development.
 */
export async function attachToEnquiry(formData: FormData): Promise<Result<{ id: string }>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.RFQ_REVIEW)

    const parsed = z
      .object({
        enquiryId: z.string().uuid(),
        mediaId: z.string().uuid(),
        filename: z.string().trim().min(1).max(300),
      })
      .safeParse({
        enquiryId: formData.get('enquiryId'),
        mediaId: formData.get('mediaId'),
        filename: formData.get('filename'),
      })
    if (!parsed.success) return failFromError(parsed.error)

    const [enquiry, media] = await Promise.all([
      db.enquiry.findUnique({ where: { id: parsed.data.enquiryId }, select: { id: true, code: true } }),
      db.media.findUnique({
        where: { id: parsed.data.mediaId },
        select: { id: true, mimeType: true, bytes: true },
      }),
    ])
    if (!enquiry) return fail('NOT_FOUND', 'That enquiry no longer exists.')
    if (!media) return fail('NOT_FOUND', 'That upload could not be found.')

    const attachment = await db.enquiryAttachment.upsert({
      where: { enquiryId_mediaId: { enquiryId: enquiry.id, mediaId: media.id } },
      create: {
        enquiryId: enquiry.id,
        mediaId: media.id,
        filename: parsed.data.filename,
        mimeType: media.mimeType,
        bytes: media.bytes,
        uploadedById: session?.user?.id ?? null,
      },
      update: {},
      select: { id: true },
    })

    revalidatePath(`/admin/enquiries/${enquiry.code}`)
    return ok({ id: attachment.id })
  } catch (error) {
    return failFromError(error)
  }
}

/**
 * Read line items out of an attachment and add them to the enquiry.
 *
 * Rows land as `needs_review` like every other extraction path, and each one
 * records both the verbatim text it came from and which attachment produced it,
 * so a wrong quantity can be traced back to the page it was read off.
 */
export async function extractAttachmentLines(formData: FormData): Promise<Result<{ added: number; status: string; note: string | null }>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)

    const parsed = z.object({ attachmentId: z.string().uuid() }).safeParse({
      attachmentId: formData.get('attachmentId'),
    })
    if (!parsed.success) return failFromError(parsed.error)

    const attachment = await db.enquiryAttachment.findUnique({
      where: { id: parsed.data.attachmentId },
      select: {
        id: true, filename: true, mimeType: true,
        enquiry: { select: { id: true, code: true } },
        media: { select: { storagePath: true } },
      },
    })
    if (!attachment) return fail('NOT_FOUND', 'That attachment no longer exists.')

    const url = await signedUrlFor(attachment.media.storagePath)
    if (!url) return fail('INTERNAL', 'That file could not be read from storage.')

    const res = await fetch(url)
    if (!res.ok) return fail('INTERNAL', 'That file could not be downloaded.')
    const buffer = Buffer.from(await res.arrayBuffer())

    const extraction = await extractFromAttachment({
      buffer,
      mimeType: attachment.mimeType,
      filename: attachment.filename,
    })

    let added = 0
    if (extraction.lines.length > 0) {
      const last = await db.enquiryLine.findFirst({
        where: { enquiryId: attachment.enquiry.id },
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      let position = (last?.position ?? 0) + 1

      await db.enquiryLine.createMany({
        data: extraction.lines.map((line) => ({
          enquiryId: attachment.enquiry.id,
          position: position++,
          description: line.description,
          partNumber: line.partNumber,
          qty: line.qty,
          unit: line.unit,
          certification: line.certification,
          sourceKind: 'attachment' as const,
          sourceText: line.sourceText,
          sourceAttachmentId: attachment.id,
          reviewFlags: line.qty == null ? ['qty_not_stated'] : [],
        })),
      })
      added = extraction.lines.length
    }

    await db.enquiryAttachment.update({
      where: { id: attachment.id },
      data: {
        extractionStatus: extraction.status,
        extractionNote: extraction.note,
        extractedLines: added,
        extractorName: extraction.extractorName,
        costUsdMicros: extraction.costUsdMicros,
      },
    })

    revalidatePath(`/admin/enquiries/${attachment.enquiry.code}`)
    return ok({ added, status: extraction.status, note: extraction.note })
  } catch (error) {
    return failFromError(error)
  }
}
