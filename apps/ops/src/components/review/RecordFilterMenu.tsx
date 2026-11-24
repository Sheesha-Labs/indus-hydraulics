'use client'

import { Button } from '@indus/ops-ui/controls'
import { Menu } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'

/** Board 104 "All records ▾": the queue for one record (or all), as a menu of links kept in the URL. */
export default function RecordFilterMenu({
  label,
  options,
}: {
  label: string
  options: ReadonlyArray<{ label: string; href: string }>
}) {
  const router = useRouter()
  return (
    <Menu
      align="end"
      width={280}
      trigger={
        <Button variant="secondary" size="sm" aria-label={`Record: ${label}`}>
          {label} <span aria-hidden="true">▾</span>
        </Button>
      }
      items={options.map((o) => ({
        type: 'item' as const,
        label: o.label,
        onSelect: () => router.push(o.href as Route),
      }))}
    />
  )
}
