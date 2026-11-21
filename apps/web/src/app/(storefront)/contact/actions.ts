'use server'

import { z } from 'zod'
import { db, nextRfqCode } from '@indus/db'
import { sendEnquiryEmail } from '../../../lib/enquiry-email'
import { resolveOrCreateAnonymousContact } from '../../../lib/rfq-intake'
import { urlFor } from '../../../lib/seo'

const InquiryTypeSchema = z.enum(['quotation', 'application', 'general'])

const ContactFormSchema = z.object({
  inquiryType: InquiryTypeSchema.default('quotation'),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(200),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  company: z.string().trim().min(1, 'Company is required').max(200),
  industry: z.string().trim().max(100).optional().or(z.literal('')),
  skus: z.string().trim().max(500).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
})

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success'; ref: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

const INQUIRY_TYPE_LABELS: Record<z.infer<typeof InquiryTypeSchema>, string> = {
  quotation: 'Quotation request',
  application: 'Application help',
  general: 'General enquiry',
}

// Anti-spam: humans take a few seconds to fill the contact form. Bots
// submit instantly. Threshold kept generous so paste-and-go users aren't
// blocked.
const MIN_FORM_DURATION_MS = 1500

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot — real browsers never populate this. Show a generic success
  // state so the bot never learns we filtered it.
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return { status: 'success', ref: 'OK' }
  }

  const startedAtRaw = formData.get('formStartedAt')
  const startedAt = typeof startedAtRaw === 'string' ? Number(startedAtRaw) : NaN
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_FORM_DURATION_MS) {
      return { status: 'success', ref: 'OK' }
    }
  }

  const parsed = ContactFormSchema.safeParse({
    inquiryType: formData.get('inquiryType') ?? undefined,
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    company: formData.get('company'),
    industry: formData.get('industry') ?? '',
    skus: formData.get('skus') ?? '',
    message: formData.get('message') ?? '',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message
      }
    }
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors }
  }

  const data = parsed.data
  const inquiryLabel = INQUIRY_TYPE_LABELS[data.inquiryType]
  const customerName = `${data.firstName} ${data.lastName}`.trim()

  /*
    Recorded first, as an RFQ, so the enquiry lands in /admin/enquiries with
    every other website enquiry. This form used to send an email and nothing
    else: a bounced or filtered mail lost the lead with no trace in admin.
  */
  let rfq: { id: string; code: string } | null = null
  try {
    const { accountId, contactId } = await resolveOrCreateAnonymousContact({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      ...(data.phone ? { phone: data.phone } : {}),
      company: data.company,
    })
    const applicationContext = [
      `Enquiry type: ${inquiryLabel}`,
      data.industry ? `Industry: ${data.industry}` : null,
      data.skus ? `Part numbers: ${data.skus}` : null,
      'Source: contact page form',
    ]
      .filter((line): line is string => line !== null)
      .join('\n')

    rfq = await db.$transaction(async (tx) => {
      const code = await nextRfqCode(tx)
      const created = await tx.rfq.create({
        data: {
          code,
          accountId,
          submittedByContactId: contactId,
          subject: `${inquiryLabel} — contact form`,
          applicationContext,
          currency: 'AED',
          customerMessage: data.message || null,
          internalNotes:
            'Submitted from the contact page — verify contact details before fulfilment.',
          status: 'submitted',
          submittedAt: new Date(),
        },
        select: { id: true, code: true },
      })
      await tx.accountActivity.create({
        data: {
          accountId,
          actorType: 'contact',
          actorId: contactId,
          verb: 'submitted_rfq',
          payload: {
            rfqId: created.id,
            code: created.code,
            anonymous: true,
            inquiryType: data.inquiryType,
            source: 'contact_page_form',
          },
        },
      })
      return created
    })
  } catch (err) {
    // Never shown to the visitor; the email below still reaches the desk.
    console.error('[submitContactForm] could not record the enquiry', err)
  }

  const emailed = await sendEnquiryEmail({
    ...(rfq ? { rfqId: rfq.id } : {}),
    reference: rfq?.code ?? null,
    formLabel: `Contact form · ${inquiryLabel}`,
    senderName: customerName,
    senderEmail: data.email,
    company: data.company,
    details: [
      ['Phone / WhatsApp', data.phone],
      ['Industry', data.industry],
      ['Part numbers', data.skus],
    ],
    message: data.message || null,
    pageUrl: urlFor('/contact'),
  })

  // Lost only when it was neither recorded nor sent.
  if (!rfq && !emailed) {
    return {
      status: 'error',
      message: 'We could not send your message. Please try email or WhatsApp instead.',
    }
  }

  return { status: 'success', ref: rfq?.code ?? 'Received' }
}
