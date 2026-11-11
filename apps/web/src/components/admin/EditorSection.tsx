import type { ReactNode } from 'react'
import { Panel } from '@indus/ui'

/**
 * One section of an admin editor: a white card on the grey canvas with a
 * heading and an optional one-line description — the Bazar CMS editor layout.
 *
 * Editors used to lay fields straight onto the canvas under uppercase eyebrow
 * labels (or as fieldsets with a hairline on top), so a long form read as one
 * undifferentiated column with no edges to scan by. Grouping into cards gives
 * the eye somewhere to land and says which fields belong together.
 *
 * Fields inside use `Field` from @indus/ui (sentence-case label, hint below).
 */
export default function EditorSection({
  title,
  description,
  aside,
  children,
}: {
  title: string
  description?: ReactNode
  /** Right-aligned in the heading row — a counter, a link, a toggle. */
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <Panel padding="form" className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-[15px] font-medium text-ih-ink">{title}</h2>
          {description ? <p className="text-[12.5px] text-ih-muted">{description}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </Panel>
  )
}
