import type { ReactNode } from 'react'

/**
 * The storefront reference table — mono, tabular figures, a surface-2 header
 * row in uppercase mono, hairlines between rows.
 *
 * Deliberately the storefront convention (ProductSizeTable, the dash chart)
 * rather than `@indus/ui`'s Table, whose sans header was an admin decision.
 * Server-rendered semantic markup on purpose: these tables are the content, and
 * an answer engine cannot cite a chart it has to execute JavaScript to see.
 *
 * The wrapper scrolls sideways on its own, so a wide table never widens the
 * page.
 */

export const TH =
  'whitespace-nowrap px-3.5 py-2.5 text-left align-bottom font-medium text-[10.5px] uppercase tracking-[0.08em] text-ih-muted'
export const TH_NUM = `${TH} text-right`
export const TD = 'whitespace-nowrap px-3.5 py-2.5 text-ih-ink-2'
export const TD_NUM = `${TD} text-right`
export const TD_ROW_HEAD = 'whitespace-nowrap px-3.5 py-2.5 text-left font-medium text-ih-ink'
/** A row in a reference table. Hover is instant, as in every dense table here. */
export const TR = 'border-t border-ih-border hover:bg-ih-surface-2'

export function RefTable({
  caption,
  captionHidden = false,
  minWidthClass = 'min-w-[560px]',
  head,
  children,
}: {
  caption: string
  /** Keep the caption for screen readers when a heading already names the table. */
  captionHidden?: boolean
  minWidthClass?: string
  head: ReactNode
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ih-border bg-ih-surface">
      <table className={`w-full border-collapse font-mono text-[13px] tabular-nums ${minWidthClass}`}>
        <caption
          className={
            captionHidden
              ? 'sr-only'
              : 'caption-top border-b border-ih-border px-3.5 py-2.5 text-left text-[10.5px] uppercase tracking-[0.12em] text-ih-muted'
          }
        >
          {caption}
        </caption>
        <thead className="bg-ih-surface-2">{head}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

/** A dimension in both units: inches first, millimetres muted beside it. */
export function Dual({ inches, millimetres }: { inches: string; millimetres: string }) {
  return (
    <>
      {inches}
      <span className="ml-2 text-ih-muted">{millimetres}</span>
    </>
  )
}
