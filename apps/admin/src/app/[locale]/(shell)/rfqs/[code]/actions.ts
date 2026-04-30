'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import { assertTransition } from '@indus/domain'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'

const Locale = z.string().min(1).default('en')

const UpdateRfqStatusInput = z.object({
  rfqId: z.string().uuid(),
  to: z.string().min(1),
  locale: Locale,
})

export async function updateRfqStatus(rfqId: string, to: string, locale: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)
    const parsed = UpdateRfqStatusInput.parse({ rfqId, to, locale })

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

    revalidatePath(`/${parsed.locale}/rfqs`)
    revalidatePath(`/${parsed.locale}/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function assignEngineer(rfqId: string, engineerId: string, locale: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)
    z.string().uuid().parse(rfqId)
    z.string().uuid().parse(engineerId)

    await db.rfq.update({
      where: { id: rfqId },
      data: { assignedEngineerId: engineerId },
    })

    revalidatePath(`/${locale}/rfqs`)
    revalidatePath(`/${locale}/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const SaveLineReviewSchema = z.object({
  rfqId: z.string().uuid(),
  locale: Locale,
  internalNotes: z.string().optional().transform((v) => v ?? null),
})

export async function saveLineReview(formData: FormData): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.RFQ_REVIEW)
    const parsed = SaveLineReviewSchema.parse({
      rfqId: formData.get('rfqId'),
      locale: formData.get('locale') ?? 'en',
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

    revalidatePath(`/${parsed.locale}/rfqs/[code]`, 'page')
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
