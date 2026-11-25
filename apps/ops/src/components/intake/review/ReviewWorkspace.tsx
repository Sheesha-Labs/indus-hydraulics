'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  acceptAllHighAction,
  addManualLineAction,
  confirmExtractionAction,
  mergeDuplicatesAction,
  requestOriginalAction,
  resolveUnsureAction,
  revisionIntentAction,
} from '../../../app/(console)/enquiries/intake/[batchId]/actions/review'
import type { ReviewLine, ReviewModel } from '../../../data/intake-review'
import { useLiveKeys } from '../../../lib/live-keys'
import CandidateGrid from './CandidateGrid'
import { DuplicateCard, HandwritingCard, RevisionCard, UnreadableCard } from './ExceptionCards'
import SourcePane from './SourcePane'

/**
 * Board 15 · Review extracted lines (S08-T04): the original on the left, the lines on the right, the questions and
 * board 17's exceptions under the lines, and the sticky footer with the counts, "Accept all high" and "Continue to
 * match" (the page's one primary, off until every line is decided, no Unsure is left and no duplicate waits).
 */
export default function ReviewWorkspace({ model }: { model: ReviewModel }) {
  const router = useRouter()
  const { toast } = useToast()
  const [hover, setHover] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  useLiveKeys([`record:intake.${model.batch.id}`], { onChange: () => router.refresh() })
  const locked = model.batch.status !== 'open'

  async function run<T>(
    p: Promise<{ success: true; data: T } | { success: false; error: string }>,
    ok?: (d: T) => void
  ) {
    setBusy(true)
    const r = await p
    setBusy(false)
    if (!r.success) toast({ kind: 'error', title: r.error })
    else ok?.(r.data)
    router.refresh()
  }
  function pick(ord: number) {
    document.getElementById(`line-${ord}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setHover(ord)
  }

  const unsure = model.lines.filter((l) => l.unsure && !l.handwriting && l.decision === 'pending')
  const handwriting = model.lines.filter((l) => l.handwriting && l.decision === 'pending')
  const dupes = model.lines.filter((l) => l.duplicateOf && l.decision === 'pending')
  const unreadable = model.files.filter((f) => f.status === 'needs_attention')
  const c = model.counts
  const footer = `${c.confirmed} of ${c.total} confirmed · ${c.toCheck} to check · ${c.duplicates} duplicate${c.duplicates === 1 ? '' : 's'} to merge`

  return (
    <div data-built="intake-review" className="grid min-h-0 flex-1 grid-cols-[480px_minmax(0,1fr)]">
      <SourcePane
        batchId={model.batch.id}
        files={model.files}
        activeId={model.active?.id ?? null}
        source={model.source}
        lines={model.lines}
        hover={hover}
        onHover={setHover}
        onPick={pick}
      />
      <section aria-label="Extracted lines" className="bg-io-card flex min-h-0 min-w-0 flex-col">
        <div
          ref={gridRef}
          tabIndex={0}
          aria-label="Lines and questions"
          className="io-focus min-h-0 flex-1 overflow-y-auto"
        >
          {model.revision ? (
            <div className="px-5 pt-4">
              <RevisionCard
                {...model.revision}
                intent={model.batch.revisionIntent?.kind ?? null}
                onApply={() =>
                  void run(revisionIntentAction({ batchId: model.batch.id, intent: 'revision' }))
                }
                onNew={() =>
                  void run(revisionIntentAction({ batchId: model.batch.id, intent: 'new' }))
                }
              />
            </div>
          ) : null}
          {model.lines.length ? (
            <CandidateGrid lines={model.lines} hover={hover} onHover={setHover} locked={locked} />
          ) : (
            <p className="text-io-ink-3 m-0 px-5 py-6 text-[13px]">
              {model.reading
                ? 'Still reading the files: lines appear here as each one is read.'
                : model.files.length
                  ? 'No lines were read from these files.'
                  : 'Type the lines one by one: add a line, then fill its description, part no. and quantity.'}
            </p>
          )}
          <div className="flex flex-col gap-3 px-5 py-4">
            {unsure.map((l) => (
              <UnsureResolver
                key={l.id}
                line={l}
                busy={busy}
                onChoose={(value, via) =>
                  void run(resolveUnsureAction({ id: l.id, version: l.version, value, via }))
                }
              />
            ))}
            {handwriting.map((l) => (
              <HandwritingCard
                key={l.id}
                ord={l.ord}
                printed={l.handwriting!.printed}
                handwritten={l.handwriting!.handwritten}
                onChoose={(choice, value) =>
                  void run(
                    resolveUnsureAction({
                      id: l.id,
                      version: l.version,
                      value,
                      via: 'handwriting',
                      choice,
                    })
                  )
                }
              />
            ))}
            {dupes.map((l) => (
              <DuplicateCard
                key={l.id}
                a={{
                  ord: l.duplicateOf!.ord,
                  page: l.duplicateOf!.page,
                  description: l.duplicateOf!.description,
                  partNo: l.duplicateOf!.partNo,
                  qty: l.duplicateOf!.qty,
                  uom: l.duplicateOf!.uom,
                }}
                b={{
                  ord: l.ord,
                  page: l.page,
                  description: l.description,
                  partNo: l.partNo,
                  qty: l.qty,
                  uom: l.uom,
                }}
                onMerge={(mode) => void run(mergeDuplicatesAction({ id: l.id, mode }))}
              />
            ))}
            {unreadable.map((f) => (
              <UnreadableCard
                key={f.id}
                fileName={f.name}
                meta={f.failureNote ?? 'unreadable'}
                dpi={
                  /dpi/.test(f.failureNote ?? '')
                    ? (f.failureNote ?? '').replace(/ scan$/, '')
                    : null
                }
                canAsk={!!model.batch.mailMessageId}
                askWhy="Uploaded, not emailed: there is no thread to reply in."
                onAsk={() =>
                  void run(requestOriginalAction({ fileId: f.id }), () =>
                    toast({
                      kind: 'success',
                      title: 'A reply asking for the original is in Review',
                    })
                  )
                }
                onManual={() =>
                  void run(addManualLineAction({ batchId: model.batch.id, fileId: f.id }))
                }
              />
            ))}
            {!locked && (model.lines.length || !model.files.length) ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void run(addManualLineAction({ batchId: model.batch.id, fileId: null }))
                  }
                >
                  + Add a line
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        <footer className="border-io-line bg-io-card flex flex-none items-center justify-between gap-4 border-t px-5 py-4">
          <span className="text-io-ink-2 text-[13px]" aria-live="polite">
            {locked && model.batch.enquiryRef ? `Confirmed as ${model.batch.enquiryRef}` : footer}
          </span>
          {locked ? null : (
            <span className="flex gap-2">
              <Button
                variant="secondary"
                disabled={busy || !model.legend.high}
                onClick={() => void run(acceptAllHighAction({ batchId: model.batch.id }))}
              >
                Accept all high
              </Button>
              <Button
                variant="primary"
                disabled={busy || !!model.blocker}
                title={model.blocker ?? undefined}
                onClick={() =>
                  void run(confirmExtractionAction({ batchId: model.batch.id }), (d) => {
                    toast({
                      kind: 'success',
                      title: `${d.ref} created${d.unsure ? ` · ${d.unsure} line${d.unsure === 1 ? '' : 's'} to answer` : ''}`,
                    })
                    router.push(`/enquiries/${d.ref}` as Route)
                  })
                }
              >
                Continue to match
              </Button>
            </span>
          )}
        </footer>
      </section>
    </div>
  )
}

function UnsureResolver({
  line,
  busy,
  onChoose,
}: {
  line: ReviewLine
  busy: boolean
  onChoose: (value: string, via: 'option' | 'typed') => void
}) {
  const [typing, setTyping] = useState(false)
  const [value, setValue] = useState('')
  const u = line.unsure!
  return (
    <section
      aria-label={u.question}
      data-part="unsure-resolver"
      className="rounded-io-card border-io-bad bg-io-card flex flex-col gap-3 border p-4"
    >
      <h3 className="m-0 text-[13.5px] font-medium">{u.question}</h3>
      <div className="flex flex-wrap gap-2">
        {u.options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            disabled={busy}
            onClick={() => onChoose(o.value, 'option')}
            className={
              i === 0
                ? 'rounded-io-ctl border-io-accent bg-io-accent-tint io-focus h-9 border px-3 text-[13px]'
                : 'rounded-io-ctl border-io-stroke bg-io-card io-focus h-9 border px-3 text-[13px]'
            }
          >
            {o.label}
            {o.sub ? ` · ${o.sub}` : ''}
          </button>
        ))}
        {typing ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (value.trim()) onChoose(value.trim(), 'typed')
            }}
          >
            <input
              autoFocus
              aria-label={`Type the value for line ${line.ord}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setTyping(false)
              }}
              className="rounded-io-ctl border-io-stroke io-focus-field h-9 w-[180px] border px-2 text-[13px]"
            />
            <Button variant="secondary" type="submit" disabled={busy || !value.trim()}>
              Use this
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setTyping(true)}
            className="rounded-io-ctl border-io-stroke bg-io-card io-focus h-9 border px-3 text-[13px]"
          >
            Type it
          </button>
        )}
      </div>
    </section>
  )
}
