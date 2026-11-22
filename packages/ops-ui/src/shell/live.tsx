'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { NavKey } from './nav'

/**
 * What the console feeds the shell at runtime, without ops-ui knowing where it comes from: live badge
 * counts (apps/ops reads them with `useLiveKeys`, ADR-19), per-record live counters, and the openers for
 * the command bar and the notifications panel. The AppShell provides it; without a provider the parts show
 * what they were rendered with and their openers do nothing.
 */
export interface ShellLive {
  badges?: Partial<Record<NavKey, number>>
  openCommand?: () => void
  /** The bell in TodayHeader (S02 surface "Notifications"). */
  openNotifications?: () => void
  /** Live counters by key (`record:<ref>`); a change tells the Assistant strip its text is stale. */
  live?: Partial<Record<string, number>>
  /** Re-reads the page's server data (S02-T03 wires `router.refresh()`). */
  refresh?: () => void
}

const ShellLiveContext = createContext<ShellLive>({})

export function ShellLiveProvider({ value, children }: { value: ShellLive; children: ReactNode }) {
  return <ShellLiveContext value={value}>{children}</ShellLiveContext>
}

export function useShellLive(): ShellLive {
  return useContext(ShellLiveContext)
}
