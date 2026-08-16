'use client'

import { useEffect, useState } from 'react'

type Props = {
  /**
   * CSS selector for the article element whose scroll progress drives the
   * percentage. Defaults to the .sc-article-body class wrapper.
   */
  targetSelector?: string
  estimatedMinutes?: number
}

/**
 * Tiny reading-progress UI — appears under the sticky TOC. Reads the
 * scroll position of the named article element and renders a bar + percent.
 * SSR-safe: returns 0% on first paint, then hydrates with the live value.
 */
export default function ReadingProgress({
  targetSelector = '.sc-article-body',
  estimatedMinutes = 10,
}: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const article = document.querySelector(targetSelector)
    if (!article) return

    function update() {
      // Re-read inside the closure to be linter-happy; null check is cheap.
      const node = document.querySelector(targetSelector)
      if (!node) return
      const rect = node.getBoundingClientRect()
      const viewportH = window.innerHeight
      const total = Math.max(1, rect.height - viewportH * 0.5)
      const scrolled = Math.max(0, viewportH * 0.5 - rect.top)
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
      setProgress(pct)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [targetSelector])

  return (
    <div className="mt-4 rounded-sm border border-ih-border bg-ih-surface p-3.5 font-mono">
      <small className="text-ih-muted">READING</small>
      <div className="relative my-2 h-0.5 overflow-hidden bg-ih-surface-2">
        <div
          className="absolute left-0 top-0 h-full bg-ih-accent transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <small className="text-ih-muted">
        ~ {estimatedMinutes} MIN · {Math.round(progress)}% READ
      </small>
    </div>
  )
}
