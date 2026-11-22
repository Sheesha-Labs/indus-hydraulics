import type { ReactNode } from 'react'

export interface T12ClientProps {
  /** The company logo and "Prepared for <contact> · <client>", ends apart. */
  brandBar: ReactNode
  /** Superseded or expired: a Status `Banner` under the brand bar. */
  banner?: ReactNode
  /** "Quotation · INDUS/Q10001-R2 · 2 Oct 2026". */
  eyebrow: string
  /** The document's title, the page's h1. */
  title: string
  /**
   * The lines: a Table kit table with the CLIENT columns only (#, part, description, qty, unit, unit price,
   * line total, "Price to follow"). Never a supplier, line state, cost or margin (C36).
   */
  document: ReactNode
  /** Card `Stat` totals, over the actions. */
  summary?: ReactNode
  /**
   * Accept · Ask for changes · Download PDF, Controls `Button` size 'client' (44). Under 1024 they become a
   * bar stuck to the bottom of the screen.
   */
  actions: ReactNode
  actionsLabel?: string
  /** Under the actions: "Valid as stated per line. Questions go to …". */
  note?: ReactNode
}

/**
 * Template T12 · Client-facing page (L2 t12a): the one responsive Ops surface. The website look: a white
 * page, a brand bar, then `1fr · 340` 40 apart on 32 / 56 at 1024 and wider. Below 1024 it is one column on
 * a 16 gutter, the summary under the lines and the actions in a sticky bottom bar.
 *
 * One grid, so the sticky bar's containing block is the whole page body: on a phone the bar stays on screen
 * from the first line to the last. At 1024 and wider the summary, actions and note stack in the right
 * column (12 apart) beside the document, which spans their rows.
 */
export default function T12Client({
  brandBar,
  banner,
  eyebrow,
  title,
  document,
  summary,
  actions,
  actionsLabel = 'Respond',
  note,
}: T12ClientProps) {
  return (
    <div data-template="T12" className="bg-io-card flex min-h-screen w-full min-w-0 flex-col">
      <header
        data-slot="brand-bar"
        className="border-io-line flex flex-none flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-4 py-3 lg:px-14 lg:py-4"
      >
        {brandBar}
      </header>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      <main
        id="content"
        data-slot="body"
        className="grid flex-1 grid-cols-[minmax(0,1fr)] content-start items-start gap-6 px-4 pt-6 lg:grid-cols-[minmax(0,1fr)_var(--io-w-client-aside)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-10 lg:gap-y-3 lg:px-14 lg:py-8"
      >
        <div
          data-slot="document"
          className="flex min-w-0 flex-col gap-[18px] lg:col-start-1 lg:row-span-3 lg:row-start-1"
        >
          <span className="io-eyebrow">{eyebrow}</span>
          <h1 className="io-display text-io-record lg:text-io-section">{title}</h1>
          {document}
        </div>
        {summary ? (
          <div data-slot="summary" className="min-w-0 lg:col-start-2 lg:row-start-1">
            {summary}
          </div>
        ) : null}
        <div
          data-slot="actions"
          role="group"
          aria-label={actionsLabel}
          className="bg-io-card border-io-line z-io-sticky sticky bottom-0 -mx-4 flex flex-col gap-2 border-t px-4 py-3 lg:static lg:col-start-2 lg:row-start-2 lg:mx-0 lg:gap-3 lg:self-start lg:border-t-0 lg:p-0"
        >
          {actions}
        </div>
        {note ? (
          <div data-slot="note" className="min-w-0 pb-6 lg:col-start-2 lg:row-start-3 lg:pb-0">
            {note}
          </div>
        ) : null}
      </main>
    </div>
  )
}
