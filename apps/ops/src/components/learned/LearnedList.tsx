'use client'

import { Button, Toggle } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  editPreferenceAction,
  removePreferenceAction,
  togglePreferenceAction,
} from '../../app/(console)/assistant/learned/actions/learned'
import type { LearnedRow } from '../../data/preferences'

const GROUPS = [
  { key: 'clients', label: 'Clients' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'suppliers', label: 'Suppliers and mail' },
] as const

/**
 * Board 115's list (S07-T05): preferences in Clients, Pricing, Suppliers and mail; each with its counterparty
 * chip, the sentence, where it came from (linked to the evidence in the Assistant log), Edit, an on/off switch
 * and Remove. The Owner edits; the Helper reads.
 */
export default function LearnedList({ rows, canEdit }: { rows: LearnedRow[]; canEdit: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState<LearnedRow | null>(null)
  const [text, setText] = useState('')

  async function run(p: Promise<{ success: boolean; error?: string }>, ok: string) {
    const res = await p
    if (!res.success) toast({ kind: 'error', title: res.error ?? 'Could not save' })
    else toast({ kind: 'success', title: ok })
    router.refresh()
    return res.success
  }

  if (!rows.length)
    return (
      <p className="rounded-io-card border-io-line text-io-ink-3 m-0 border border-dashed px-4 py-6 text-center text-[13px]">
        Nothing learned yet. Preferences appear here after three similar edits, rejections or
        choices.
      </p>
    )
  return (
    <div data-part="learned-list" className="flex flex-col gap-4">
      {GROUPS.map((g) => {
        const list = rows.filter((r) => r.group === g.key)
        if (!list.length) return null
        return (
          <section key={g.key} aria-labelledby={`lg-${g.key}`} className="flex flex-col gap-2.5">
            <h2 id={`lg-${g.key}`} className="io-eyebrow m-0 font-normal">
              {g.label}
            </h2>
            <ul className="rounded-io-card border-io-line bg-io-card m-0 list-none overflow-hidden border p-0">
              {list.map((r) => (
                <li
                  key={r.id}
                  data-part="learned-row"
                  data-state={r.enabled ? 'on' : 'off'}
                  className="border-io-line grid min-h-[57px] grid-cols-[130px_minmax(0,1fr)_200px_auto] items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
                >
                  <span className="rounded-io-tag bg-io-fill text-io-ink-2 w-fit max-w-full truncate px-2 py-1 text-[11.5px]">
                    {r.chip}
                  </span>
                  <span
                    className={r.enabled ? 'text-[13px]' : 'text-io-ink-3 text-[13px] line-through'}
                  >
                    {r.description}
                  </span>
                  {r.evidence[0] ? (
                    <Link
                      href={`/assistant/log?open=${r.evidence[0]}` as Route}
                      className="io-focus rounded-io-tag text-io-ink-3 text-[12.5px] hover:underline"
                    >
                      {r.source}
                    </Link>
                  ) : (
                    <span className="text-io-ink-3 text-[12.5px]">{r.source}</span>
                  )}
                  <span className="flex items-center gap-2">
                    {canEdit ? (
                      <>
                        <Toggle
                          aria-label={`Use: ${r.description}`}
                          checked={r.enabled}
                          onCheckedChange={(v) =>
                            void run(
                              togglePreferenceAction({ id: r.id, enabled: v }),
                              v ? 'Switched on' : 'Switched off'
                            )
                          }
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setText(r.description)
                            setEditing(r)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove: ${r.description}`}
                          onClick={() => void run(removePreferenceAction({ id: r.id }), 'Removed')}
                        >
                          Remove
                        </Button>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      {editing ? (
        <Modal
          open
          onOpenChange={(o) => {
            if (!o) setEditing(null)
          }}
          title="Edit preference"
          actions={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (
                    await run(editPreferenceAction({ id: editing.id, description: text }), 'Saved')
                  )
                    setEditing(null)
                }}
              >
                Save
              </Button>
            </>
          }
        >
          <label className="flex flex-col gap-1.5 text-[13px]">
            Preference
            <textarea
              value={text}
              rows={3}
              onChange={(e) => setText(e.target.value)}
              className="io-focus-field rounded-io-ctl border-io-stroke border px-2.5 py-2"
            />
          </label>
          <p className="text-io-ink-3 m-0 mt-2 text-[12px]">
            Wording and choices only: a preference never changes a level, an approval, a check or
            money.
          </p>
        </Modal>
      ) : null}
    </div>
  )
}
