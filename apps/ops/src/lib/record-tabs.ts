// The record cockpit's tab sets (C8, C9, C11). Each tab is a link to its own route segment; the header marks
// the active one from the selected layout segments (RecordTabs). `segment` is the path below the record
// layout (enquiries/[ref] or orders/[ref]); '' is the record's own page.
//
// Hrefs are template-literal typed: the folders arrive with the S02-T07 route tree, and until they exist the
// generated typedRoutes `Route` type cannot name them. T07 checks these same strings against its folders.
import type { RecordKind } from '@indus/ops-core'

export interface RecordTabDef<H extends string = string> {
  key: string
  label: string
  /** Path below the record layout; '' for the record's own page. */
  segment: string
  href: (ref: string) => H
}

type EnquiryHref = `/enquiries/${string}`
type OrderHref = `/orders/${string}`

const enquiryTab = (key: string, label: string, segment = key): RecordTabDef<EnquiryHref> => ({
  key,
  label,
  segment,
  href: (ref) => (segment ? `/enquiries/${ref}/${segment}` : `/enquiries/${ref}`),
})

const orderTab = (key: string, label: string): RecordTabDef<OrderHref> => ({
  key,
  label,
  segment: key,
  href: (ref) => `/orders/${ref}/${key}`,
})

const tenderTab = (key: string, label: string): RecordTabDef<EnquiryHref> => ({
  key,
  label,
  segment: `tender/${key}`,
  href: (ref) => `/enquiries/${ref}/tender/${key}`,
})

/** C8: eleven enquiry tabs. Overview is the record's own page (`/enquiries/[ref]`). */
export const ENQUIRY_TABS = [
  enquiryTab('overview', 'Overview', ''),
  enquiryTab('lines', 'Lines'),
  enquiryTab('suppliers', 'Suppliers'),
  enquiryTab('rfqs', 'RFQs'),
  enquiryTab('questions', 'Questions'),
  enquiryTab('compare', 'Compare'),
  enquiryTab('deviations', 'Deviations'),
  enquiryTab('pricing', 'Pricing'),
  enquiryTab('quotation', 'Quotation'),
  enquiryTab('files', 'Files'),
  enquiryTab('activity', 'Activity'),
] as const satisfies readonly RecordTabDef<EnquiryHref>[]

/** Board 75 / C11: nine order tabs. `/orders/[ref]` itself redirects to Confirmation (S02-T07). */
export const ORDER_TABS = [
  orderTab('confirmation', 'Confirmation'),
  orderTab('advance', 'Advance'),
  orderTab('suppliers', 'Suppliers'),
  orderTab('inspection', 'Inspection'),
  orderTab('freight', 'Freight'),
  orderTab('documents', 'Documents'),
  orderTab('delivery', 'Delivery'),
  orderTab('invoices', 'Invoices'),
  orderTab('profit', 'Profit'),
] as const satisfies readonly RecordTabDef<OrderHref>[]

/** The five tender sections, routed as `/enquiries/[ref]/tender/[section]` (C9). */
export const TENDER_SECTIONS = ['timeline', 'requirements', 'queries', 'vendors', 'bid'] as const
export type TenderSection = (typeof TENDER_SECTIONS)[number]

/**
 * C9: a tender shows its five sections first, then the enquiry tabs it still works through (sourcing runs
 * the normal flow; the bid pack consumes Pricing). Those keep their enquiry routes.
 */
export const TENDER_TABS = [
  tenderTab('timeline', 'Timeline'),
  tenderTab('requirements', 'Requirements'),
  tenderTab('queries', 'Queries'),
  tenderTab('vendors', 'Vendors'),
  tenderTab('bid', 'Bid'),
  enquiryTab('lines', 'Lines'),
  enquiryTab('suppliers', 'Suppliers'),
  enquiryTab('rfqs', 'RFQs'),
  enquiryTab('compare', 'Compare'),
  enquiryTab('pricing', 'Pricing'),
  enquiryTab('files', 'Files'),
  enquiryTab('activity', 'Activity'),
] as const satisfies readonly RecordTabDef<EnquiryHref>[]

export function tabsFor(kind: RecordKind): readonly RecordTabDef[] {
  return kind === 'order' ? ORDER_TABS : kind === 'tender' ? TENDER_TABS : ENQUIRY_TABS
}

/**
 * The tab set as RecordHeader items for one record: { key, label, segment, href } with the href resolved,
 * plus counts by key where the page knows them.
 */
export function recordTabItems(
  kind: RecordKind,
  ref: string,
  counts: Partial<Record<string, number>> = {}
): { key: string; label: string; segment: string; href: string; count?: number }[] {
  return tabsFor(kind).map((t) => {
    const count = counts[t.key]
    return {
      key: t.key,
      label: t.label,
      segment: t.segment,
      href: t.href(ref),
      ...(count === undefined ? {} : { count }),
    }
  })
}
