'use server'

import { db, nextEnquiryCode } from '@indus/db'
import { extractFromPaste } from '@indus/domain'
import { revalidatePath } from 'next/cache'
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
