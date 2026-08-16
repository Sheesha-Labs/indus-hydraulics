'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { addToTray, compareUrl, getTray, replaceTray, type CompareTrayItem, COMPARE_TRAY_EVENT } from '../lib/compare-tray'
import { MAX_COMPARE } from '@indus/domain'

type Props = {
  sku: string
  categoryId: string | null
  specTemplateId: string | null
  /** Display fields for the docked tray's chips. Optional — see compare-tray.ts. */
  title?: string
  imageUrl?: string
}

export default function AddToCompareButton({ sku, categoryId, specTemplateId, title, imageUrl }: Props) {
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

  const isInTray = tray.some((i) => i.sku === sku)
  const trayCount = tray.length

  const handleAdd = useCallback(() => {
    if (!categoryId || !specTemplateId) return
    const incoming: CompareTrayItem = { sku, categoryId, specTemplateId, title, imageUrl }
    const result = addToTray(incoming)
    if (result.ok) {
      setTray(result.items)
      return
    }
    if (result.reason === 'mismatch') {
      const confirmed = window.confirm(
        `Switching categories will clear your current comparison (${result.current.length} item${result.current.length === 1 ? '' : 's'}). Continue?`,
      )
      if (confirmed) setTray(replaceTray(incoming))
    } else if (result.reason === 'full') {
      window.alert(`Compare is full — you can compare up to ${result.max} products at a time.`)
    }
  }, [sku, categoryId, specTemplateId, title, imageUrl])

  if (!categoryId || !specTemplateId) {
    return (
      <button
        type="button"
        disabled
        className="h-12 flex items-center justify-center border border-ih-border text-[13px] font-medium text-ih-muted cursor-not-allowed"
        title="This product can't be compared (no spec template assigned)."
      >
        Compare unavailable
      </button>
    )
  }

  if (isInTray) {
    return (
      <Link
        href={compareUrl(tray)}
        className="h-12 flex items-center justify-center border border-ih-border text-[13px] font-medium text-ih-ink hover:bg-ih-surface-2 transition-colors"
      >
        ✓ In compare ({trayCount}{trayCount === MAX_COMPARE ? ' · full' : ''}) →
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="h-12 flex items-center justify-center border border-ih-border text-[13px] font-medium text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
    >
      Add to compare
    </button>
  )
}
