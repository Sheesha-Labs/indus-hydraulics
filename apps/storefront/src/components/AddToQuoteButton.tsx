'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Props = { sku: string; title: string; locale: string }

export default function AddToQuoteButton({ sku, title, locale }: Props) {
  const t = useTranslations('product')
  const [added, setAdded] = useState(false)

  function handleAdd() {
    try {
      const existing = JSON.parse(localStorage.getItem('quote_items') ?? '[]') as Array<{ sku: string; qty: number }>
      if (!existing.find((item) => item.sku === sku)) {
        existing.push({ sku, qty: 1 })
        localStorage.setItem('quote_items', JSON.stringify(existing))
      }
      setAdded(true)
      setTimeout(() => setAdded(false), 3000)
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <button
      onClick={handleAdd}
      className={`h-12 flex items-center justify-center text-sm font-medium transition-all ${
        added
          ? 'bg-[oklch(0.55_0.12_150)] text-white'
          : 'bg-[var(--color-accent)] text-white hover:opacity-90'
      }`}
    >
      {added ? `✓ ${t('addedToQuote')}` : `${t('addToQuote')} →`}
    </button>
  )
}
