'use client'

import type { ReactNode } from 'react'
import { Button } from '@indus/ui'

/**
 * The "send us the drawing" CTA — the secondary action on a designed page.
 *
 * It is a real anchor, so it works with JavaScript off, opens in a new tab on
 * middle-click and reads as a link to a screen reader. The handler adds the
 * part an anchor cannot do: moving keyboard focus onto the file input, because
 * someone who pressed THIS button has already decided to attach something and
 * should not have to tab through six fields to reach the dropzone.
 *
 * Focus is deferred past the browser's own scroll so the two do not fight, and
 * `preventScroll` stops the focus call from yanking the page a second time.
 */
export default function DrawingCta({
  anchorId,
  fileInputId,
  kind = 'outline',
  size = 'md',
  children,
  icon,
  iconAfter,
}: {
  anchorId: string
  fileInputId: string
  kind?: 'primary' | 'outline'
  size?: 'md' | 'lg'
  children: ReactNode
  /** Leading icon — the document mark on the outline variant. */
  icon?: ReactNode
  /** Trailing icon — the arrow on the primary variant. */
  iconAfter?: ReactNode
}) {
  return (
    <Button
      asChild
      kind={kind}
      size={size}
      onClick={() => {
        window.setTimeout(() => {
          const input = document.getElementById(fileInputId)
          if (input instanceof HTMLInputElement) input.focus({ preventScroll: true })
        }, 400)
      }}
    >
      <a href={`#${anchorId}`}>
        {icon}
        {children}
        {iconAfter}
      </a>
    </Button>
  )
}
