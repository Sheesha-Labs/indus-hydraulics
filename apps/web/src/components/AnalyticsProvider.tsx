'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { POSTHOG_HOST, POSTHOG_KEY } from '../lib/analytics'
import { scrubUrl } from '../lib/scrub-url'

/** The slice of the SDK this component and `trackEvent` reach for on window. */
type PostHogWindow = Window & {
  posthog?: { capture: (event: string, properties?: Record<string, unknown>) => unknown }
}

/**
 * Initialises PostHog on the client and emits `$pageview` on every
 * route change. Rendered once at the root layout level.
 *
 * Without `NEXT_PUBLIC_POSTHOG_KEY` configured, this is a no-op — the
 * SDK never loads, no network requests fire. That keeps the storefront
 * runnable in local dev + preview without an analytics tenant.
 *
 * The SDK is imported dynamically. A static import put `posthog-js` — tens of
 * kilobytes of script — into the JavaScript every storefront page parses
 * before it is interactive, for an analytics call nobody waits on. Loaded
 * after hydration, it no longer competes with the page for the main thread.
 * The first pageview is sent from the SDK's `loaded` callback, because the
 * route-change effect below runs before the import resolves.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // The URL to report when the SDK finishes loading — always the latest, so a
  // reader who navigates before it arrives is counted on the page they are on.
  const currentUrl = useRef<string>('')

  useEffect(() => {
    if (!POSTHOG_KEY) return
    const key = POSTHOG_KEY
    let cancelled = false
    import('posthog-js')
      .then(({ default: posthog }) => {
        // Initialise once per page lifecycle. PostHog handles the singleton.
        if (cancelled || (posthog as unknown as { __loaded?: boolean }).__loaded) return
        posthog.init(key, {
          api_host: POSTHOG_HOST,
          capture_pageview: false, // we emit explicitly on route change
          capture_pageleave: true,
          persistence: 'localStorage+cookie',
          autocapture: true,
          // Expose on window so `trackEvent` (a lightweight server-friendly
          // shim) can find the instance without importing posthog-js.
          loaded: (ph) => {
            ;(window as PostHogWindow).posthog = ph
            ph.capture('$pageview', { $current_url: currentUrl.current })
          },
        })
      })
      .catch(() => {
        // An ad blocker refusing the chunk is not an error worth surfacing.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const url = scrubUrl(pathname, searchParams)
    currentUrl.current = url
    if (!POSTHOG_KEY || typeof window === 'undefined') return
    const ph = (window as PostHogWindow).posthog
    // Not loaded yet: the `loaded` callback reports this URL when it is.
    if (!ph) return
    ph.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}
