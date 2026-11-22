import type { ReactNode } from 'react'

export interface T5DocumentProps {
  /**
   * 560: the Document `Viewer` (grey well, file name, page controls) holding the A4 page. The column is the
   * page's height; give the Viewer `h-full w-full` so its pages scroll inside it.
   */
  well: ReactNode
  /** Assistant `Checks`, Chart `VAT` totals and the Mail `Composer` cover email. Send is a person's button. */
  side: ReactNode
  sideLabel?: string
}

/**
 * Template T5 · Document on well (L2 t5a): `560 · 1fr`, edge to edge under the record header (T2Record
 * `body="bleed"`). The well fills its column's height and scrolls inside; the side panel has 16 / 24
 * padding and 14 between its parts.
 */
export default function T5Document({
  well,
  side,
  sideLabel = 'Checks and cover email',
}: T5DocumentProps) {
  return (
    <div
      data-template="T5"
      className="grid min-h-0 min-w-0 flex-1 grid-cols-[var(--io-w-well)_minmax(0,1fr)]"
    >
      <div data-slot="well" className="bg-io-well flex min-h-0 min-w-0">
        {well}
      </div>
      <section
        data-slot="side"
        aria-label={sideLabel}
        className="flex min-h-0 min-w-0 flex-col gap-3.5 overflow-y-auto px-6 py-4"
      >
        {side}
      </section>
    </div>
  )
}
