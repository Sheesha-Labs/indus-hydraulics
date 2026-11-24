'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

/**
 * J / K on the thread list (S05-T05): the next or previous thread opens in the reading pane and the URL follows
 * (router.replace, no scroll jump, so Back returns to the folder); Enter on a focused row opens it (the row is a
 * link). Ignored while typing in a field or the composer.
 */
export default function ThreadKeys({ hrefs, children }: { hrefs: string[]; children: ReactNode }) {
  const router = useRouter()
  // The open thread is read from the URL, so a key pressed while the page re-renders still moves from it.
  const pathname = usePathname()
  const current = hrefs.findIndex((h) => h.split('?')[0] === pathname)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      const k = e.key.toLowerCase()
      if (k !== 'j' && k !== 'k') return
      if (hrefs.length === 0) return
      const next =
        current < 0 ? 0 : Math.min(Math.max(current + (k === 'j' ? 1 : -1), 0), hrefs.length - 1)
      if (next === current) return
      e.preventDefault()
      router.replace(hrefs[next] as never, { scroll: false })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hrefs, current, router])
  return <>{children}</>
}
