'use client'

import { useState, useTransition } from 'react'
import {
  upsertSearchRedirect,
  deleteSearchRedirect,
  toggleSearchRedirect,
} from './actions'

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
            r.query === queryRaw ? { ...r, targetUrl: target, isActive: true } : r,
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
      <div className="mb-6 max-w-[640px] text-[13px] text-ih-muted">
        When a shopper&apos;s normalised query matches one of these rules, the storefront
        302-redirects them to the configured target instead of running a full FTS search.
        Distinct from <code>/seo/redirects</code> (those are HTTP-path redirects).
      </div>

      <details className="mb-6 border border-ih-border bg-ih-surface p-4">
        <summary className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted cursor-pointer">
          Add query redirect
        </summary>
        <form action={handleAdd} className="mt-3 grid grid-cols-[200px_1fr_auto] gap-3 items-end">
          <div>
            <label className="block font-mono text-[10px] uppercase text-ih-muted mb-1">
              Query (normalised)
            </label>
            <input
              name="query"
              type="text"
              required
              placeholder="hose fitting"
              className="w-full h-9 px-3 border border-ih-border bg-ih-bg text-[13px] focus:outline-none focus:border-ih-accent"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase text-ih-muted mb-1">
              Target URL
            </label>
            <input
              name="targetUrl"
              type="text"
              required
              placeholder="/c/hose-fittings"
              className="w-full h-9 px-3 border border-ih-border bg-ih-bg text-[13px] focus:outline-none focus:border-ih-accent"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </details>

      {error && (
        <p className="mb-4 font-mono text-[12px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-ih-border">
          <p className="text-ih-muted text-[13px]">No query redirects yet.</p>
        </div>
      ) : (
        <div className="border border-ih-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ih-border bg-ih-surface-2">
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
                  className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
                >
                  <td className="px-3 py-3 font-mono text-[12px] text-ih-ink-2">{r.query}</td>
                  <td className="px-3 py-3 text-ih-ink-2 truncate max-w-[400px]" title={r.targetUrl}>
                    {r.targetUrl}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(r.id, r.isActive)}
                      disabled={pending}
                      className={`font-mono text-[11px] px-2 py-0.5 ${
                        r.isActive
                          ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
                          : 'text-ih-muted bg-ih-surface-2'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={pending}
                      className="font-mono text-[11px] text-ih-danger hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
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
    <th className="text-left px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">
      {children}
    </th>
  )
}
