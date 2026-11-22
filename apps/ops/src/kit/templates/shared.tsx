import { needLabel } from '@indus/ops-core'
import {
  AssistantStrip,
  LogoPlaceholder,
  RecordHeader,
  type RecordHeaderProps,
  type RecordTab,
} from '@indus/ops-ui/shell'
import type { ReactNode } from 'react'
import { recordTabItems } from '../../lib/record-tabs'
import { HEADERS } from '../fixtures'

// Shared pieces of the template specimens (/_kit/templates/<t>): the record header and strip for the T2,
// T5 and T6 boards, and the base href every specimen link points at. Neutral fixtures only.

const H = HEADERS
export const ENQ = H.enquiryRef

/** Where a specimen's links go: back to the same specimen with a query, so nothing 404s. */
export const specimenHref = (slug: string, query: string) => `/_kit/templates/${slug}?${query}`

/** The nine enquiry tabs the T2 / T5 / T6 boards draw (the product's eleven are ENQUIRY_TABS, C8). */
const BOARD_ENQUIRY_TABS: RecordTab[] = H.boardEnquiryTabs.map((label) => {
  const segment = label === 'Overview' ? '' : label.toLowerCase()
  return {
    key: label.toLowerCase(),
    label,
    segment,
    href: segment ? `/enquiries/${ENQ}/${segment}` : `/enquiries/${ENQ}`,
  }
})

type Core = Omit<RecordHeaderProps, 'cta' | 'tabs' | 'activeTab'>

const ENQUIRY: Core = {
  kind: 'enquiry',
  crumb: { label: 'Enquiries', href: '/enquiries' },
  client: H.client,
  reference: ENQ,
  title: H.enquiryTitle,
  meta: H.enquiryMeta,
  threadHref: `/mail/clients?record=${ENQ}`,
  stage: { flow: 'enquiry', current: 'Quotes in' },
}

const ORDER: Core = {
  kind: 'order',
  crumb: { label: 'Orders', href: '/orders' },
  client: H.client,
  reference: H.orderEnquiryRef,
  title: H.orderTitle,
  meta: H.orderMeta,
  threadHref: `/mail/clients?record=${H.orderEnquiryRef}`,
  stage: { flow: 'order', current: 'Freight' },
}

/**
 * The T2 boards mount RecordHeader.dc without the console's 1.45 line height (their header is 207 high
 * where board 75's is 210, the same parts). S02-T02 recreated that for its T2A / T2B crops; the specimens
 * do the same so the template body below starts where the boards put it. The product header keeps 210.
 */
const BOARD_HEADER = 'flex flex-col [&_[data-part=record-header]]:leading-[normal]'

export interface SpecimenRecordProps {
  slug: string
  kind: 'enquiry' | 'order'
  tab: string
  stage?: string
  cta: string
  ctaSegment: string
  did: string
  needs?: number
}

/** The T2 `header` and `strip` slots for a specimen: RecordHeader on a tab, and the Assistant strip. */
export function specimenRecord({
  slug,
  kind,
  tab,
  stage,
  cta,
  ctaSegment,
  did,
  needs,
}: SpecimenRecordProps): { header: ReactNode; strip: ReactNode } {
  const core = kind === 'order' ? ORDER : ENQUIRY
  const ref = kind === 'order' ? H.orderRef : ENQ
  const base = kind === 'order' ? `/orders/${ref}` : `/enquiries/${ref}`
  return {
    header: (
      <div className={BOARD_HEADER}>
        <RecordHeader
          {...core}
          {...(stage ? { stage: { ...core.stage, current: stage } as Core['stage'] } : {})}
          tabs={kind === 'order' ? recordTabItems('order', ref) : BOARD_ENQUIRY_TABS}
          activeTab={tab}
          logActivityHref={specimenHref(slug, 'log=1')}
          cta={{ label: cta, href: `${base}/${ctaSegment}` }}
        />
      </div>
    ),
    strip: (
      <AssistantStrip
        recordKey={`record:${ref}`}
        did={did}
        {...(needs ? { need: { label: needLabel(needs), href: `/review?record=${ref}` } } : {})}
      />
    ),
  }
}

/** The logo slot at the height a board draws it (26 wizard, 30 sign-in and sidebar, 34 client brand bar). */
const LOGO_HEIGHT = { 26: 'h-[26px]', 30: 'h-[30px]', 34: 'h-[34px]' } as const

export function LogoSlot({ height }: { height: keyof typeof LOGO_HEIGHT }) {
  return (
    <span data-logo className={`flex items-center overflow-hidden ${LOGO_HEIGHT[height]}`}>
      <LogoPlaceholder />
    </span>
  )
}

/** The product mark the wizard and sign-in boards draw: the logo slot and "Operations". */
export function ProductMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoSlot height={size === 'lg' ? 30 : 26} />
      <span
        className={
          size === 'lg'
            ? 'text-io-navy text-[15px] font-semibold'
            : 'text-io-navy text-[13px] font-semibold'
        }
      >
        Operations
      </span>
    </span>
  )
}
