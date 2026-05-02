'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { MenuLinkType } from '@indus/domain'
import { searchLinkTargets } from '../actions'

export interface PickerTarget {
  id: string
  label: string
  sublabel: string | null
}

interface Props {
  linkType: MenuLinkType
  value: PickerTarget | null
  onChange: (target: PickerTarget | null) => void
}

export default function LinkTargetPicker({ linkType, value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PickerTarget[]>([])
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await searchLinkTargets({ linkType, query })
        if (result.success) setResults(result.data)
      })
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [linkType, query, open])

  return (
    <div className="relative">
      {value ? (
        <div className="flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px]">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{value.label}</div>
            {value.sublabel ? (
              <div className="font-mono text-[11px] text-[var(--color-muted)] truncate">{value.sublabel}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className="h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px]"
          />
          {open ? (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[var(--color-border)] max-h-64 overflow-y-auto">
              {pending ? (
                <div className="px-3 py-2 text-[12px] text-[var(--color-muted)]">Searching…</div>
              ) : results.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[var(--color-muted)]">No matches</div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onChange(r)
                      setOpen(false)
                      setQuery('')
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-[var(--color-surface)] text-[13px]"
                  >
                    <div className="font-medium">{r.label}</div>
                    {r.sublabel ? (
                      <div className="font-mono text-[11px] text-[var(--color-muted)]">{r.sublabel}</div>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
