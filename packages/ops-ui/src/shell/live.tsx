'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { NavKey } from './nav'

/**
 * What the console feeds the sidebar at runtime, without ops-ui knowing where it comes from: live badge
 * counts (apps/ops reads them with `useLiveKeys`, ADR-19) and the command-bar opener. The AppShell provides
 * it; without a provider the sidebar shows the counts it was rendered with and ⌘K does nothing here.
 */
export interface ShellLive {
  badges?: Partial<Record<NavKey, number>>
  openCommand?: () => void
}

const ShellLiveContext = createContext<ShellLive>({})

export function ShellLiveProvider({ value, children }: { value: ShellLive; children: ReactNode }) {
  return <ShellLiveContext value={value}>{children}</ShellLiveContext>
}

export function useShellLive(): ShellLive {
  return useContext(ShellLiveContext)
}
