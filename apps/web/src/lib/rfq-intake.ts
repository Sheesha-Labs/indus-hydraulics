import 'server-only'

import { db, nextAccountCode } from '@indus/db'

/**
 * What every website enquiry form needs before it can record an RFQ: an
 * Account and contact for an anonymous submitter, so the enquiries inbox, the
 * customer's signed tracking link and the account history treat every form
 * alike.
 *
 * The forms — contact, export markets, manufacturing, quality control and the
 * designed industry page — all call this, then record the RFQ, then send the
 * one enquiry email (lib/enquiry-email.ts). The catalogue quote cart that
 * used to share it was retired in 2026-11.
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

  // No password hash is created. The storefront has no customer sign-in; the
  // Account exists so admin can group a buyer's RFQs and enquiries.
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
