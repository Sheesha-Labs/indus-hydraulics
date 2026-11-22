import type { ReactNode } from 'react'
import { TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

export interface T3MailProps {
  /**
   * Shell `PageHeader` ("Mail", Compose). Optional: a thread opened from a record has the record's own
   * header above it. (Not in 05 §5's interface; the T3A board draws it, so the template takes it.)
   */
  header?: ReactNode
  banner?: ReactNode
  /** 210: Mail `Folder`s under group eyebrows. Rendered inside a `nav` landmark. */
  folders: ReactNode
  foldersLabel?: string
  /** 400: Controls `Search`, then Mail `ThreadRow`s. */
  list: ReactNode
  listLabel?: string
  /** The reading pane on paper: the Mail `AssistantNote` first, then the `Message`. */
  reading: ReactNode
  readingLabel?: string
}

/** The two white panes: a hairline on their right, each scrolling on its own. */
const PANE = 'bg-io-card border-io-line flex min-h-0 flex-col overflow-y-auto border-r'

/**
 * Template T3 · Three-pane mail (L2 t3a): folders 210 · thread list 400 · reading pane. Folders and list
 * are white panes; the reading pane sits on paper (16 / 24 padding, 12 between its parts). Each column
 * scrolls independently.
 */
export default function T3Mail({
  header,
  banner,
  folders,
  foldersLabel = 'Mail folders',
  list,
  listLabel = 'Threads',
  reading,
  readingLabel = 'Reading pane',
}: T3MailProps) {
  return (
    <div data-template="T3" className={TEMPLATE_ROOT}>
      {header ? (
        <div data-slot="header" className={TEMPLATE_TOP}>
          {header}
        </div>
      ) : null}
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      <div
        data-slot="body"
        className="grid min-h-0 flex-1 grid-cols-[var(--io-w-folders)_var(--io-w-threads)_minmax(0,1fr)]"
      >
        <nav
          data-slot="folders"
          aria-label={foldersLabel}
          className={`${PANE} gap-0.5 px-2.5 py-3.5`}
        >
          {folders}
        </nav>
        <section data-slot="list" aria-label={listLabel} className={PANE}>
          {list}
        </section>
        <section
          data-slot="reading"
          aria-label={readingLabel}
          className="bg-io-paper flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto px-6 py-4"
        >
          {reading}
        </section>
      </div>
    </div>
  )
}
