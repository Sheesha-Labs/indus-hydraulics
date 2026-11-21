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
      <div className="text-ih-muted mb-6 max-w-[640px] text-[13px]">
        Boosts multiply a product&apos;s rank score at search time.
        <strong> 1.0</strong> is neutral, <strong>{'>'}1</strong> lifts, <strong>{'<'}1</strong>{' '}
        buries, <strong>0</strong> effectively hides. Optional expiry auto-clears the boost.
      </div>

      <details className="border-ih-border bg-ih-surface mb-6 rounded-lg border p-4">
        <summary className="text-ih-muted cursor-pointer text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
          Add product boost
        </summary>
        <form
          action={handleAdd}
          className="mt-3 grid grid-cols-[1fr_120px_180px_auto] items-end gap-3"
        >
          <div>
            <label
              htmlFor="boost-sku"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Product SKU
            </label>
            <Input id="boost-sku" name="sku" type="text" required placeholder="ABC-1234" />
          </div>
          <div>
            <label
              htmlFor="boost-boost"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
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
              defaultValue="1.5"
            />
          </div>
          <div>
            <label
              htmlFor="boost-expiresAt"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Expires (optional)
            </label>
            <Input id="boost-expiresAt" name="expiresAt" type="datetime-local" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-4 text-[12px] tabular-nums disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </details>

      {error && (
        <p className="text-ih-danger-ink mb-4 text-[12px] tabular-nums" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="border-ih-border rounded-lg border py-16 text-center">
          <p className="text-ih-muted text-[13px]">No boosts configured.</p>
        </div>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-ih-border bg-ih-surface-2 border-b">
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
                  className="border-ih-border hover:bg-ih-surface-2 border-b last:border-0"
                >
                  <td className="px-3 py-3">
                    <div className="text-ih-ink-2 max-w-[400px] truncate">{r.title}</div>
                    <div className="text-ih-muted text-[11px] tabular-nums">{r.sku}</div>
                  </td>
                  <td className="text-ih-ink-2 px-3 py-3 text-[12px] tabular-nums">
                    × {r.boost.toFixed(2)}
                  </td>
                  <td className="text-ih-muted px-3 py-3 text-[11px] tabular-nums">
                    {r.expiresAt
                      ? new Date(r.expiresAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <DeleteButton
                      label={`Delete boost for ${r.sku}`}
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      disabled={pending}
                    />
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
    <th className="text-ih-muted px-3 py-2.5 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
      {children}
    </th>
  )
}
