'use client'

import { useMemo, useState } from 'react'
import Button from '../controls/Button'
import { cn } from '../lib/cn'
import { FRAME_SANDBOX, frameDocument } from './frame-document'
import type { SandboxedBodyProps } from './types'

/** The closed set of frame heights (no inline style: the height is a class). */
const HEIGHT = { preview: 'h-[127px]', reading: 'h-[360px]', expanded: 'h-[720px]' } as const

/**
 * An email body, isolated. The sanitized HTML goes ONLY into the srcdoc of an `<iframe sandbox="">`: no
 * scripts, no same-origin, so nothing in the body can touch the console, and the frame's CSP meta blocks
 * remote images and every other fetch. It is never placed in the console DOM.
 *
 * A sandboxed frame without same-origin cannot be measured from outside, so (decision) the height comes from a
 * closed set and the body scrolls inside the frame: 'preview' 127px, 'reading' 360px with Expand → 720px.
 * "Show images" waits for the S05 image proxy. Client only for the Expand toggle.
 */
export default function SandboxedBody({
  html,
  nonce,
  height = 'reading',
  title = 'Email body',
}: SandboxedBodyProps) {
  const [expanded, setExpanded] = useState(false)
  const srcDoc = useMemo(() => frameDocument(html, nonce), [html, nonce])
  const size = height === 'reading' && expanded ? 'expanded' : height
  return (
    <div data-part="sandboxed-body" className="flex flex-col">
      <iframe
        sandbox={FRAME_SANDBOX}
        srcDoc={srcDoc}
        title={title}
        referrerPolicy="no-referrer"
        className={cn('bg-io-card block w-full border-0', HEIGHT[size])}
      />
      {height === 'reading' ? (
        <div className="flex justify-end px-3.5 pb-2">
          <Button
            variant="ghost"
            size="xs"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
