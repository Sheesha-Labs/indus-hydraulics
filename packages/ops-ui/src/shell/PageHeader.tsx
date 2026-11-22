import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import Chip from '../status/Chip'
import Tag from '../status/Tag'
import type { Tone } from '../types'

export interface PageHeaderStep {
  label: string
  state: 'done' | 'current' | 'todo'
}

export interface PageHeaderProps {
  /** 11.5 ink-3 line above the title ("Selling", "Directory"). */
  crumb?: string
  /** 18/500: the page's h1 on index pages. */
  title: string
  /** 12.5 ink-3 text right of the title block. */
  meta?: ReactNode
  /** A level tag (white, line border). */
  tag?: string
  chip?: { label: string; tone: Tone }
  /** Pills joined by dashes: done accent, current navy, todo line (kit "+done|*current"). */
  steps?: readonly PageHeaderStep[]
  /** A Controls Segmented. */
  segmented?: ReactNode
  /** Controls LinkTabs (pane style); their bottom rule is dropped here. */
  tabs?: ReactNode
  /** Buttons, at most one of them primary (one primary action per view). */
  actions?: ReactNode
  /** The lg SearchInput row (parts, search). */
  search?: ReactNode
  /** The filter row: Controls Choices (`hrefFor` from URL state). */
  filters?: ReactNode
  /** Right of the filters, 12 ink-3: "Awaiting decision: USD 612,400 · weighted USD 318,900". */
  summary?: ReactNode
  /** Width from the frame: full width in the console, `w-fit` in a specimen row. */
  className?: string
}

/**
 * Shell kit `PageHeader` (05 §3.13): the index-page header. A 60-high top row (crumb over the h1 left; steps,
 * meta, tag, chip, segmented, tabs and actions right), an optional lg search row and an optional filter row
 * with a summary. Shared.
 */
export default function PageHeader({
  crumb,
  title,
  meta,
  tag,
  chip,
  steps,
  segmented,
  tabs,
  actions,
  search,
  filters,
  summary,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-part="page-header"
      className={cn('bg-io-card border-io-line flex w-full flex-none flex-col border-b', className)}
    >
      <div className="h-io-header flex items-center justify-between gap-4 px-7">
        <div className="flex min-w-0 flex-col leading-[1.2]">
          {crumb ? <span className="text-io-ink-3 text-[11.5px]">{crumb}</span> : null}
          <h1 className="text-io-page truncate leading-[1.2]">{title}</h1>
        </div>
        <div className="flex flex-none items-center gap-2">
          {steps?.length ? <Steps steps={steps} /> : null}
          {meta ? (
            <span className="text-io-ink-3 text-[12.5px] whitespace-nowrap">{meta}</span>
          ) : null}
          {tag ? <Tag kind="level">{tag}</Tag> : null}
          {chip ? <Chip tone={chip.tone} label={chip.label} /> : null}
          {segmented}
          {tabs ? <div className="[&_nav]:border-b-0">{tabs}</div> : null}
          {actions}
        </div>
      </div>
      {search ? <div className="px-7 pb-3.5">{search}</div> : null}
      {filters ? (
        <div className="border-io-line flex flex-wrap items-center gap-1.5 border-t px-7 py-3">
          {filters}
          {summary ? <span className="text-io-ink-3 ml-auto text-[12px]">{summary}</span> : null}
        </div>
      ) : null}
    </header>
  )
}

/** `kh-steps`: an ordered list, the current step aria-current="step". */
function Steps({ steps }: { steps: readonly PageHeaderStep[] }) {
  return (
    <ol aria-label="Steps" className="flex flex-none items-center gap-1.5 text-[12px]">
      {steps.map((s, i) => (
        <li
          key={s.label}
          data-state={s.state}
          aria-current={s.state === 'current' ? 'step' : undefined}
          className="flex items-center gap-1.5"
        >
          {i > 0 ? (
            <span aria-hidden="true" className="text-io-ink-4">
              —
            </span>
          ) : null}
          <span
            className={cn(
              'rounded-io-pill border-io-line border px-2.5 py-1 whitespace-nowrap',
              s.state === 'done' && 'bg-io-accent border-io-accent text-white',
              s.state === 'current' && 'bg-io-navy border-io-navy text-white'
            )}
          >
            {s.label}
            {s.state === 'current' ? null : (
              <span className="sr-only">{s.state === 'done' ? ', done' : ', to do'}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}
