/**
 * Lightweight analytics shim around PostHog.
 *
 * Everything no-ops gracefully when `NEXT_PUBLIC_POSTHOG_KEY` is unset,
 * so the storefront keeps working in dev / preview / on machines without
 * an analytics tenant configured. Once the key is set in Vercel the
 * same call sites start emitting events without any code change.
 *
 * Events we currently emit (see also AnalyticsProvider for autocapture):
 *   - `pdp_view`           Fired on every PDP load with { sku, slug, brand, category }
 *   - `rfq_submitted`      Fired on the RFQ confirmation page (`?confirmed=1`)
 *   - `search_performed`   Fired on every /search load with { query, resultCount }
 *   - `search_zero_results` Fired on /search when resultCount === 0
 *
 * Link clicks (WhatsApp, Email Quote, datasheet, quote PDF) are picked
 * up by PostHog autocapture; no manual `trackEvent` calls needed there.
 */

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

type Props = Record<string, string | number | boolean | null | undefined>

/**
 * Fire a custom event. Safe to call from any client component; no-ops
 * server-side and when the SDK hasn't loaded yet.
 */
export function trackEvent(name: string, props?: Props): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { posthog?: { capture: (event: string, props?: Props) => void } }
  if (!w.posthog) return
  try {
    w.posthog.capture(name, props)
  } catch {
    // never throw to the caller — analytics must not break the UI
  }
}
