'use client'

import { useCallback, useEffect, useState } from 'react'
import { addToTray, getTray, removeFromTray, replaceTray, type CompareTrayItem, COMPARE_TRAY_EVENT } from '../lib/compare-tray'

type Props = {
  sku: string
  categoryId: string | null
  specTemplateId: string | null
}

export default function AddToCompareCardButton({ sku, categoryId, specTemplateId }: Props) {
  const [inTray, setInTray] = useState(false)

  useEffect(() => {
    const sync = () => setInTray(getTray().some((i) => i.sku === sku))
    sync()
    window.addEventListener(COMPARE_TRAY_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(COMPARE_TRAY_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [sku])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!categoryId || !specTemplateId) return
      if (inTray) {
        removeFromTray(sku)
        return
      }
      const incoming: CompareTrayItem = { sku, categoryId, specTemplateId }
      const result = addToTray(incoming)
      if (result.ok) return
      if (result.reason === 'mismatch') {
        const confirmed = window.confirm(
          `Switching categories will clear your current comparison (${result.current.length} item${result.current.length === 1 ? '' : 's'}). Continue?`,
        )
        if (confirmed) replaceTray(incoming)
      } else if (result.reason === 'full') {
        window.alert(`Compare is full — you can compare up to ${result.max} products at a time.`)
      }
    },
    [sku, categoryId, specTemplateId, inTray],
  )

  if (!categoryId || !specTemplateId) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={inTray}
      aria-label={inTray ? `Remove ${sku} from compare` : `Add ${sku} to compare`}
      className={`font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-1 border transition-colors ${
        inTray
          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-elevated)]'
          : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-body)] bg-[var(--color-elevated)]'
      }`}
    >
      {inTray ? '✓ Comparing' : '+ Compare'}
    </button>
  )
}
