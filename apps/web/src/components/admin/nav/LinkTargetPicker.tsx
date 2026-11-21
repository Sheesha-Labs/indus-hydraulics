'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { MenuLinkType } from '@indus/domain'
import { searchLinkTargets } from '../../../app/admin/(shell)/navigation/actions'

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
        <div className="border-ih-border bg-ih-bg flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px]">
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{value.label}</div>
            {value.sublabel ? (
              <div className="text-ih-muted truncate text-[11px] tabular-nums">
                {value.sublabel}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-ih-muted hover:text-ih-ink text-[12px]"
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
            className="border-ih-border bg-ih-surface h-9 w-full rounded-md border px-3 text-[13px]"
          />
          {open ? (
            <div className="bg-ih-surface border-ih-border absolute right-0 left-0 z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border">
              {pending ? (
                <div className="text-ih-muted px-3 py-2 text-[12px]">Searching…</div>
              ) : results.length === 0 ? (
                <div className="text-ih-muted px-3 py-2 text-[12px]">No matches</div>
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
                    className="hover:bg-ih-bg block w-full px-3 py-2 text-left text-[13px]"
                  >
                    <div className="font-medium">{r.label}</div>
                    {r.sublabel ? (
                      <div className="text-ih-muted text-[11px] tabular-nums">{r.sublabel}</div>
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
