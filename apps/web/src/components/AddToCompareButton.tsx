'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { addToTray, compareUrl, getTray, replaceTray, type CompareTrayItem, COMPARE_TRAY_EVENT } from '../lib/compare-tray'
import { MAX_COMPARE } from '@indus/domain'

type Props = {
  sku: string
  categoryId: string | null
  specTemplateId: string | null
}

export default function AddToCompareButton({ sku, categoryId, specTemplateId }: Props) {
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
    const incoming: CompareTrayItem = { sku, categoryId, specTemplateId }
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
  }, [sku, categoryId, specTemplateId])

  if (!categoryId || !specTemplateId) {
    return (
      <button
        type="button"
        disabled
        className="h-12 flex items-center justify-center border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-muted)] cursor-not-allowed"
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
        className="h-12 flex items-center justify-center border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
      >
        ✓ In compare ({trayCount}{trayCount === MAX_COMPARE ? ' · full' : ''}) →
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="h-12 flex items-center justify-center border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
    >
      Add to compare
    </button>
  )
}
