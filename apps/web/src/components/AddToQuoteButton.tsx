'use client'

import { useState } from 'react'
import { Button } from '@indus/ui'

type Props = { sku: string; title: string; block?: boolean }

export default function AddToQuoteButton({ sku, block = true }: Props) {
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
      // localStorage unavailable — the quote list is browser-held today.
    }
  }

  return (
    <>
      <Button kind="primary" size="lg" block={block} onClick={handleAdd}>
        {added ? 'Added to quote' : 'Add to quote'}
      </Button>
      {/*
        The confirmation is announced rather than only shown. A colour flip on
        the button carries no meaning to a screen reader, and 03 §8 does not
        allow colour to be the sole signal.
      */}
      <span aria-live="polite" className="sr-only">
        {added ? `${sku} added to your quote list` : ''}
      </span>
    </>
  )
}
