'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { ServiceCaseCategory } from '@indus/db'
import type { ServiceCaseSort } from '../../lib/service-case-params'

type Props = {
  activeSort: ServiceCaseSort
  activeCategory: ServiceCaseCategory | null
}

export default function ServicesSortDropdown({ activeSort, activeCategory }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Built from props rather than `useSearchParams`. /services carries exactly
  // two parameters and both arrive here already, so the hook bought nothing —
  // and it cost the page its cache: this control renders inside the Suspense
  // FALLBACK on /services, which sits outside that boundary, so a
  // `useSearchParams` here bails the whole page out of prerendering.
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sort = e.target.value as ServiceCaseSort
    const sp = new URLSearchParams()
    if (sort !== 'recent') sp.set('sort', sort)
    if (activeCategory) sp.set('category', activeCategory)
    const qs = sp.toString()
    startTransition(() => {
      router.push(qs ? `/services?${qs}` : '/services')
    })
  }

  return (
    <div className="mono flex items-center gap-3 text-xs text-ih-muted">
      <span>Sort by</span>
      <select
        value={activeSort}
        onChange={onChange}
        disabled={isPending}
        aria-label="Sort cases"
        className="rounded-sm border border-ih-border bg-ih-surface px-2.5 py-1.5 text-xs"
      >
        <option value="recent">Most recent</option>
        <option value="savings">Highest savings</option>
        <option value="tat">Fastest turnaround</option>
      </select>
    </div>
  )
}
