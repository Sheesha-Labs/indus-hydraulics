'use client'

import { OfflineState } from '@indus/ops-ui/states'
import { BannerSlot, type SystemBanner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useMemo, useSyncExternalStore, type ReactNode } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

/** The browser's connection state; true on the server (nothing renders offline there). */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  )
}

/** The offline banner (S08): it joins the others and takes its place in the severity order. */
export const OFFLINE_BANNER: SystemBanner = {
  kind: 'offline',
  props: {
    tone: 'warn',
    title: 'You’re offline.',
    children: 'What is on screen stays readable. Sending, approving and saving wait until you reconnect.',
  },
}

export interface SystemBannersProps {
  /** From getShellBanners() on the server: mailbox, pause, sync and Zoho states. */
  banners: readonly SystemBanner[]
}

/**
 * S08 · System states (board S08a, C23): the strip under the page header shows ONE banner, the most severe
 * (disconnected > Assistant paused > sync delayed > Zoho > offline > info), with "+n more" opening the rest.
 * The board draws two stacked only to document both. Going offline adds the offline banner.
 */
export default function SystemBanners({ banners }: SystemBannersProps) {
  const online = useOnline()
  const all = useMemo(() => (online ? banners : [...banners, OFFLINE_BANNER]), [online, banners])
  return <BannerSlot banners={all} placement="strip" />
}

/**
 * Lists fall back to the offline state (S08): while the browser is offline a list shows OfflineState
 * instead of its rows. "Retry now" re-reads the page's server data.
 */
export function OfflineFallback({
  children,
  lastSynced,
}: {
  children: ReactNode
  lastSynced?: Date
}) {
  const online = useOnline()
  const router = useRouter()
  if (online) return children
  return (
    <OfflineState
      align="center"
      onRetry={() => router.refresh()}
      {...(lastSynced ? { lastSynced } : {})}
    />
  )
}
