'use server'

import { z } from 'zod'
import { sendEmail } from '@indus/email'
import { loadEmailBranding } from '../../../lib/email-branding'

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
  formData: FormData,
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
  const branding = await loadEmailBranding()

  // Recipient: configured internal-alert addresses, or fall back to the
  // sales mailbox on the StoreSettings so the form never silently drops
  // a submission in environments where alert recipients aren't filled in.
  const recipients =
    branding.internalAlertEmails.length > 0
      ? branding.internalAlertEmails
      : [branding.fromEmail]

  const inquiryLabel = INQUIRY_TYPE_LABELS[data.inquiryType]
  const customerName = `${data.firstName} ${data.lastName}`.trim()
  const subject = `[Contact form · ${inquiryLabel}] ${data.company} — ${customerName}`

  const html = renderContactInquiryHtml({
    inquiryLabel,
    customerName,
    ...data,
  })

  const result = await sendEmail({
    kind: 'contact_inquiry',
    to: recipients,
    subject,
    html,
    fromEmail: branding.fromEmail,
    ...(branding.fromName ? { fromName: branding.fromName } : {}),
    replyTo: data.email,
  })

  if (!result.ok) {
    return {
      status: 'error',
      message: 'We could not send your message. Please try email or WhatsApp instead.',
    }
  }

  return { status: 'success', ref: result.sentEmailId.slice(0, 8).toUpperCase() }
}

function escape(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderContactInquiryHtml(input: {
  inquiryLabel: string
  customerName: string
  email: string
  phone?: string
  company: string
  industry?: string
  skus?: string
  message?: string
}): string {
  const rows: Array<[string, string]> = [
    ['Inquiry type', input.inquiryLabel],
    ['Name', input.customerName],
    ['Email', input.email],
    ['Phone / WhatsApp', input.phone || '—'],
    ['Company', input.company],
    ['Industry', input.industry || '—'],
    ['SKUs / part numbers', input.skus || '—'],
  ]
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;color:#6b6b6b;font-weight:500;width:160px;">${escape(label)}</th><td style="padding:6px 0;">${escape(value)}</td></tr>`,
    )
    .join('\n')

  const messageBlock = input.message
    ? `<h3 style="margin:24px 0 8px;font-size:14px;color:#6b6b6b;font-weight:500;">Message</h3><div style="white-space:pre-wrap;border-left:3px solid #e5e1d4;padding:8px 12px;color:#1a1a1a;">${escape(input.message)}</div>`
    : ''

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:600px;">
<h2 style="margin:0 0 16px;font-size:18px;">New contact form submission</h2>
<table style="border-collapse:collapse;font-size:14px;line-height:1.55;">
${rowsHtml}
</table>
${messageBlock}
<p style="margin-top:32px;font-size:12px;color:#6b6b6b;">Reply directly to this email to respond to ${escape(input.customerName)}.</p>
</div>`
}
