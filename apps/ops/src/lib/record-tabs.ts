// The record cockpit's tab sets (C8, C9, C11). Each tab is a link to its own route segment; the header marks
// the active one from the selected layout segments (RecordTabs). `segment` is the path below the record
// layout (enquiries/[ref] or orders/[ref]); '' is the record's own page.
//
// Every href is spelled out as a template literal through `to()` (lib/routes.ts), so `next typegen` (run
// by `next dev` and `next build`) checks each one against the folders of the route tree (S02-T07).
// route-tree.test.ts also resolves every tab to its page.tsx, so the check holds without generated types.
import type { RecordKind } from '@indus/ops-core'
import { to } from './routes'

export interface RecordTabDef {
  key: string
  label: string
  /** Path below the record layout; '' for the record's own page. */
  segment: string
  href: (ref: string) => string
}

/** C8: eleven enquiry tabs. Overview is the record's own page (`/enquiries/[ref]`). */
export const ENQUIRY_TABS = [
  { key: 'overview', label: 'Overview', segment: '', href: (r) => to(`/enquiries/${r}`) },
  { key: 'lines', label: 'Lines', segment: 'lines', href: (r) => to(`/enquiries/${r}/lines`) },
  {
    key: 'suppliers',
    label: 'Suppliers',
    segment: 'suppliers',
    href: (r) => to(`/enquiries/${r}/suppliers`),
  },
  { key: 'rfqs', label: 'RFQs', segment: 'rfqs', href: (r) => to(`/enquiries/${r}/rfqs`) },
  {
    key: 'questions',
    label: 'Questions',
    segment: 'questions',
    href: (r) => to(`/enquiries/${r}/questions`),
  },
  {
    key: 'compare',
    label: 'Compare',
    segment: 'compare',
    href: (r) => to(`/enquiries/${r}/compare`),
  },
  {
    key: 'deviations',
    label: 'Deviations',
    segment: 'deviations',
    href: (r) => to(`/enquiries/${r}/deviations`),
  },
  {
    key: 'pricing',
    label: 'Pricing',
    segment: 'pricing',
    href: (r) => to(`/enquiries/${r}/pricing`),
  },
  {
    key: 'quotation',
    label: 'Quotation',
    segment: 'quotation',
    href: (r) => to(`/enquiries/${r}/quotation`),
  },
  { key: 'files', label: 'Files', segment: 'files', href: (r) => to(`/enquiries/${r}/files`) },
  {
    key: 'activity',
    label: 'Activity',
    segment: 'activity',
    href: (r) => to(`/enquiries/${r}/activity`),
  },
] as const satisfies readonly RecordTabDef[]

/** Board 75 / C11: nine order tabs. `/orders/[ref]` itself redirects to Confirmation. */
export const ORDER_TABS = [
  {
    key: 'confirmation',
    label: 'Confirmation',
    segment: 'confirmation',
    href: (r) => to(`/orders/${r}/confirmation`),
  },
  { key: 'advance', label: 'Advance', segment: 'advance', href: (r) => to(`/orders/${r}/advance`) },
  {
    key: 'suppliers',
    label: 'Suppliers',
    segment: 'suppliers',
    href: (r) => to(`/orders/${r}/suppliers`),
  },
  {
    key: 'inspection',
    label: 'Inspection',
    segment: 'inspection',
    href: (r) => to(`/orders/${r}/inspection`),
  },
  { key: 'freight', label: 'Freight', segment: 'freight', href: (r) => to(`/orders/${r}/freight`) },
  {
    key: 'documents',
    label: 'Documents',
    segment: 'documents',
    href: (r) => to(`/orders/${r}/documents`),
  },
  {
    key: 'delivery',
    label: 'Delivery',
    segment: 'delivery',
    href: (r) => to(`/orders/${r}/delivery`),
  },
  {
    key: 'invoices',
    label: 'Invoices',
    segment: 'invoices',
    href: (r) => to(`/orders/${r}/invoices`),
  },
  { key: 'profit', label: 'Profit', segment: 'profit', href: (r) => to(`/orders/${r}/profit`) },
] as const satisfies readonly RecordTabDef[]

/** The five tender sections, routed as `/enquiries/[ref]/tender/[section]` (C9). */
export const TENDER_SECTIONS = ['timeline', 'requirements', 'queries', 'vendors', 'bid'] as const
export type TenderSection = (typeof TENDER_SECTIONS)[number]

const TENDER_LABEL: Readonly<Record<TenderSection, string>> = {
  timeline: 'Timeline',
  requirements: 'Requirements',
  queries: 'Queries',
  vendors: 'Vendors',
  bid: 'Bid',
}

/** One tender section tab. The section is a value of the `[section]` param, so one dynamic route. */
const tenderTab = (section: TenderSection): RecordTabDef => ({
  key: section,
  label: TENDER_LABEL[section],
  segment: `tender/${section}`,
  href: (r) => to(`/enquiries/${r}/tender/${section}`),
})

/** An enquiry tab a tender keeps, by key. */
const keep = (key: (typeof ENQUIRY_TABS)[number]['key']): RecordTabDef =>
  ENQUIRY_TABS.find((t) => t.key === key)!

/**
 * C9: a tender shows its five sections first, then the enquiry tabs it still works through (sourcing runs
 * the normal flow; the bid pack consumes Pricing). Those keep their enquiry routes.
 */
export const TENDER_TABS: readonly RecordTabDef[] = [
  ...TENDER_SECTIONS.map(tenderTab),
  keep('lines'),
  keep('suppliers'),
  keep('rfqs'),
  keep('compare'),
  keep('pricing'),
  keep('files'),
  keep('activity'),
]

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
