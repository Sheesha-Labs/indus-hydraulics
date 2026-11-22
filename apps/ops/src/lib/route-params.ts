// Route parameters (S02-T07, 05 §6.1): one Zod schema per dynamic segment of the route tree. A page or
// layout reads its params through `routeParam(schema, raw)`, which calls notFound() on a mismatch, so a
// malformed reference never reaches a data function. Pure apart from notFound(): safe in tests.
import { quotationFromSlug } from '@indus/ops-ui/format'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { TENDER_SECTIONS } from './record-tabs'

const upper = z.string().trim().toUpperCase()

/** ENQ-2026-0001 (C6). Case-insensitive in the URL; the canonical form is upper case. */
export const enquiryRef = upper.pipe(z.string().regex(/^ENQ-\d{4}-\d{4,}$/))

/**
 * SO-0001, and a split order's part SO-0001-B (C11). (decision) Any part letter, as parseReference
 * recognises it, not only B: a link the command bar resolves must open.
 */
export const orderRef = upper.pipe(z.string().regex(/^SO-\d{4,}(?:-[A-Z])?$/))

/** IH-RFQ-2611-P01: one supplier RFQ group of an enquiry (C6). */
export const rfqRef = upper.pipe(z.string().regex(/^IH-RFQ-\d{4}-P\d{2,}$/))

/**
 * `/quotations/Q10001-R2`: the quotation number without `INDUS/` (a slash cannot sit in a segment).
 * Parses to the stored number, INDUS/Q10001-R2.
 */
export const quotationNo = upper.transform((slug, ctx) => {
  const no = quotationFromSlug(slug)
  if (no === null) {
    ctx.addIssue({ code: 'custom', message: 'not a quotation number' })
    return z.NEVER
  }
  return no
})

/** `R2` on `/enquiries/[ref]/quotation/[rev]`: one revision of the enquiry's quotation. */
export const quotationRev = upper.pipe(z.string().regex(/^R\d{1,2}$/))

/**
 * `/money/invoices/INV10001`: a tax invoice number without `INDUS/` (INDUS/INV10001, a delivery split
 * INDUS/INV10001-02). Parses to the stored number.
 */
export const invoiceNo = upper
  .pipe(z.string().regex(/^INV\d{3,7}(?:-\d{2})?$/))
  .transform((slug) => `INDUS/${slug}`)

/** Every row id (UUIDv7): batches, leads, gaps, payments, suppliers, clients, parts, threads, documents. */
export const recordId = z.uuid()

/** `/money/close/2026-11`: a calendar month. */
export const month = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .refine((s) => {
    const m = Number(s.slice(5))
    return m >= 1 && m <= 12
  }, 'month out of range')

/** The mail folders (boards 91, 94). */
export const MAIL_FOLDERS = [
  'all',
  'needs-you',
  'unsure',
  'not-linked',
  'suppliers',
  'clients',
  'sent',
  'sales',
  'purchase',
  'handled',
] as const
export type MailFolder = (typeof MAIL_FOLDERS)[number]
export const mailFolder = z.enum(MAIL_FOLDERS)

/** First-run setup (boards 79–83, 84b). */
export const SETUP_STEPS = [
  'company',
  'mailboxes',
  'history',
  'money',
  'assistant',
  'invite',
] as const
export type SetupStep = (typeof SETUP_STEPS)[number]
export const setupStep = z.enum(SETUP_STEPS)

/** The five tender sections (C9); the same list RecordHeader's TENDER_TABS draws. */
export const tenderSection = z.enum(TENDER_SECTIONS)

/** The order exceptions (boards 195–201). */
export const ORDER_EXCEPTIONS = [
  'collection',
  'failed-inspection',
  'cannot-deliver',
  'client-change',
  'claim',
  'supplier-documents',
  'reissue',
] as const
export type OrderException = (typeof ORDER_EXCEPTIONS)[number]
export const orderExceptionKind = z.enum(ORDER_EXCEPTIONS)

/**
 * A supplier profile's sections (board 129's tabs; `history` from the record history work, `line-card`
 * from board 52). The profile's Overview is `/suppliers/[id]` itself.
 */
export const SUPPLIER_SECTIONS = [
  'contacts',
  'quotes',
  'prices',
  'orders',
  'documents',
  'notes',
  'history',
  'line-card',
] as const
export type SupplierSection = (typeof SUPPLIER_SECTIONS)[number]
export const supplierSection = z.enum(SUPPLIER_SECTIONS)

/** The three reports (boards 53–55). */
export const REPORTS = ['overdue', 'winloss', 'pipeline'] as const

/**
 * A signed link token: base64url, bounded so a pasted paragraph is not handed to the verifier. Client
 * pages (/q, /d, /s, /u) and the sign-in invite and reset links use it; the page verifies the signature.
 */
export const linkToken = z
  .string()
  .min(16)
  .max(512)
  .regex(/^[A-Za-z0-9_-]+$/)

/** A website quote code on `/q/legacy/[code]` (the retired storefront quote links, S21). */
export const legacyQuoteCode = z
  .string()
  .min(4)
  .max(64)
  .regex(/^[A-Za-z0-9-]+$/)

/** One wizard step slug in an optional catch-all (`/suppliers/new/…`, `/history-import/…`). */
const stepSlug = z.union([z.uuid(), z.string().regex(/^[a-z][a-z-]{0,39}$/)])

/** `[[...step]]`: absent (the wizard's start) or at most three slugs (`[draftId]/vetting`). */
export const wizardSteps = z.array(stepSlug).max(3).optional()

/** The parsed value, or notFound() (never a thrown validation error) when the param does not fit. */
export function routeParam<S extends z.ZodType>(schema: S, raw: unknown): z.output<S> {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) notFound()
  return parsed.data
}
