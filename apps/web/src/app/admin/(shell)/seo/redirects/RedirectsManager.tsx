'use client'

import { useState, useTransition } from 'react'
import type { Redirect } from '@indus/db'
import { addRedirect, deleteRedirect } from '../actions'
import { Input, Select } from '@indus/ui'

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
        className="border border-ih-border bg-ih-surface p-4 mb-6"
      >
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
          Add redirect
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="redirect-fromPath" className="block font-mono text-[10.5px] uppercase text-ih-muted mb-1">
              From path
            </label>
            <Input
              id="redirect-fromPath"
              name="fromPath"
              type="text"
              required
              placeholder="/old-page" />
          </div>
          <div className="flex-1">
            <label htmlFor="redirect-toPath" className="block font-mono text-[10.5px] uppercase text-ih-muted mb-1">
              To path
            </label>
            <Input
              id="redirect-toPath"
              name="toPath"
              type="text"
              required
              placeholder="/new-page" />
          </div>
          <div className="w-24">
            <label htmlFor="redirect-statusCode" className="block font-mono text-[10.5px] uppercase text-ih-muted mb-1">
              Code
            </label>
            <Select
              id="redirect-statusCode"
              name="statusCode">
              <option value="301">301</option>
              <option value="302">302</option>
              <option value="307">307</option>
              <option value="308">308</option>
            </Select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="h-9 px-4 bg-ih-accent text-ih-accent-fg font-mono text-[12px] hover:bg-ih-accent-hover disabled:opacity-50 shrink-0"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="mt-2 font-mono text-[11px] text-ih-danger-ink" role="alert">
            {error}
          </p>
        )}
      </form>

      {redirects.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-ih-border">
          <p className="text-ih-muted text-[13px]">No redirects configured.</p>
        </div>
      ) : (
        <div className="border border-ih-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ih-border bg-ih-surface-2">
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
                  className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-ih-muted">
                    {r.fromPath}
                  </td>
                  <td className="px-4 py-3 text-ih-ink-2">{r.toPath}</td>
                  <td className="px-4 py-3 font-mono text-[12px]">{r.statusCode}</td>
                  <td className="px-4 py-3 font-mono text-[12px] tabular-nums">
                    {r.hits ?? 0}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ih-muted">
                    {r.lastHitAt ? new Date(r.lastHitAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={isPending}
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
    <th className="text-left px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
      {children}
    </th>
  )
}
