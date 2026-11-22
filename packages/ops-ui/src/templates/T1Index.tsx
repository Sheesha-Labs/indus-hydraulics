import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_BODY, TEMPLATE_COLUMN, TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

export interface T1IndexProps {
  /** Shell `PageHeader`: crumb, title, actions (one primary), optional search, filter chips and summary. */
  header: ReactNode
  /** One page banner under the header (Status `Banner`). */
  banner?: ReactNode
  /** The table, or the States `EmptyState` for the list key. */
  children: ReactNode
  /** The 360 preview of the selected row (`?selected=`): a Card and the Timeline `Activity`. */
  preview?: ReactNode
  /** Accessible name of the preview region. */
  previewLabel?: string
}

/**
 * Template T1 · Index list (L2 t1a, t1b): header 60 → filter row → body with the 28px gutter. With a
 * preview the body is `1fr · 360` with 16 between. The preview column sits on the paper ground, as both
 * boards draw it: the Card inside it is the white surface.
 */
export default function T1Index({
  header,
  banner,
  children,
  preview,
  previewLabel = 'Preview',
}: T1IndexProps) {
  return (
    <div data-template="T1" className={TEMPLATE_ROOT}>
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
          TEMPLATE_BODY,
          preview ? 'grid-cols-[minmax(0,1fr)_var(--io-w-preview)]' : 'grid-cols-[minmax(0,1fr)]'
        )}
      >
        <div data-slot="list" className={TEMPLATE_COLUMN}>
          {children}
        </div>
        {preview ? (
          <aside data-slot="preview" aria-label={previewLabel} className={TEMPLATE_COLUMN}>
            {preview}
          </aside>
        ) : null}
      </div>
    </div>
  )
}
