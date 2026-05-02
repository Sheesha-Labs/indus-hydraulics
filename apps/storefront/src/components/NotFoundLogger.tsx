'use client'

import { useEffect, useRef } from 'react'

/**
 * Fires a one-shot sendBeacon to /api/seo/404-log when the storefront's
 * not-found.tsx renders. Path comes from window.location at mount time
 * (not-found.tsx runs server-side and doesn't know which URL triggered
 * it). The endpoint upserts NotFoundLog by `path`, so repeated visits
 * just bump the hit counter.
 */
export default function NotFoundLogger() {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current || typeof window === 'undefined') return
    sent.current = true
    try {
      const payload = {
        path: window.location.pathname + window.location.search,
        referer: document.referrer || null,
        userAgent: navigator.userAgent || null,
      }
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const url = '/api/seo/404-log'
      const sentBeacon = navigator.sendBeacon?.(url, blob) ?? false
      if (!sentBeacon) {
        void fetch(url, { method: 'POST', body: blob, keepalive: true }).catch(() => {})
      }
    } catch {
      // best effort — never let logging break the 404 page
    }
  }, [])
  return null
}
