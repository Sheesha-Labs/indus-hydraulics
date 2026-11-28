'use client'

import { TERMS_CATEGORIES, TERMS_CATEGORY_LABEL, type TermsCategory } from '@indus/ops-core'
import { Button, Select, Spinner } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ImportView } from '../../../../server/terms/import'
import { acceptCandidateAction, dismissImportAction, skipCandidateAction } from './actions/terms'
import ClauseBody from './ClauseBody'

/**
 * The offers being read, and the candidate clauses read from them: each one Accept, Edit then accept, or Skip.
 * A candidate becomes a clause only when a person accepts it ("From Offer INDUS/Q…").
 */
export default function ImportCandidates({ imports, isOwner }: { imports: ImportView[]; isOwner: boolean }) {
  return (
    <section aria-labelledby="imports-eyebrow" className="flex flex-col gap-2">
      <h3 id="imports-eyebrow" className="io-eyebrow text-io-ink-3 m-0 pt-2">
        Imported from offers
      </h3>
      {imports.map((imp) => (
        <ImportBlock key={imp.id} imp={imp} isOwner={isOwner} />
      ))}
    </section>
  )
}

function ImportBlock({ imp, isOwner }: { imp: ImportView; isOwner: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const pending = imp.candidates.filter((c) => c.status === 'pending')
  async function dismiss() {
    const r = await dismissImportAction({ importId: imp.id })
    if (!r.success) toast({ kind: 'error', title: r.error })
    router.refresh()
  }
  return (
    <div className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2.5 border px-[18px] py-3.5">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="flex items-center gap-2">
          <b className="font-medium">{imp.offerRef ?? imp.filename}</b>
          {imp.status === 'reading' ? (
            <span className="text-io-ink-3 flex items-center gap-1.5 text-[12.5px]">
              <Spinner /> Reading the terms
            </span>
          ) : imp.status === 'failed' ? (
            <Chip tone="bad" label={imp.failureNote ?? 'Could not be read'} />
          ) : (
            <Chip tone="warn" label={`${pending.length} to review`} />
          )}
        </span>
        {isOwner && imp.status !== 'reading' ? (
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {imp.status === 'failed' ? 'Dismiss' : 'Skip the rest'}
          </Button>
        ) : null}
      </div>
      {pending.map((c) => (
        <Candidate key={c.id} c={c} isOwner={isOwner} />
      ))}
    </div>
  )
}

function Candidate({ c, isOwner }: { c: ImportView['candidates'][number]; isOwner: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  async function go(p: Promise<{ success: boolean; error?: string }>, ok: string) {
    setBusy(true)
    const r = await p
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error ?? 'Something went wrong' })
      return
    }
    toast({ kind: 'success', title: ok })
    router.refresh()
  }
  return (
    <form
      aria-label={`Candidate ${c.title}`}
      className="border-io-line flex flex-col gap-2 border-t pt-2.5"
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        void go(
          acceptCandidateAction({
            candidateId: c.id,
            edits: editing
              ? {
                  category: String(f.get('category')) as TermsCategory,
                  title: String(f.get('title') ?? ''),
                  body: String(f.get('body') ?? ''),
                }
              : {},
          }),
          'Clause added'
        )
      }}
    >
      {editing ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Select
              size="md"
              name="category"
              aria-label="Category"
              defaultValue={c.category}
              options={TERMS_CATEGORIES.map((x) => ({ value: x, label: TERMS_CATEGORY_LABEL[x] }))}
            />
            <input
              name="title"
              aria-label="Title"
              defaultValue={c.title}
              required
              className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card border px-3 text-[13px]"
            />
          </div>
          <textarea
            name="body"
            aria-label="Wording"
            defaultValue={c.body}
            rows={2}
            required
            className="border-io-stroke rounded-io-ctl io-focus-field bg-io-card border px-3 py-2 text-[13px]"
          />
        </div>
      ) : (
        <>
          <span className="text-io-ink-3 text-[12px]">
            {TERMS_CATEGORY_LABEL[c.category]} · {c.title}
          </span>
          <ClauseBody body={c.body} />
        </>
      )}
      {isOwner ? (
        <div className="flex gap-2">
          <Button size="sm" type="submit" busy={busy}>
            Accept
          </Button>
          {editing ? null : (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => go(skipCandidateAction({ candidateId: c.id }), 'Skipped')}
          >
            Skip
          </Button>
        </div>
      ) : null}
    </form>
  )
}
