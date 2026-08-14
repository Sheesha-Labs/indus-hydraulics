'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { resolveNotFoundWithRedirect, ignoreNotFound } from './actions'

type Row = {
  id: string
  path: string
  referer: string | null
  hits: number
  firstSeenAt: string
  lastSeenAt: string
}

interface Props {
  rows: Row[]
}

/**
 * Shows unresolved NotFoundLog rows (top hits first). Each row gets a
 * "Resolve" inline form that 301-redirects the path somewhere — and
 * an "Ignore" button to stash the row out of the active list.
 */
export default function NotFoundList({ rows: initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleResolve(formData: FormData) {
    setError(null)
    const id = formData.get('notFoundId') as string
    startTransition(async () => {
      const res = await resolveNotFoundWithRedirect(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
      setEditingId(null)
    })
  }

  function handleIgnore(id: string) {
    setError(null)
    startTransition(async () => {
      const res = await ignoreNotFound(id)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div className="max-w-[1080px]">
      <div className="mb-4 max-w-[640px] text-[13px] text-[var(--color-muted)]">
        Storefront 404s, top hits first. Resolve each by adding a 301
        redirect, or Ignore to stash. The storefront&apos;s{' '}
        <code>not-found.tsx</code> fires a beacon on render — so this list
        only fills in once visitors actually hit broken paths.{' '}
        <Link href="/admin/seo/redirects" className="underline">
          Existing redirects →
        </Link>
      </div>

      {error && (
        <p className="mb-4 font-mono text-[12px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[var(--color-border)]">
          <p className="text-[var(--color-muted)] text-[13px]">
            Nothing unresolved — every captured 404 either has a redirect or was ignored.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-deep)]">
                <Th>Path</Th>
                <Th>Hits</Th>
                <Th>Referer</Th>
                <Th>Last seen</Th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--color-border)] last:border-0 align-top hover:bg-[var(--color-deep)]"
                >
                  <td className="px-3 py-3 font-mono text-[12px] text-[var(--color-body)] truncate max-w-[300px]">
                    {r.path}
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] tabular-nums text-[var(--color-body)]">
                    {r.hits.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-muted)] truncate max-w-[280px]">
                    {r.referer ?? '—'}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-[var(--color-muted)] whitespace-nowrap">
                    {new Date(r.lastSeenAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {editingId === r.id ? (
                      <form action={handleResolve} className="flex gap-2 items-center justify-end">
                        <input type="hidden" name="notFoundId" value={r.id} />
                        <input
                          name="toPath"
                          required
                          placeholder="/replacement-path"
                          className="h-8 px-2 border border-[var(--color-border)] bg-white text-[12px] focus:outline-none focus:border-[var(--color-accent)] w-[200px]"
                        />
                        <select
                          name="statusCode"
                          defaultValue="301"
                          className="h-8 px-2 border border-[var(--color-border)] bg-white text-[12px]"
                        >
                          <option value="301">301</option>
                          <option value="302">302</option>
                          <option value="307">307</option>
                          <option value="308">308</option>
                        </select>
                        <button
                          type="submit"
                          disabled={pending}
                          className="h-8 px-3 bg-[var(--color-accent)] text-white font-mono text-[11px] disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="h-8 px-3 border border-[var(--color-border)] font-mono text-[11px]"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingId(r.id)}
                          disabled={pending}
                          className="font-mono text-[11px] text-[var(--color-accent)] hover:underline mr-3 disabled:opacity-50"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIgnore(r.id)}
                          disabled={pending}
                          className="font-mono text-[11px] text-[var(--color-muted)] hover:underline disabled:opacity-50"
                        >
                          Ignore
                        </button>
                      </>
                    )}
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
    <th className="text-left px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
      {children}
    </th>
  )
}
