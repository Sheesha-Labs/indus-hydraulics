'use client'

import {
  TERMS_CATEGORIES,
  TERMS_CATEGORY_LABEL,
  TERMS_VARIABLES,
  type TermsCategory,
} from '@indus/ops-core'
import { Button, Choices, Toggle } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import HeaderActions from '../../../../components/route/HeaderActions'
import type { ClauseView, PresetView } from '../../../../server/terms/clauses'
import type { ImportView } from '../../../../server/terms/import'
import { setCategoryLockAction } from './actions/terms'
import ClauseCard from './ClauseCard'
import ImportCandidates from './ImportCandidates'
import ImportFromOffer from './ImportFromOffer'
import NewClauseModal from './NewClauseModal'
import PresetList from './PresetList'

export interface TermsLibraryProps {
  category: TermsCategory
  counts: Record<TermsCategory, number>
  clauses: ClauseView[]
  allClauses: { id: string; code: string; title: string }[]
  presets: PresetView[]
  selectedPresetId: string | null
  imports: ImportView[]
  clients: { id: string; name: string }[]
  isOwner: boolean
}

const WHERE: Partial<Record<TermsCategory, string>> = {
  payment: 'Printed on quotations, acknowledgements, proformas and invoices.',
  delivery: 'Printed on quotations, acknowledgements and proformas.',
  disclaimer: 'Printed under the bank details on client documents.',
}

/**
 * Board 39 (S11-T06): the clauses of one category, the presets on the right with the variables list, and the
 * imports waiting for review. Header: "Import from offer" (secondary) and "New clause" (the one primary).
 */
export default function TermsLibrary(p: TermsLibraryProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [newOpen, setNewOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const allLocked = p.clauses.length > 0 && p.clauses.every((c) => c.locked)
  const reading = p.imports.some((i) => i.status === 'reading')
  const preset = p.presets.find((x) => x.id === p.selectedPresetId) ?? null

  // While the Assistant reads an offer, look again every few seconds.
  useEffect(() => {
    if (!reading) return
    const t = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(t)
  }, [reading, router])

  async function lock(on: boolean) {
    const r = await setCategoryLockAction({ category: p.category, locked: on })
    if (!r.success) toast({ kind: 'error', title: r.error })
    router.refresh()
  }

  const href = (c: TermsCategory) =>
    `/settings/terms?category=${c}${p.selectedPresetId ? `&preset=${p.selectedPresetId}` : ''}`

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 pt-4 pb-8">
      {p.isOwner ? (
        <HeaderActions>
          <Button onClick={() => setImportOpen(true)}>Import from offer</Button>
          <Button variant="primary" onClick={() => setNewOpen(true)}>
            New clause
          </Button>
        </HeaderActions>
      ) : null}
      <div className="flex min-w-0 flex-col gap-3">
        <Choices
          aria-label="Clause categories"
          size="sm"
          value={p.category}
          hrefFor={href}
          options={TERMS_CATEGORIES.map((c) => ({
            value: c,
            label: TERMS_CATEGORY_LABEL[c],
            count: p.counts[c],
          }))}
        />
        {p.imports.length ? (
          <ImportCandidates imports={p.imports} isOwner={p.isOwner} />
        ) : null}
        <div className="flex items-start justify-between gap-6 pt-2">
          <div className="min-w-0">
            <h2 className="m-0 text-[18px] font-medium">{TERMS_CATEGORY_LABEL[p.category]}</h2>
            <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.45]">
              {WHERE[p.category] ?? 'Printed on the documents whose preset includes them.'} Variables
              fill from the enquiry.
            </p>
          </div>
          <Toggle
            checked={allLocked}
            label="Lock wording so the Assistant cannot change it"
            disabled={!p.isOwner || p.clauses.length === 0}
            onCheckedChange={lock}
            className="max-w-[230px] flex-none"
          />
        </div>
        {p.clauses.length ? (
          <ol aria-label={`${TERMS_CATEGORY_LABEL[p.category]} clauses`} className="m-0 flex list-none flex-col gap-3 p-0">
            {p.clauses.map((c) => (
              <li key={c.id}>
                <ClauseCard clause={c} preset={preset} isOwner={p.isOwner} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-io-ink-3 m-0 py-6 text-center text-[13px]">
            No clauses in {TERMS_CATEGORY_LABEL[p.category].toLowerCase()} yet.
          </p>
        )}
      </div>
      <aside aria-label="Presets and variables" className="flex flex-col gap-4">
        <PresetList
          presets={p.presets}
          selectedId={p.selectedPresetId}
          category={p.category}
          clients={p.clients}
          allClauses={p.allClauses}
          isOwner={p.isOwner}
        />
        <section aria-labelledby="variables-eyebrow" className="border-io-line flex flex-col gap-2 border-t pt-4">
          <h3 id="variables-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
            Variables
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {TERMS_VARIABLES.map((v) => (
              <span key={v} className="bg-io-warn-tint text-io-ink-2 rounded-io-tag px-1.5 py-0.5 text-[11.5px]">
                {`{${v}}`}
              </span>
            ))}
          </div>
          <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.45]">
            Each document picks up the preset on the client record. A change on one order is logged
            and does not change the preset.
          </p>
        </section>
      </aside>
      {p.isOwner ? (
        <>
          <NewClauseModal open={newOpen} onOpenChange={setNewOpen} category={p.category} />
          <ImportFromOffer open={importOpen} onOpenChange={setImportOpen} />
        </>
      ) : null}
    </div>
  )
}
