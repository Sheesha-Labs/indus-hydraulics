'use server'

import { redirect } from 'next/navigation'
import { auth } from '../../lib/auth'
import { db } from '@indus/db'
import { assertTransition } from '@indus/domain'
import {
  sendEmail,
  renderRfqConfirmation,
  renderRfqInternalAlert,
} from '@indus/email'
import { loadEmailBranding } from '../../lib/email-branding'

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

  const products = await db.product.findMany({
    where: { sku: { in: lines.map((l) => l.sku) } },
    select: { id: true, sku: true },
  })

  const productBySku = new Map(products.map((p) => [p.sku, p]))

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
      contactId: session.user.id,
      accountId: session.user.accountId,
      shipToAddressId: shipToAddressId ?? null,
    })
  } catch (err) {
     
    console.error('[submitRfq] email send error', err)
  }

  redirect(`/quote/${rfq.code}`)
}

type SendRfqEmailsInput = {
  rfqId: string
  rfqCode: string
  urgency: 'routine' | 'priority' | 'plant_down'
  lineCount: number
  subject: string | null
  customerMessage: string | null
  contactId: string
  accountId: string
  shipToAddressId: string | null
}

async function sendRfqEmails(input: SendRfqEmailsInput): Promise<void> {
  const [contact, account, shipTo, branding] = await Promise.all([
    db.accountContact.findUnique({
      where: { id: input.contactId },
      select: { firstName: true, lastName: true, email: true },
    }),
    db.account.findUnique({
      where: { id: input.accountId },
      select: { legalName: true },
    }),
    input.shipToAddressId
      ? db.accountAddress.findUnique({
          where: { id: input.shipToAddressId },
          select: { city: true, countryCode: true },
        })
      : Promise.resolve(null),
    loadEmailBranding(),
  ])

  if (!contact || !account) return

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001').replace(/\/$/, '')

  const customerName = `${contact.firstName} ${contact.lastName}`.trim() || contact.email

  // 1. Customer confirmation
  const confirmation = renderRfqConfirmation({
    rfqCode: input.rfqCode,
    customerName,
    lineCount: input.lineCount,
    urgency: input.urgency,
    trackingUrl: `${baseUrl}/quote/${input.rfqCode}`,
    branding: {
      legalName: branding.legalName,
      vatTrn: branding.vatTrn,
      registeredAddressLines: branding.registeredAddressLines,
      signatureName: branding.signatureName,
      signatureTitle: branding.signatureTitle,
      signaturePhone: branding.signaturePhone,
      signatureEmail: branding.signatureEmail,
    },
  })

  await sendEmail({
    kind: 'rfq_confirmation',
    to: [contact.email],
    subject: confirmation.subject,
    html: confirmation.html,
    fromEmail: branding.fromEmail,
    ...(branding.fromName ? { fromName: branding.fromName } : {}),
    ...(branding.replyTo ? { replyTo: branding.replyTo } : {}),
    rfqId: input.rfqId,
  })

  // 2. Internal alert — only if recipients are configured
  if (branding.internalAlertEmails.length > 0) {
    const alert = renderRfqInternalAlert({
      rfqCode: input.rfqCode,
      accountLegalName: account.legalName,
      submittedByName: customerName,
      submittedByEmail: contact.email,
      urgency: input.urgency,
      lineCount: input.lineCount,
      subject: input.subject,
      customerMessage: input.customerMessage,
      shipToCity: shipTo?.city ?? null,
      shipToCountry: shipTo?.countryCode ?? null,
      adminUrl: `${adminUrl}/rfqs/${input.rfqCode}`,
      branding: {
        legalName: branding.legalName,
        vatTrn: branding.vatTrn,
        registeredAddressLines: branding.registeredAddressLines,
      },
    })

    await sendEmail({
      kind: 'rfq_internal_alert',
      to: branding.internalAlertEmails,
      subject: alert.subject,
      html: alert.html,
      fromEmail: branding.fromEmail,
      ...(branding.fromName ? { fromName: branding.fromName } : {}),
      ...(branding.replyTo ? { replyTo: branding.replyTo } : {}),
      rfqId: input.rfqId,
    })
  }
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
