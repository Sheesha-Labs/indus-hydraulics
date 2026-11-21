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
      <div className="text-ih-muted mb-4 max-w-[640px] text-[13px]">
        Storefront 404s, top hits first. Resolve each by adding a 301 redirect, or Ignore to stash.
        The storefront&apos;s <code>not-found.tsx</code> fires a beacon on render — so this list
        only fills in once visitors actually hit broken paths.{' '}
        <Link href="/admin/seo/redirects" className="underline">
          Existing redirects →
        </Link>
      </div>

      {error && (
        <p className="text-ih-danger-ink mb-4 text-[12px] tabular-nums" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="border-ih-border rounded-lg border py-16 text-center">
          <p className="text-ih-muted text-[13px]">
            Nothing unresolved — every captured 404 either has a redirect or was ignored.
          </p>
        </div>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-ih-border bg-ih-surface-2 border-b">
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
                  className="border-ih-border hover:bg-ih-surface-2 border-b align-top last:border-0"
                >
                  <td className="text-ih-ink-2 max-w-[300px] truncate px-3 py-3 text-[12px] tabular-nums">
                    {r.path}
                  </td>
                  <td className="text-ih-ink-2 px-3 py-3 text-[12px] tabular-nums">
                    {r.hits.toLocaleString()}
                  </td>
                  <td className="text-ih-muted max-w-[280px] truncate px-3 py-3 text-[11px] tabular-nums">
                    {r.referer ?? '—'}
                  </td>
                  <td className="text-ih-muted px-3 py-3 text-[11px] whitespace-nowrap tabular-nums">
                    {new Date(r.lastSeenAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {editingId === r.id ? (
                      <form action={handleResolve} className="flex items-center justify-end gap-2">
                        <input type="hidden" name="notFoundId" value={r.id} />
                        <input
                          name="toPath"
                          required
                          placeholder="/replacement-path"
                          className="border-ih-border bg-ih-surface focus:border-ih-accent h-8 w-[200px] rounded-md border px-2 text-[12px] focus:outline-none"
                        />
                        <select
                          name="statusCode"
                          defaultValue="301"
                          className="border-ih-border bg-ih-surface h-8 rounded-md border px-2 text-[12px]"
                        >
                          <option value="301">301</option>
                          <option value="302">302</option>
                          <option value="307">307</option>
                          <option value="308">308</option>
                        </select>
                        <button
                          type="submit"
                          disabled={pending}
                          className="bg-ih-accent text-ih-accent-fg h-8 px-3 text-[11px] tabular-nums disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="border-ih-border h-8 rounded-md border px-3 text-[11px] tabular-nums"
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
                          className="text-ih-accent mr-3 text-[11px] tabular-nums hover:underline disabled:opacity-50"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIgnore(r.id)}
                          disabled={pending}
                          className="text-ih-muted text-[11px] tabular-nums hover:underline disabled:opacity-50"
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
    <th className="text-ih-muted px-3 py-2.5 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
      {children}
    </th>
  )
}
