'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { clearTray, compareUrl, getTray, type CompareTrayItem, COMPARE_TRAY_EVENT } from '../lib/compare-tray'

export default function CompareTrayBadge() {
  const [tray, setTray] = useState<CompareTrayItem[]>([])

  useEffect(() => {
    const sync = () => setTray(getTray())
    sync()
    window.addEventListener(COMPARE_TRAY_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(COMPARE_TRAY_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (tray.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-stretch shadow-lg border border-[var(--color-border)] bg-[var(--color-primary)] text-white">
      <Link
        href={compareUrl(tray)}
        className="px-4 py-2.5 flex items-center gap-2 text-[13px] font-medium hover:bg-black/20 transition-colors"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-accent)]">Compare</span>
        <span className="font-mono text-[13px]">({tray.length})</span>
        <span aria-hidden="true">→</span>
      </Link>
      <button
        type="button"
        onClick={() => clearTray()}
        aria-label="Clear compare tray"
        className="px-3 border-l border-white/20 text-white/70 hover:text-white hover:bg-black/20 transition-colors"
      >
        ×
      </button>
    </div>
  )
}
