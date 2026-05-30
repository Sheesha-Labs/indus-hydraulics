'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Triggers `router.refresh()` on an interval while the job is in a
 * non-terminal status (`queued` or `running`). Server fetches re-run on
 * each refresh, so the status badge and per-state counts update without
 * a full reload.
 */
export default function AutoRefresh({
  intervalMs = 3000,
  active,
}: {
  intervalMs?: number
  active: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(t)
  }, [active, intervalMs, router])

  return null
}
