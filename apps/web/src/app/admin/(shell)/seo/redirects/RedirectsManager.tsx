'use client'

import { useState, useTransition } from 'react'
import type { Redirect } from '@indus/db'
import { addRedirect, deleteRedirect } from '../actions'

interface Props {
  redirects: Redirect[]
}

/**
 * 301/302/307/308 redirects, surfaced with hit counts so admins can spot
 * dead rules. The middleware (apps/web/proxy.ts) is the consumer —
 * a future commit wires the `hits` increment.
 */
export default function RedirectsManager({ redirects: initialRedirects }: Props) {
  const [isPending, startTransition] = useTransition()
  const [redirects, setRedirects] = useState(initialRedirects)
  const [error, setError] = useState<string | null>(null)

  function handleAdd(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addRedirect(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      const from = formData.get('fromPath') as string
      const to = formData.get('toPath') as string
      const code = parseInt(formData.get('statusCode') as string, 10) || 301
      setRedirects((prev) => [
        {
          id: Date.now().toString(),
          fromPath: from,
          toPath: to,
          statusCode: code,
          createdAt: new Date(),
          hits: 0,
          lastHitAt: null,
          isActive: true,
          createdById: null,
          notes: null,
        } as Redirect,
        ...prev.filter((r) => r.fromPath !== from),
      ])
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const res = await deleteRedirect(id)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRedirects((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div className="max-w-[960px]">
      <form
        action={handleAdd}
        className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 mb-6"
      >
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">
          Add redirect
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">
              From path
            </label>
            <input
              name="fromPath"
              type="text"
              required
              placeholder="/old-page"
              className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div className="flex-1">
            <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">
              To path
            </label>
            <input
              name="toPath"
              type="text"
              required
              placeholder="/new-page"
              className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div className="w-24">
            <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">
              Code
            </label>
            <select
              name="statusCode"
              className="w-full h-9 px-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none"
            >
              <option value="301">301</option>
              <option value="302">302</option>
              <option value="307">307</option>
              <option value="308">308</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="h-9 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="mt-2 font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </p>
        )}
      </form>

      {redirects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[var(--color-border)]">
          <p className="text-[var(--color-muted)] text-[13px]">No redirects configured.</p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-deep)]">
                <Th>From</Th>
                <Th>To</Th>
                <Th>Code</Th>
                <Th>Hits</Th>
                <Th>Last hit</Th>
                <th />
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-deep)]"
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-muted)]">
                    {r.fromPath}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-body)]">{r.toPath}</td>
                  <td className="px-4 py-3 font-mono text-[12px]">{r.statusCode}</td>
                  <td className="px-4 py-3 font-mono text-[12px] tabular-nums">
                    {r.hits ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--color-muted)]">
                    {r.lastHitAt ? new Date(r.lastHitAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={isPending}
                      className="font-mono text-[11px] text-[var(--color-danger)] hover:underline disabled:opacity-50"
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
    <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
      {children}
    </th>
  )
}
