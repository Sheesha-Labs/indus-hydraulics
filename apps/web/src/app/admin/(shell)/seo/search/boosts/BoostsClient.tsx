'use client'

import { useState, useTransition } from 'react'
import { upsertSearchBoost, deleteSearchBoost } from './actions'
import { Input, DeleteButton } from '@indus/ui'

type Row = {
  id: string
  sku: string
  title: string
  boost: number
  expiresAt: string | null
}

interface Props {
  rows: Row[]
}

export default function BoostsClient({ rows: initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleAdd(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await upsertSearchBoost(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      // Server has the canonical row; soft-refresh so the table reflects truth.
      // (We don't get the new row back from the action — keep it simple.)
      window.location.reload()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this boost?')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteSearchBoost(id)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div className="max-w-[860px]">
      <div className="mb-6 max-w-[640px] text-[13px] text-ih-muted">
        Boosts multiply a product&apos;s rank score at search time.
        <strong> 1.0</strong> is neutral, <strong>{'>'}1</strong> lifts, <strong>{'<'}1</strong>{' '}
        buries, <strong>0</strong> effectively hides. Optional expiry auto-clears the boost.
      </div>

      <details className="rounded-lg mb-6 border border-ih-border bg-ih-surface p-4">
        <summary className="tabular-nums text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted cursor-pointer">
          Add product boost
        </summary>
        <form action={handleAdd} className="mt-3 grid grid-cols-[1fr_120px_180px_auto] gap-3 items-end">
          <div>
            <label htmlFor="boost-sku" className="block tabular-nums text-[10.5px] uppercase text-ih-muted mb-1">
              Product SKU
            </label>
            <Input
              id="boost-sku"
              name="sku"
              type="text"
              required
              placeholder="ABC-1234" />
          </div>
          <div>
            <label htmlFor="boost-boost" className="block tabular-nums text-[10.5px] uppercase text-ih-muted mb-1">
              Boost (0–10)
            </label>
            <Input
              id="boost-boost"
              name="boost"
              type="number"
              required
              min={0}
              max={10}
              step={0.1}
              defaultValue="1.5" />
          </div>
          <div>
            <label htmlFor="boost-expiresAt" className="block tabular-nums text-[10.5px] uppercase text-ih-muted mb-1">
              Expires (optional)
            </label>
            <Input
              id="boost-expiresAt"
              name="expiresAt"
              type="datetime-local" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 bg-ih-accent text-ih-accent-fg tabular-nums text-[12px] hover:bg-ih-accent-hover disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </details>

      {error && (
        <p className="mb-4 tabular-nums text-[12px] text-ih-danger-ink" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-ih-border">
          <p className="text-ih-muted text-[13px]">No boosts configured.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-ih-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ih-border bg-ih-surface-2">
                <Th>Product</Th>
                <Th>Boost</Th>
                <Th>Expires</Th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
                >
                  <td className="px-3 py-3">
                    <div className="text-ih-ink-2 truncate max-w-[400px]">{r.title}</div>
                    <div className="tabular-nums text-[11px] text-ih-muted">{r.sku}</div>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-ih-ink-2 tabular-nums">
                    × {r.boost.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-[11px] text-ih-muted">
                    {r.expiresAt
                      ? new Date(r.expiresAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <DeleteButton label={`Delete boost for ${r.sku}`} size="sm" onClick={() => handleDelete(r.id)} disabled={pending} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2.5 tabular-nums text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
      {children}
    </th>
  )
}
