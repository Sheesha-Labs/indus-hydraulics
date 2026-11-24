import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_BODY, TEMPLATE_COLUMN, TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

/**
 * The only kind of proposal that may be approved in a batch (L2 t4: "Batch actions exist only for chasers;
 * quotations are never batched"). A batch bar for anything else does not type-check.
 */
export type T4BatchKind = 'chasers'

export interface T4BatchBar {
  batchKind: T4BatchKind
  /** The bar: a count, "Approve all chasers" and its Undo. */
  children: ReactNode
}

interface T4Common {
  /** Shell `PageHeader` with the filter chips (All · Supplier RFQs · Quotations · Chasers · Judgement calls). */
  header: ReactNode
  banner?: ReactNode
  /** The open proposal: Assistant `ProposalCard`. */
  detail: ReactNode
  detailLabel?: string
}

/** T4a: the queue 440 at the left, the selected row's proposal at the right. */
export interface T4QueueProps extends T4Common {
  variant?: 'queue'
  /** Card `NeedsRow`s, the selected one opens `detail`. */
  queue: ReactNode
  queueLabel?: string
  /** Above the queue while the Chasers filter is on. Chasers only, by type. */
  batch?: T4BatchBar
}

/**
 * Board 194: one card approving a bundle of documents. A tab per document under the header; the document
 * and the bundle list at the left, the proposal (400) at the right. Nothing is batched across proposals.
 */
export interface T4BundleProps extends T4Common {
  variant: 'bundle'
  /** Controls `LinkTabs` (pane style), one tab per document. */
  documentTabs: ReactNode
  /** The selected document's card, then the bundle list. */
  bundle: ReactNode
  bundleLabel?: string
  batch?: never
}

/**
 * Board 204: a single approver's page (a payment the Assistant never approves). The checks at the left, the
 * status and instruction (440) at the right. No queue, so no batch bar.
 */
export interface T4SingleApproverProps extends T4Common {
  variant: 'single-approver'
  side: ReactNode
  sideLabel?: string
  batch?: never
}

/**
 * Board 104 (S06-T02): the Review page itself. The cards stream in the main column (grouped by record, the
 * first expanded) with the batch bar pinned at its foot; "Done for you today" and "Waiting on others" in a rail
 * on the right. `detail` is the stream.
 */
export interface T4StreamProps extends T4Common {
  variant: 'stream'
  rail: ReactNode
  railLabel?: string
  /** Sticky at the foot of the stream while batchable rows are checked. */
  batchBar?: ReactNode
}

export type T4ReviewProps = T4QueueProps | T4BundleProps | T4SingleApproverProps | T4StreamProps

/**
 * Template T4 · Review queue + detail (L2 t4a; variants for boards 194 and 204). Body padding 16 / 28,
 * columns 16 apart.
 */
export default function T4Review(props: T4ReviewProps) {
  const { header, banner, detail, detailLabel = 'Proposal' } = props
  const variant = props.variant ?? 'queue'
  return (
    <div data-template="T4" data-variant={variant} className={TEMPLATE_ROOT}>
      <div data-slot="header" className={TEMPLATE_TOP}>
        {header}
        {props.variant === 'bundle' ? (
          <div data-slot="document-tabs" className="flex-none">
            {props.documentTabs}
          </div>
        ) : null}
      </div>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      {props.variant === 'stream' ? (
        <div
          data-slot="body"
          className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_var(--io-w-wizard-rail)]"
        >
          <section
            data-slot="detail"
            aria-label={detailLabel}
            className="relative flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto px-7 pt-4 pb-4"
          >
            {detail}
            {props.batchBar ? (
              <div data-slot="batch" className="sticky bottom-0 mt-auto">
                {props.batchBar}
              </div>
            ) : null}
          </section>
          <aside
            data-slot="rail"
            aria-label={props.railLabel ?? 'Done today and waiting'}
            className="border-io-line flex min-h-0 flex-col gap-5 overflow-y-auto border-l px-5 py-4"
          >
            {props.rail}
          </aside>
        </div>
      ) : props.variant === 'bundle' ? (
        <div
          data-slot="body"
          className={cn(TEMPLATE_BODY, 'grid-cols-[minmax(0,1fr)_var(--io-w-detail)]')}
        >
          <section
            data-slot="bundle"
            aria-label={props.bundleLabel ?? 'Bundle'}
            className={TEMPLATE_COLUMN}
          >
            {props.bundle}
          </section>
          <section data-slot="detail" aria-label={detailLabel} className={TEMPLATE_COLUMN}>
            {detail}
          </section>
        </div>
      ) : props.variant === 'single-approver' ? (
        <div
          data-slot="body"
          className={cn(TEMPLATE_BODY, 'grid-cols-[minmax(0,1fr)_var(--io-w-queue)]')}
        >
          <section data-slot="detail" aria-label={detailLabel} className={TEMPLATE_COLUMN}>
            {detail}
          </section>
          <aside
            data-slot="side"
            aria-label={props.sideLabel ?? 'Status'}
            className={TEMPLATE_COLUMN}
          >
            {props.side}
          </aside>
        </div>
      ) : (
        <div
          data-slot="body"
          className={cn(TEMPLATE_BODY, 'grid-cols-[var(--io-w-queue)_minmax(0,1fr)]')}
        >
          <section
            data-slot="queue"
            aria-label={props.queueLabel ?? 'Review queue'}
            className={TEMPLATE_COLUMN}
          >
            {/* Runtime belt for untyped callers: only a chasers bar is ever drawn. */}
            {props.batch?.batchKind === 'chasers' ? (
              <div data-slot="batch" data-batch-kind="chasers">
                {props.batch.children}
              </div>
            ) : null}
            {props.queue}
          </section>
          <section data-slot="detail" aria-label={detailLabel} className={TEMPLATE_COLUMN}>
            {detail}
          </section>
        </div>
      )}
    </div>
  )
}
