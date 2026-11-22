'use client'

import { DataTableClient, type Column } from '@indus/ops-ui/table'
import { useState } from 'react'
import { SAMPLE_SUPPLIERS, type SampleSupplier } from '../fixtures'

// Client islands for the Table specimen. DataTableClient takes functions (columns, onChange), which a
// server component cannot pass, so its columns and state live here.

const SUPPLIER_COLUMNS: Column<SampleSupplier>[] = [
  {
    key: 'name',
    label: 'Supplier',
    type: 'text',
    value: (r) => r.name,
    sub: (r) => r.sub,
    sort: { key: 'name' },
  },
  { key: 'type', label: 'Type', type: 'muted', value: (r) => r.type },
  {
    key: 'tier',
    label: 'Tier',
    type: 'chip',
    value: () => '',
    chip: { family: 'supplier', word: (r) => r.tier },
  },
  { key: 'country', label: 'Country', type: 'muted', value: (r) => r.country },
  {
    key: 'reply',
    label: 'Reply',
    type: 'num',
    value: (r) => r.reply || '—',
    sort: { key: 'reply' },
  },
  { key: 'win', label: 'Win', type: 'num', value: (r) => r.win || '—' },
]

const GRID = 'grid-cols-[16px_minmax(0,1.4fr)_150px_110px_90px_80px_60px]'

/** The kit's supplier index with the bulk-select column (L1 k03 "Suppliers · check"). */
export function SupplierIndexDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  return (
    <DataTableClient
      caption="Suppliers"
      gridClass={GRID}
      columns={SUPPLIER_COLUMNS}
      rows={SAMPLE_SUPPLIERS}
      rowKey={(r) => r.key}
      rowTone={(r) => (r.flag ? 'flag' : undefined)}
      selectable={{ selected, onChange: setSelected, label: (r) => `Select ${r.name}` }}
    />
  )
}

const LINKED_COLUMNS: Column<SampleSupplier>[] = SUPPLIER_COLUMNS.map((c) =>
  c.key === 'name'
    ? { ...c, type: 'ref', href: (r: SampleSupplier) => `/_kit/table?supplier=${r.key}` }
    : c
)

/**
 * Every piece of URL and keyboard state at once: sorted by name (a link per sortable header), page 1 of a
 * 214-row list (aria-rowcount), one row checked (the header shows mixed), and J/K movement.
 */
export function TableStateDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['s2']))
  const [current, setCurrent] = useState('s1')
  return (
    <DataTableClient
      caption="Suppliers, sorted by name"
      gridClass={GRID}
      columns={LINKED_COLUMNS}
      rows={SAMPLE_SUPPLIERS}
      rowKey={(r) => r.key}
      sort={{ key: 'name', dir: 'asc' }}
      sortHref={(key, dir) => `/_kit/table?sort=${key}&dir=${dir}`}
      rowCount={214}
      selectedKey={current}
      keyboard
      onSelectedKeyChange={setCurrent}
      selectable={{ selected, onChange: setSelected, label: (r) => `Select ${r.name}` }}
      foot="Showing 1–4 of 214"
      footRight="Sorted by supplier, A to Z"
    />
  )
}
