import type { Route } from 'next'
import Link from 'next/link'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import ButtonLink from '../controls/ButtonLink'
import { cn } from '../lib/cn'
import Chip from '../status/Chip'
import StageTrack, { type StageTrackProps } from '../status/StageTrack'
import type { LinkSpec, Tone } from '../types'
import type { RecordTab } from './record-tabs'
import RecordTabs from './RecordTabs'

export type RecordHeaderKind = 'enquiry' | 'order' | 'tender'

export interface RecordHeaderMeta {
  label: string
  value: ReactNode
  /** Red value: a client deadline that is close. */
  tone?: 'bad'
}

/** The one primary action: a link, or a client element the page renders (an action button). */
export type RecordHeaderCta = { label: string; href: string } | ReactElement

export interface RecordHeaderProps {
  kind: RecordHeaderKind
  /** "Enquiries" or "Orders", linking to the index. */
  crumb: LinkSpec
  client: LinkSpec
  /** The crumb's bold reference: the enquiry number, which an order keeps (board 75, C11). */
  reference: string
  /** Instrument Serif 30: the page's only h1. */
  title: string
  /** Four values: client, client ref, received, deadline (enquiry) or value, quotation, delivery (order). */
  meta: readonly RecordHeaderMeta[]
  /** "Open thread in Mail ↗": the sales@ conversation. */
  threadHref?: string
  stage: StageTrackProps
  tabs: readonly RecordTab[]
  /** Fixes the active tab; otherwise it follows the URL (RecordTabs). */
  activeTab?: string
  /** Warn chip right of the crumb, e.g. "Waiting on client · 3 lines" or a tender countdown. */
  chip?: { label: string; tone: Tone }
  /** "Log activity" (secondary): a record-local drawer, so a link with a search param. */
  logActivityHref?: string
  cta: RecordHeaderCta
  className?: string
}

const CHIP_24 = 'h-6 px-[9px] text-[11.5px]'

/**
 * Shell kit `RecordHeader` (board 75, 05 §3.13): crumb, the one primary action, the serif title, four meta
 * values, the stage track and the record's tabs as links. Shared: only RecordTabs is client (it reads the
 * selected layout segment). Kinds: enquiry (11 tabs, C8), order (9 tabs, C11) and tender (a navy Tender
 * chip and the tender tab set, C9). The Assistant strip is its own part, rendered under it by the layout.
 *
 * Rows take the console's 1.45 line and -0.005em tracking, as board 75 sets them (its meta row and tabs are
 * 1–2px taller than the L1 sheet's, which mounts the part without them). The primary CTA keeps the dc's 14px
 * side padding including its 1px border, so it is no wider than the borderless button the board draws.
 */
export default function RecordHeader({
  kind,
  crumb,
  client,
  reference,
  title,
  meta,
  threadHref,
  stage,
  tabs,
  activeTab,
  chip,
  logActivityHref,
  cta,
  className,
}: RecordHeaderProps) {
  const tabsLabel =
    kind === 'order' ? 'Order sections' : kind === 'tender' ? 'Tender sections' : 'Enquiry sections'
  return (
    <header
      data-part="record-header"
      data-kind={kind}
      className={cn(
        'bg-io-card border-io-line text-io-ink flex flex-col gap-3 border-b px-7 pt-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <nav
          aria-label="Breadcrumb"
          className="text-io-ink-3 flex min-w-0 items-center gap-2 text-[12px]"
        >
          <Link href={crumb.href as Route} className="io-focus rounded-io-tag hover:text-io-ink">
            {crumb.label}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={client.href as Route}
            className="io-focus rounded-io-tag hover:text-io-ink truncate"
          >
            {client.label}
          </Link>
          <span aria-hidden="true">/</span>
          <b aria-current="page" className="text-io-ink-2 font-medium whitespace-nowrap">
            {reference}
          </b>
        </nav>
        <div className="flex flex-none items-center gap-2">
          {kind === 'tender' ? <Chip tone="navy" label="Tender" className={CHIP_24} /> : null}
          {chip ? <Chip tone={chip.tone} label={chip.label} className={CHIP_24} /> : null}
          {logActivityHref ? (
            <ButtonLink href={logActivityHref} className="px-3 text-[12.5px]">
              Log activity
            </ButtonLink>
          ) : null}
          {isValidElement(cta) ? (
            cta
          ) : (
            <ButtonLink variant="primary" href={cta.href} className="px-[13px] text-[12.5px]">
              {cta.label}
            </ButtonLink>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="io-display text-io-record">{title}</h1>
        <div className="text-io-ink-3 flex flex-wrap items-center gap-x-[18px] gap-y-1.5 text-[12.5px]">
          {meta.map((m) => (
            <span key={m.label} className="whitespace-nowrap">
              {m.label}{' '}
              <b className={cn('font-medium', m.tone === 'bad' ? 'text-io-bad' : 'text-io-ink')}>
                {m.value}
              </b>
            </span>
          ))}
          {threadHref ? (
            <Link
              href={threadHref as Route}
              className="text-io-accent io-focus rounded-io-tag font-medium hover:underline"
            >
              Open thread in Mail ↗
            </Link>
          ) : null}
        </div>
      </div>
      <StageTrack {...stage} />
      <RecordTabs tabs={tabs} aria-label={tabsLabel} {...(activeTab ? { active: activeTab } : {})} />
    </header>
  )
}
