'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { POSTHOG_HOST, POSTHOG_KEY } from '../lib/analytics'
import { scrubUrl } from '../lib/scrub-url'

/**
 * Initialises PostHog on the client and emits `$pageview` on every
 * route change. Rendered once at the root layout level.
 *
 * Without `NEXT_PUBLIC_POSTHOG_KEY` configured, this is a no-op — the
 * SDK never loads, no network requests fire. That keeps the storefront
 * runnable in local dev + preview without an analytics tenant.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!POSTHOG_KEY) return
    // Initialise once per page lifecycle. PostHog handles the singleton.
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // we emit explicitly below on route change
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      autocapture: true,
      // Expose on window so `trackEvent` (a lightweight server-friendly
      // shim) can find the instance without importing posthog-js.
      loaded: (ph) => {
        ;(window as unknown as { posthog?: typeof ph }).posthog = ph
      },
    })
  }, [])

  useEffect(() => {
    if (!POSTHOG_KEY) return
    if (typeof window === 'undefined') return
    const w = window as unknown as { posthog?: typeof posthog }
    if (!w.posthog) return
    w.posthog.capture('$pageview', { $current_url: scrubUrl(pathname, searchParams) })
  }, [pathname, searchParams])

  return null
}
