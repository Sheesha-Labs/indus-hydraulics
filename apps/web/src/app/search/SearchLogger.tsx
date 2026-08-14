'use client'

import { useEffect, useRef } from 'react'

interface Props {
  query: string
  resultsCount: number
  usedFallback: boolean
}

const STORAGE_KEY = 'indus.search.session'

/**
 * Tiny client island that logs the search query once on mount and wires
 * a one-shot click-through tracker on every result anchor (`[data-search-
 * result-sku]`). Both signals go to /api/search/log via `sendBeacon` so
 * navigation isn't blocked.
 *
 * The logger uses sessionStorage to dedupe rapid re-renders of the same
 * query (e.g. when the user toggles a facet — the query stays the same,
 * we don't want to double-count).
 */
export default function SearchLogger({ query, resultsCount, usedFallback }: Props) {
  const loggedQuery = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Dedupe identical queries within the same tab session.
    const key = `${query.toLowerCase()}::${resultsCount}`
    if (loggedQuery.current === key) return
    loggedQuery.current = key

    const sessionId = ensureSessionId()
    const payload = {
      query,
      resultsCount,
      usedFallback,
      sessionId,
    }

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    const url = '/api/search/log'
    const sent = navigator.sendBeacon?.(url, blob) ?? false
    if (!sent) {
      // Fallback for browsers without sendBeacon — keepalive fetch is fire-and-forget.
      void fetch(url, { method: 'POST', body: blob, keepalive: true }).catch(() => {})
    }
  }, [query, resultsCount, usedFallback])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest('a[data-search-result-sku]')
      if (!anchor) return
      const sku = anchor.getAttribute('data-search-result-sku')
      const q = anchor.getAttribute('data-search-result-q')
      if (!sku || !q) return
      const sessionId = ensureSessionId()
      const blob = new Blob(
        [JSON.stringify({ query: q, clickedSku: sku, sessionId })],
        { type: 'application/json' },
      )
      navigator.sendBeacon?.('/api/search/log', blob)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  return null
}

function ensureSessionId(): string {
  try {
    let id = sessionStorage.getItem(STORAGE_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      sessionStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}
