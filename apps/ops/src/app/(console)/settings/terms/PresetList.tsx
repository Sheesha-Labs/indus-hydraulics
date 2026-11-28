'use client'

import type { TermsCategory } from '@indus/ops-core'
import { Button, Checkbox } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { cn } from '@indus/ops-ui'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { PresetView } from '../../../../server/terms/clauses'
import { assignPresetAction, createPresetAction, setDefaultPresetAction } from './actions/terms'

interface PresetListProps {
  presets: PresetView[]
  selectedId: string | null
  category: TermsCategory
  clients: { id: string; name: string }[]
  allClauses: { id: string; code: string; title: string }[]
  isOwner: boolean
}

/**
 * Board 39's presets: each a card (its clause codes, its description, who has it); one picked shows its values
 * on the clause cards. The Owner makes one the default for new clients, gives it to clients, or adds a preset.
 */
export default function PresetList(p: PresetListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [assigning, setAssigning] = useState(false)
  const [adding, setAdding] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)
  const selected = p.presets.find((x) => x.id === p.selectedId) ?? null
  const shown = useMemo(
    () => p.clients.filter((c) => c.name.toLowerCase().includes(filter.trim().toLowerCase())),
    [p.clients, filter]
  )

  async function run(r: Promise<{ success: boolean; error?: string }>, ok: string) {
    setBusy(true)
    const res = await r
    setBusy(false)
    if (!res.success) {
      toast({ kind: 'error', title: res.error ?? 'Something went wrong' })
      return false
    }
    toast({ kind: 'success', title: ok })
    router.refresh()
    return true
  }

  const href = (id: string | null) =>
    `/settings/terms?category=${p.category}${id ? `&preset=${id}` : ''}` as Route

  return (
    <section aria-labelledby="presets-eyebrow" className="flex flex-col gap-2.5">
      <h3 id="presets-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
        Presets
      </h3>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {p.presets.map((x) => {
          const on = x.id === p.selectedId
          return (
            <li key={x.id}>
              <Link
                href={href(on ? null : x.id)}
                aria-current={on ? 'true' : undefined}
                className={cn(
                  'rounded-io-card io-focus flex flex-col gap-1 border px-3.5 py-3',
                  on ? 'border-io-accent bg-io-accent-wash' : 'border-io-line bg-io-card hover:bg-io-paper'
                )}
              >
                <span className="text-[13.5px] font-medium">{x.name}</span>
                <span className="text-io-ink-2 text-[12px]">
                  {[x.clauseCodes.slice(0, 1).join(''), x.description].filter(Boolean).join(' · ')}
                </span>
                <span className={cn('text-[12px]', on ? 'text-io-ink-2' : 'text-io-ink-3')}>
                  {x.isDefaultForNewClient
                    ? 'Default for new clients'
                    : x.clientCount
                      ? `${x.clients.map((c) => c.name).join(', ')}${x.clientCount > x.clients.length ? ` and ${x.clientCount - x.clients.length} more` : ''}`
                      : 'No clients yet'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {p.isOwner ? (
        <div className="flex flex-wrap gap-2">
          {selected && !selected.isDefaultForNewClient ? (
            <Button
              size="sm"
              busy={busy}
              onClick={() =>
                run(
                  setDefaultPresetAction({ presetId: selected.id }),
                  `${selected.name} is the default for new clients`
                )
              }
            >
              Make default
            </Button>
          ) : null}
          {selected ? (
            <Button size="sm" onClick={() => setAssigning(true)}>
              Give to clients
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            Add a preset
          </Button>
        </div>
      ) : null}
      {selected ? (
        <Modal
          open={assigning}
          onOpenChange={setAssigning}
          title={`Give ${selected.name} to clients`}
          note="Each client's own documents pick it up from the next one."
          actions={
            <>
              <Button variant="ghost" onClick={() => setAssigning(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!picked.size}
                busy={busy}
                onClick={async () => {
                  if (
                    await run(
                      assignPresetAction({ presetId: selected.id, companyIds: [...picked] }),
                      `${selected.name} given to ${picked.size} client${picked.size === 1 ? '' : 's'}`
                    )
                  ) {
                    setAssigning(false)
                    setPicked(new Set())
                  }
                }}
              >
                Give to {picked.size || ''} client{picked.size === 1 ? '' : 's'}
              </Button>
            </>
          }
        >
          <input
            type="search"
            aria-label="Find a client"
            placeholder="Find a client"
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card mb-3 w-full border px-3 text-[13px]"
          />
          <div className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto">
            {shown.map((c) => (
              <Checkbox
                key={c.id}
                label={c.name}
                checked={picked.has(c.id)}
                onChange={(e) => {
                  const next = new Set(picked)
                  if (e.currentTarget.checked) next.add(c.id)
                  else next.delete(c.id)
                  setPicked(next)
                }}
              />
            ))}
            {shown.length ? null : <span className="text-io-ink-3 text-[12.5px]">No client matches.</span>}
          </div>
        </Modal>
      ) : null}
      <Modal
        open={adding}
        onOpenChange={setAdding}
        title="Add a preset"
        actions={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="new-preset" busy={busy}>
              Add preset
            </Button>
          </>
        }
      >
        <form
          id="new-preset"
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const ok = await run(
              createPresetAction({
                name: String(f.get('name') ?? ''),
                description: String(f.get('description') ?? '').trim() || null,
                clauseIds: f.getAll('clause').map(String),
              }),
              'Preset added'
            )
            if (ok) setAdding(false)
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-io-ink-2 text-[12px] font-medium">Name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={60}
              className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card border px-3 text-[13px]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-io-ink-2 text-[12px] font-medium">Summary</span>
            <input
              name="description"
              maxLength={120}
              placeholder="Ex-Dubai · 2 weeks"
              className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card border px-3 text-[13px]"
            />
          </label>
          <fieldset className="m-0 flex max-h-[220px] flex-col gap-1.5 overflow-y-auto border-0 p-0">
            <legend className="text-io-ink-2 mb-1.5 text-[12px] font-medium">Clauses</legend>
            {p.allClauses.map((c) => (
              <Checkbox key={c.id} name="clause" value={c.id} label={`${c.code} · ${c.title}`} />
            ))}
          </fieldset>
        </form>
      </Modal>
    </section>
  )
}
