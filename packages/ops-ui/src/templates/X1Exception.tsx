import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

export interface X1ExceptionProps {
  /**
   * Shell `PageHeader`: the order crumb ("Orders / SO-0001 · client · client PO"), the exception as the
   * title, and a status chip or header tabs (Date | Quantity | Cancel). At most one primary here.
   */
  header: ReactNode
  banner?: ReactNode
  /**
   * The decision column (~705): what happened (Card `Note` quoting the source), facts and tables, the
   * Assistant `Option` decisions as radio cards, the documents it will draft. No primary: deciding is
   * choosing an option.
   */
  main: ReactNode
  mainLabel?: string
  /**
   * The drafted emails (~420): one card each (To <contact> · sales@|purchase@, the body, its own
   * "Approve and send" primary and Edit), then the "Also drafted" list and any rule.
   */
  side: ReactNode
  sideLabel?: string
  /**
   * 'default': the side column is 420 (boards 195, 198, 199). 'wide': 440, for document thumbnails or a
   * longer letter (boards 196, 201). Boards 194, 197 and 200 draw 400; they take the default.
   */
  variant?: 'default' | 'wide'
}

/**
 * Template X1 · Exception page (ours, not in L2; 04 "X1"): the page header, then the decision column and
 * the drafted-emails column, 20 apart on 20 / 28 / 28. The side is a fixed track; the decision column takes
 * the rest, which at 1440 beside the 420 side is the 705 of `--io-w-exception-main` (asserted in e2e). It
 * is not a minimum: a docked panel or the wide side must not push the page into a sideways scroll.
 * Boards 195–200, 203, 204.
 */
export default function X1Exception({
  header,
  banner,
  main,
  mainLabel = 'Decision',
  side,
  sideLabel = 'Drafted emails',
  variant = 'default',
}: X1ExceptionProps) {
  return (
    <div data-template="X1" data-variant={variant} className={TEMPLATE_ROOT}>
      <div data-slot="header" className={TEMPLATE_TOP}>
        {header}
      </div>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      <div
        data-slot="body"
        className={cn(
          'px-io-page-x grid min-h-0 flex-1 content-start items-start gap-5 overflow-y-auto pt-5 pb-7',
          variant === 'wide'
            ? 'grid-cols-[minmax(0,1fr)_var(--io-w-exception-side-wide)]'
            : 'grid-cols-[minmax(0,1fr)_var(--io-w-exception-side)]'
        )}
      >
        <section data-slot="main" aria-label={mainLabel} className="flex min-w-0 flex-col gap-4">
          {main}
        </section>
        <aside data-slot="side" aria-label={sideLabel} className="flex min-w-0 flex-col gap-4">
          {side}
        </aside>
      </div>
    </div>
  )
}
