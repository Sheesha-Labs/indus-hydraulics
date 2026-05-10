'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import type { ServiceCaseCategory } from '@indus/db'
import type { ServiceCaseSort } from '../../lib/service-cases'

type Props = {
  activeSort: ServiceCaseSort
  activeCategory: ServiceCaseCategory | null
}

export default function ServicesSortDropdown({ activeSort, activeCategory }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sort = e.target.value as ServiceCaseSort
    const sp = new URLSearchParams(params)
    if (sort === 'recent') sp.delete('sort')
    else sp.set('sort', sort)
    if (activeCategory) sp.set('category', activeCategory)
    const qs = sp.toString()
    startTransition(() => {
      router.push(qs ? `/services?${qs}` : '/services')
    })
  }

  return (
    <div className="mono flex items-center gap-3 text-xs text-[var(--color-muted)]">
      <span>Sort by</span>
      <select
        value={activeSort}
        onChange={onChange}
        disabled={isPending}
        aria-label="Sort cases"
        className="rounded-sm border border-[var(--color-border)] bg-[var(--color-elevated)] px-2.5 py-1.5 text-xs"
      >
        <option value="recent">Most recent</option>
        <option value="savings">Highest savings</option>
        <option value="tat">Fastest turnaround</option>
      </select>
    </div>
  )
}
