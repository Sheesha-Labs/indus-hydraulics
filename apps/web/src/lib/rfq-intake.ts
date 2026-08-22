import 'server-only'

import { db, nextAccountCode } from '@indus/db'
import { renderRfqConfirmation, renderRfqInternalAlert, sendEmail } from '@indus/email'
import { loadEmailBranding } from './email-branding'

/**
 * The two things every RFQ intake path needs, wherever the enquiry came from.
 *
 * There are two intakes now — the catalogue quote builder at `/quote/submit`,
 * which carries product lines, and the export-market pages, which carry a
 * free-text part list. They differ in what they collect and agree on
 * everything that happens afterwards: an anonymous submitter has to land in an
 * Account so the admin queue, the customer's signed tracking link and the
 * confirmation email all treat them identically, and both emails have to fire.
 *
 * These lived inside `(storefront)/quote/actions.ts` while there was one
 * caller. They are here so the second caller inherits the behaviour rather
 * than a copy of it — in particular the bucket-prefixed attachment paths, the
 * `prospect` account status and the admin URL, each of which has been wrong
 * once already and is not obvious enough to get right twice independently.
 */

export type AnonymousContactInput = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
}

/**
 * Resolve an anonymous submitter to an account and contact, creating a
 * prospect account if the email is new.
 *
 * If the email already exists we reattach to that account. The risk of someone
 * submitting under a known email is bounded by the confirmation landing at
 * that address — the real owner sees the RFQ and can flag misuse — and admin
 * sees an `internalNotes` flag either way.
 */
export async function resolveOrCreateAnonymousContact(
  input: AnonymousContactInput
): Promise<{ accountId: string; contactId: string }> {
  const existing = await db.accountContact.findUnique({
    where: { email: input.email },
    select: { id: true, accountId: true },
  })

  if (existing) {
    return { accountId: existing.accountId, contactId: existing.id }
  }

  // No password hash is created; the user can claim the account later via
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

export type SendRfqEmailsInput = {
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

/**
 * Fire the customer confirmation and the internal alert.
 *
 * Callers wrap this in a try/catch and swallow failures: the RFQ is already
 * committed by the time this runs, and losing the enquiry because a mail
 * relay was briefly down would be far worse than a missing notification.
 */
export async function sendRfqEmails(input: SendRfqEmailsInput): Promise<void> {
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
      // Admin is served from /admin on this same origin since the merge. This
      // used to build ${NEXT_PUBLIC_ADMIN_URL}/rfqs/... — on one domain that
      // resolves to a storefront 404, so the internal "new RFQ" notification
      // sent staff to a dead link.
      adminUrl: `${baseUrl}/admin/rfqs/${input.rfqCode}`,
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
