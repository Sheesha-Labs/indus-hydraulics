'use client'

import { useHotkeys } from '@indus/ops-ui/lib/use-hotkeys'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

/**
 * Review keyboard (S02 registry): J and K move to the next and previous card (it expands, ?card=), Enter
 * focuses the expanded card so its own keys work (⌘↵ approve, E, R, L). Inputs keep their keys (the
 * registry ignores them there).
 */
export default function ReviewKeys({
  hrefs,
  current,
  children,
}: {
  /** The cards in order, each with its link (?card=). */
  hrefs: Array<[string, string]>
  current: string | null
  children: ReactNode
}) {
  const refs = hrefs.map(([r]) => r)
  const router = useRouter()
  const i = current ? refs.indexOf(current) : -1
  const go = (j: number) => {
    const ref = refs[j]
    if (!ref) return false
    router.push(hrefs[j]![1] as Route, { scroll: false })
    return true
  }
  useHotkeys([
    { keys: 'j', label: 'Next card', group: 'Review', run: () => go(i < 0 ? 0 : i + 1) },
    { keys: 'k', label: 'Previous card', group: 'Review', run: () => go(i <= 0 ? 0 : i - 1) },
    {
      keys: 'enter',
      label: 'Focus the open card',
      group: 'Review',
      run: () => {
        const el = current ? document.getElementById(`proposal-${current}`) : null
        if (!el) return false
        el.focus()
        return true
      },
    },
  ])
  // After J/K the newly expanded card takes focus, so its keys work at once.
  useEffect(() => {
    if (!current) return
    const el = document.getElementById(`proposal-${current}`)
    if (el && document.activeElement === document.body) el.focus({ preventScroll: false })
  }, [current])
  return <>{children}</>
}
