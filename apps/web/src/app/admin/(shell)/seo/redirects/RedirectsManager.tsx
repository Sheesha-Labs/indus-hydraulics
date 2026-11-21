'use client'

import { useState, useTransition } from 'react'
import type { Redirect } from '@indus/db'
import { addRedirect, deleteRedirect } from '../actions'
import { Input, Select, DeleteButton } from '@indus/ui'

interface Props {
  redirects: Redirect[]
}

/**
 * 301/302/307/308 redirects, surfaced with hit counts so admins can spot
 * dead rules. apps/web/src/proxy.ts is the consumer, via
 * src/lib/redirects.ts, which also increments `hits` on every serve.
 *
 * Rows here are not all hand-written: renaming a category slug creates one
 * automatically (see lib/slug-redirect.ts).
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
        className="border-ih-border bg-ih-surface mb-6 rounded-lg border p-4"
      >
        <p className="text-ih-muted mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
          Add redirect
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="redirect-fromPath"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              From path
            </label>
            <Input
              id="redirect-fromPath"
              name="fromPath"
              type="text"
              required
              placeholder="/old-page"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="redirect-toPath"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              To path
            </label>
            <Input
              id="redirect-toPath"
              name="toPath"
              type="text"
              required
              placeholder="/new-page"
            />
          </div>
          <div className="w-24">
            <label
              htmlFor="redirect-statusCode"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Code
            </label>
            <Select id="redirect-statusCode" name="statusCode">
              <option value="301">301</option>
              <option value="302">302</option>
              <option value="307">307</option>
              <option value="308">308</option>
            </Select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 shrink-0 px-4 text-[12px] tabular-nums disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="text-ih-danger-ink mt-2 text-[11px] tabular-nums" role="alert">
            {error}
          </p>
        )}
      </form>

      {redirects.length === 0 ? (
        <div className="border-ih-border rounded-lg border py-16 text-center">
          <p className="text-ih-muted text-[13px]">No redirects configured.</p>
        </div>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-ih-border bg-ih-surface-2 border-b">
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
                  className="border-ih-border hover:bg-ih-surface-2 border-b last:border-0"
                >
                  <td className="text-ih-muted px-4 py-3 text-[12px] tabular-nums">{r.fromPath}</td>
                  <td className="text-ih-ink-2 px-4 py-3">{r.toPath}</td>
                  <td className="px-4 py-3 text-[12px] tabular-nums">{r.statusCode}</td>
                  <td className="px-4 py-3 text-[12px] tabular-nums">{r.hits ?? 0}</td>
                  <td className="text-ih-muted px-4 py-3 text-[11px] tabular-nums">
                    {r.lastHitAt ? new Date(r.lastHitAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      label={`Delete redirect from ${r.fromPath}`}
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      disabled={isPending}
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
    <th className="text-ih-muted px-4 py-2.5 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
      {children}
    </th>
  )
}
