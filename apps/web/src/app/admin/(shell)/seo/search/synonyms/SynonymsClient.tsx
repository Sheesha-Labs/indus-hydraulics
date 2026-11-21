'use client'

import { useState, useTransition } from 'react'
import { upsertSynonymGroup, deleteSynonymGroup, toggleSynonymGroup } from './actions'
import { Input, DeleteButton } from '@indus/ui'

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
          .filter((t) => t.length > 0)
      )
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
          return prev.map((g) => (g.group === groupName ? { ...g, terms, isActive: true } : g))
        }
        return [...prev, { group: groupName, terms, isActive: true }].sort((a, b) =>
          a.group.localeCompare(b.group)
        )
      })
      setEditing(null)
    })
  }

  function handleDelete(group: string) {
    if (
      !confirm(
        `Delete the synonym group "${group}"? Storefront search will lose the expansion immediately.`
      )
    )
      return
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
      <div className="text-ih-muted mb-6 max-w-[640px] text-[13px]">
        Synonyms are bidirectional within a group. When a shopper searches for any term in a group,
        the FTS query expands to include all of the group&apos;s terms.
      </div>

      {/* Add new group */}
      <details className="border-ih-border bg-ih-surface mb-6 rounded-lg border p-4">
        <summary className="text-ih-muted cursor-pointer text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
          Add synonym group
        </summary>
        <form action={handleSave} className="mt-3 grid grid-cols-[200px_1fr_auto] items-end gap-3">
          <div>
            <label
              htmlFor="synonym-group"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Group name
            </label>
            <Input id="synonym-group" name="group" type="text" required placeholder="o-ring" />
          </div>
          <div>
            <label
              htmlFor="synonym-terms"
              className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
            >
              Terms (comma- or newline-separated)
            </label>
            <Input
              id="synonym-terms"
              name="terms"
              type="text"
              required
              placeholder="o-ring, oring, o ring"
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

      {groups.length === 0 ? (
        <div className="border-ih-border rounded-lg border py-16 text-center">
          <p className="text-ih-muted text-[13px]">No synonym groups yet.</p>
        </div>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-ih-border bg-ih-surface-2 border-b">
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
                  className="border-ih-border hover:bg-ih-surface-2 border-b align-top last:border-0"
                >
                  <td className="text-ih-ink-2 px-3 py-3 text-[12px] whitespace-nowrap tabular-nums">
                    {g.group}
                  </td>
                  <td className="px-3 py-3">
                    {editing === g.group ? (
                      <form action={handleSave} className="flex items-center gap-2">
                        <input type="hidden" name="group" value={g.group} />
                        {/*
                          No id: this renders once per row, so a static one
                          would duplicate the add-form's and every getElementById
                          would resolve to whichever came first. There is no
                          visible label in a table row either, so the accessible
                          name has to come from aria-label.
                        */}
                        <Input
                          name="terms"
                          type="text"
                          aria-label={`Terms for ${g.group}`}
                          defaultValue={g.terms.join(', ')}
                          className="h-8 flex-1 text-[12px]"
                        />
                        <button
                          type="submit"
                          disabled={pending}
                          className="bg-ih-accent text-ih-accent-fg h-8 px-3 text-[11px] tabular-nums disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="border-ih-border h-8 rounded-md border px-3 text-[11px] tabular-nums"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {g.terms.map((t) => (
                          <span
                            key={t}
                            className="bg-ih-surface-2 border-ih-border rounded-[3px] border px-1.5 py-0.5 text-[11px] tabular-nums"
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
                      className={`px-2 py-0.5 text-[11px] tabular-nums ${
                        g.isActive
                          ? 'text-ih-success-ink bg-ih-success-soft'
                          : 'text-ih-muted bg-ih-surface-2'
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
                        className="text-ih-muted hover:text-ih-ink mr-3 text-[11px] tabular-nums"
                      >
                        Edit
                      </button>
                    )}
                    <DeleteButton
                      label={`Delete synonym group ${g.group}`}
                      size="sm"
                      onClick={() => handleDelete(g.group)}
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
