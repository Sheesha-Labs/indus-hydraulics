'use client'

import { useEffect } from 'react'
import { trackEvent } from '../lib/analytics'

type Props = {
  name: string
  props?: Record<string, string | number | boolean | null | undefined>
}

/**
 * Fire-and-forget analytics event triggered on client-side mount.
 * Useful for server-rendered pages that need to emit a single event
 * (e.g. `pdp_view` on every product page load) without converting the
 * whole page to a client component.
 *
 * Re-fires when `name` or any value in `props` changes — keep props
 * stable on each render to avoid duplicate events.
 */
export default function AnalyticsEvent({ name, props }: Props) {
  // Serialise the props bag so identical object literals across renders
  // don't re-fire — useEffect compares dep array entries by reference,
  // and a fresh `{}` from the parent would otherwise count as a change.
  const propsKey = JSON.stringify(props ?? {})

  useEffect(() => {
    trackEvent(name, props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, propsKey])

  return null
}
