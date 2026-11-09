import { trackEvent } from '../analytics'

/**
 * Call-back prompt events (handoff §11). Sent to PostHog through the shared
 * `trackEvent` shim and, when GA4 is on the page, to gtag as well — mark
 * `callback_submit_success` as a conversion there.
 *
 * Never pass name, email or phone. Every parameter here is a category, a
 * surface or a count.
 */
export type CallbackEvent =
  | 'callback_prompt_shown'
  | 'callback_prompt_closed'
  | 'callback_chip_select'
  | 'callback_submit_attempt'
  | 'callback_submit_success'
  | 'callback_submit_error'
  | 'callback_alt_click'

type Params = Record<string, string | number | boolean | null>

export function trackCallback(event: CallbackEvent, params: Params): void {
  trackEvent(event, params)
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', event, params)
  } catch {
    // Analytics must never break the prompt.
  }
}
