'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '../../lib/auth'
import { db, nextRfqCode, nextAccountCode } from '@indus/db'
import { assertTransition, signQuoteAccessToken } from '@indus/domain'
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

    await tx.accountActivity.create({
      data: {
        accountId,
        actorType: 'contact',
        actorId: contactId,
        verb: 'submitted_rfq',
        payload: { rfqId: created.id, code: created.code, anonymous: isAnonymous },
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

  // Anonymous submitters don't have a session — sign them a short-lived
  // access token so they can view their RFQ confirmation + download any
  // future quote PDF without creating an account.
  if (isAnonymous) {
    const token = signQuoteAccessToken(rfq.code)
    redirect(`/quote/${rfq.code}?token=${encodeURIComponent(token)}`)
  }

  redirect(`/quote/${rfq.code}`)
}

async function resolveOrCreateAnonymousContact(input: z.infer<typeof AnonymousContactSchema>): Promise<{ accountId: string; contactId: string }> {
  // If the email already exists, reattach to that account. The risk of
  // someone submitting under a known email is bounded by the fact that the
  // confirmation email lands at that address — the real owner sees the RFQ
  // and can flag misuse. Admin sees an `internalNotes` flag either way.
  const existing = await db.accountContact.findUnique({
    where: { email: input.email },
    select: { id: true, accountId: true },
  })

  if (existing) {
    return { accountId: existing.accountId, contactId: existing.id }
  }

  // No existing contact — create a prospect Account + AccountContact. We
  // skip password-hash creation; the user can claim the account later via
  // /forgot-password using the same email.
  return db.$transaction(async (tx) => {
    const code = await nextAccountCode(tx)
    const account = await tx.account.create({
      data: {
        code,
        legalName: input.company,
        displayName: input.company,
        status: 'prospect',
        tier: 'bronze',
      },
      select: { id: true },
    })
    const contact = await tx.accountContact.create({
      data: {
        accountId: account.id,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || undefined,
        isActive: true,
      },
      select: { id: true },
    })
    return { accountId: account.id, contactId: contact.id }
  })
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
