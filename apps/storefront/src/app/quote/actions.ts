'use server'

import { redirect } from 'next/navigation'
import { auth } from '../../lib/auth'
import { db } from '@indus/db'
import { assertTransition } from '@indus/domain'

type LineItem = {
  sku: string
  qty: number
  targetPrice?: string
}

export async function submitRfq(formData: FormData) {
  const session = await auth()
  if (!session?.user?.accountId) {
    throw new Error('Not authenticated')
  }

  const locale = (formData.get('locale') as string) ?? 'en'
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
    throw new Error('Invalid line items')
  }

  if (!lines.length) {
    throw new Error('No items in quote')
  }

  // Find products by SKU
  const products = await db.product.findMany({
    where: { sku: { in: lines.map((l) => l.sku) } },
    select: { id: true, sku: true },
  })

  const productBySku = new Map(products.map((p) => [p.sku, p]))

  // Generate RFQ code
  const year = new Date().getFullYear()
  const count = await db.rfq.count()
  const code = `RFQ-${year}-${String(count + 1).padStart(4, '0')}`

  const rfq = await db.$transaction(async (tx) => {
    const created = await tx.rfq.create({
      data: {
        code,
        accountId: session.user.accountId,
        submittedByContactId: session.user.id,
        subject: subject || undefined,
        applicationContext: applicationContext || undefined,
        urgency,
        requestedDeliveryDate,
        shipToAddressId: shipToAddressId || undefined,
        customerMessage: customerMessage || undefined,
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

    await tx.accountActivity.create({
      data: {
        accountId: session.user.accountId,
        actorType: 'contact',
        actorId: session.user.id,
        verb: 'submitted_rfq',
        payload: { rfqId: created.id, code: created.code },
      },
    })

    return created
  })

  redirect(`/quote/${rfq.code}`)
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
