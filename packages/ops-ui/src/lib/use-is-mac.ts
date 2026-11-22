import { useSyncExternalStore } from 'react'

const subscribe = (): (() => void) => () => {}

interface NavigatorUAData {
  platform?: string
}

/** Platform string, most specific first. navigator.platform is deprecated but still the steadiest signal. */
function platform(): string {
  const nav = navigator as Navigator & { userAgentData?: NavigatorUAData }
  return nav.userAgentData?.platform || nav.platform || nav.userAgent
}

function isMacNow(): boolean {
  return /mac|iphone|ipad|ipod/i.test(platform())
}

/**
 * True on macOS and iOS. The server (and the first client render) assumes a Mac, because the handoff
 * draws ⌘; React then re-renders with the real answer after hydration, without a mismatch warning.
 * Client components only.
 */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, isMacNow, () => true)
}
