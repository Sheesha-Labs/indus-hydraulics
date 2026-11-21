'use client'

import { useState, useTransition } from 'react'
import { upsertSearchRedirect, deleteSearchRedirect, toggleSearchRedirect } from './actions'
import { Input, DeleteButton } from '@indus/ui'

type Row = { id: string; query: string; targetUrl: string; isActive: boolean }

interface Props {
  rows: Row[]
}

export default function SearchRedirectsClient({ rows: initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleAdd(formData: FormData) {
    setError(null)
    const queryRaw = ((formData.get('query') as string) ?? '').trim().toLowerCase()
    const target = ((formData.get('targetUrl') as string) ?? '').trim()
    startTransition(async () => {
      const res = await upsertSearchRedirect(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRows((prev) => {
        const existing = prev.find((r) => r.query === queryRaw)
        if (existing) {
          return prev.map((r) =>
            r.query === queryRaw ? { ...r, targetUrl: target, isActive: true } : r
          )
        }
        return [
          {
            id: `tmp-${Date.now()}`,
            query: queryRaw,
            targetUrl: target,
            isActive: true,
          },
          ...prev,
        ]
      })
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this query redirect?')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteSearchRedirect(id)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    })
  }

  function handleToggle(id: string, current: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await toggleSearchRedirect(id, !current)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r)))
    })
  }

  return (
    <div className="max-w-[860px]">
      <div className="text-ih-muted mb-6 max-w-[640px] text-[13px]">
        When a shopper&apos;s normalised query matches one of these rules, the storefront
        302-redirects them to the configured target instead of running a full FTS search. Distinct
        from <code>/seo/redirects</code> (those are HTTP-path redirects).
      </div>

      <details className="border-ih-border bg-ih-surface mb-6 rounded-lg border p-4">
        <summary className="text-ih-muted cursor-pointer text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
          Add query redirect
        </summary>
        <form action={handleAdd} className="mt-3 grid grid-cols-[200px_1fr_auto] items-end gap-3">
          <div>
            <label
              htmlFor="searchredirect-query"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Query (normalised)
            </label>
            <Input
              id="searchredirect-query"
              name="query"
              type="text"
              required
              placeholder="hose fitting"
            />
          </div>
          <div>
            <label
              htmlFor="searchredirect-targetUrl"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Target URL
            </label>
            <Input
              id="searchredirect-targetUrl"
              name="targetUrl"
              type="text"
              required
              placeholder="/c/hose-fittings"
            />
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
          <p className="text-ih-muted text-[13px]">No query redirects yet.</p>
        </div>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-ih-border bg-ih-surface-2 border-b">
                <Th>Query</Th>
                <Th>Target</Th>
                <Th>Status</Th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-ih-border hover:bg-ih-surface-2 border-b last:border-0"
                >
                  <td className="text-ih-ink-2 px-3 py-3 text-[12px] tabular-nums">{r.query}</td>
                  <td
                    className="text-ih-ink-2 max-w-[400px] truncate px-3 py-3"
                    title={r.targetUrl}
                  >
                    {r.targetUrl}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(r.id, r.isActive)}
                      disabled={pending}
                      className={`px-2 py-0.5 text-[11px] tabular-nums ${
                        r.isActive
                          ? 'text-ih-success-ink bg-ih-success-soft'
                          : 'text-ih-muted bg-ih-surface-2'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <DeleteButton
                      label={`Delete redirect for ${r.query}`}
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
