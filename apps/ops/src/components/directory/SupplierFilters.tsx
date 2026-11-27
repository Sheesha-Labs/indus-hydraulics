'use client'

import { SearchInput, Select } from '@indus/ops-ui/controls'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/**
 * Board 128's filter row (S10-T03): the search ("by name, domain or part number") and Tier · Type · Region ·
 * Category selects, plus the "Replies fast" and "Never replied" toggles. All state is in the URL; a change drops the
 * page cursor and the selection.
 */
export interface Opt {
  value: string
  label: string
}

export default function SupplierFilters({
  tiers,
  types,
  regions,
  trades,
}: {
  tiers: Opt[]
  types: Opt[]
  regions: Opt[]
  trades: Opt[]
}) {
  const sp = useSearchParams()
  const path = usePathname()
  const router = useRouter()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const go = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    p.delete('cursor')
    p.delete('selected')
    const s = p.toString()
    router.push((s ? `${path}?${s}` : path) as Route)
  }
  const toggle = (k: 'fast' | 'never', label: string) => {
    const on = sp.get(k) === '1'
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => go({ [k]: on ? null : '1' })}
        className={`io-focus rounded-io-pill h-[30px] border px-3 text-[12.5px] ${
          on
            ? 'bg-io-navy border-io-navy text-white'
            : 'bg-io-card border-io-stroke text-io-ink hover:bg-io-paper'
        }`}
      >
        {label}
      </button>
    )
  }
  const sel = (key: string, label: string, options: Opt[]) => (
    <Select
      aria-label={label}
      inlineLabel={label}
      value={sp.get(key) ?? ''}
      onChange={(e) => go({ [key]: e.target.value || null })}
      options={[{ value: '', label: 'all' }, ...options]}
    />
  )
  return (
    <div className="flex w-full flex-wrap items-center gap-2" data-part="supplier-filters">
      <form
        role="search"
        className="min-w-[320px] flex-1"
        onSubmit={(e) => {
          e.preventDefault()
          go({ q: q.trim() || null })
        }}
      >
        <SearchInput
          aria-label="Search suppliers by name, domain or part number"
          placeholder="Search by name, domain or part number"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
      {sel('tier', 'Tier', tiers)}
      {sel('type', 'Type', types)}
      {sel('region', 'Region', regions)}
      {sel('trade', 'Category', trades)}
      {toggle('fast', 'Replies fast')}
      {toggle('never', 'Never replied')}
    </div>
  )
}
