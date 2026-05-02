'use client'

import { useState, useTransition } from 'react'
import { upsertSynonymGroup, deleteSynonymGroup, toggleSynonymGroup } from './actions'

type Group = { group: string; terms: string[]; isActive: boolean }

interface Props {
  groups: Group[]
}

export default function SynonymsClient({ groups: initialGroups }: Props) {
  const [groups, setGroups] = useState(initialGroups)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSave(formData: FormData) {
    setError(null)
    const groupName = (formData.get('group') as string) ?? ''
    const termsRaw = (formData.get('terms') as string) ?? ''
    const terms = Array.from(
      new Set(
        termsRaw
          .split(/[,\n]/)
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0),
      ),
    )
    startTransition(async () => {
      const res = await upsertSynonymGroup(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setGroups((prev) => {
        const exists = prev.find((g) => g.group === groupName)
        if (exists) {
          return prev.map((g) =>
            g.group === groupName ? { ...g, terms, isActive: true } : g,
          )
        }
        return [...prev, { group: groupName, terms, isActive: true }].sort((a, b) =>
          a.group.localeCompare(b.group),
        )
      })
      setEditing(null)
    })
  }

  function handleDelete(group: string) {
    if (!confirm(`Delete the synonym group "${group}"? Storefront search will lose the expansion immediately.`)) return
    setError(null)
    startTransition(async () => {
      const res = await deleteSynonymGroup(group)
      if (!res.success) {
        setError(res.message)
        return
      }
      setGroups((prev) => prev.filter((g) => g.group !== group))
    })
  }

  function handleToggle(group: string, current: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await toggleSynonymGroup(group, !current)
      if (!res.success) {
        setError(res.message)
        return
      }
      setGroups((prev) => prev.map((g) => (g.group === group ? { ...g, isActive: !current } : g)))
    })
  }

  return (
    <div className="max-w-[860px]">
      <div className="mb-6 max-w-[640px] text-[13px] text-[var(--color-muted)]">
        Synonyms are bidirectional within a group. When a shopper searches for any term in a
        group, the FTS query expands to include all of the group&apos;s terms.
      </div>

      {/* Add new group */}
      <details className="mb-6 border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
        <summary className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] cursor-pointer">
          Add synonym group
        </summary>
        <form action={handleSave} className="mt-3 grid grid-cols-[200px_1fr_auto] gap-3 items-end">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">
              Group name
            </label>
            <input
              name="group"
              type="text"
              required
              placeholder="o-ring"
              className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">
              Terms (comma- or newline-separated)
            </label>
            <input
              name="terms"
              type="text"
              required
              placeholder="o-ring, oring, o ring"
              className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
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

      {groups.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[var(--color-border)]">
          <p className="text-[var(--color-muted)] text-[13px]">No synonym groups yet.</p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-deep)]">
                <Th>Group</Th>
                <Th>Terms</Th>
                <Th>Status</Th>
                <th />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.group}
                  className="border-b border-[var(--color-border)] last:border-0 align-top hover:bg-[var(--color-deep)]"
                >
                  <td className="px-3 py-3 font-mono text-[12px] text-[var(--color-body)] whitespace-nowrap">
                    {g.group}
                  </td>
                  <td className="px-3 py-3">
                    {editing === g.group ? (
                      <form action={handleSave} className="flex gap-2 items-center">
                        <input type="hidden" name="group" value={g.group} />
                        <input
                          name="terms"
                          type="text"
                          defaultValue={g.terms.join(', ')}
                          className="flex-1 h-8 px-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[12px] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                        <button
                          type="submit"
                          disabled={pending}
                          className="h-8 px-3 bg-[var(--color-accent)] text-white font-mono text-[11px] disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="h-8 px-3 border border-[var(--color-border)] font-mono text-[11px]"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {g.terms.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 font-mono text-[11px] bg-[var(--color-deep)] border border-[var(--color-border)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(g.group, g.isActive)}
                      disabled={pending}
                      className={`font-mono text-[11px] px-2 py-0.5 ${
                        g.isActive
                          ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
                          : 'text-[var(--color-muted)] bg-[var(--color-deep)]'
                      }`}
                    >
                      {g.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {editing !== g.group && (
                      <button
                        type="button"
                        onClick={() => setEditing(g.group)}
                        className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)] mr-3"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(g.group)}
                      disabled={pending}
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
    <th className="text-left px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
      {children}
    </th>
  )
}
