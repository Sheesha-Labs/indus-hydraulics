'use client'

import type { MouseEvent } from 'react'

/**
 * "Skip to content" (CLAUDE.md §10.6): the first tab stop on every console page, visually hidden until
 * focused, then a standard focused control at the top left. Activating it moves focus to
 * `<main id="content" tabIndex={-1}>` without adding a hash to the URL; without JavaScript the fragment
 * link does the same.
 */
export default function SkipLink() {
  const skip = (e: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById('content')
    if (!main) return
    e.preventDefault()
    main.focus()
    main.scrollIntoView({ block: 'start' })
  }
  return (
    <a
      href="#content"
      onClick={skip}
      data-part="skip-link"
      className="io-focus rounded-io-ctl border-io-line bg-io-card text-io-body text-io-ink shadow-io-e2 z-io-tooltip focus:h-io-btn sr-only border px-3.5 font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:inline-flex focus:items-center"
    >
      Skip to content
    </a>
  )
}
