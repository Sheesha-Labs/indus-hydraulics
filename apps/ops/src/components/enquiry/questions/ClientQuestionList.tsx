'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  answerQuestionAction,
  changeAssumptionAction,
  proceedWithAssumptionAction,
} from '../../../app/(console)/enquiries/[ref]/questions/actions/questions'
import type { QuestionChip, QuestionRow } from '../../../data/enquiry-questions'

/**
 * Board 171 · "Questions to <client>" (S09-T07): one row per held line, its question and status; "Answer manually"
 * for an answer given by phone; "Proceed with assumption" quotes the line on its stated assumption; "Change" edits
 * the assumption. Replies to the email are matched to the questions by the Assistant (match_client_answers).
 */
const TONE: Record<QuestionChip, 'warn' | 'n' | 'ok'> = {
  'Line on hold': 'warn',
  'Not sent yet': 'n',
  Answered: 'ok',
  'Proceed with assumption': 'n',
  'Left out': 'n',
  Withdrawn: 'n',
}

const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field w-full border px-2.5 py-2 text-[13px] leading-[1.45]'
const LINK =
  'text-io-accent io-focus rounded-io-tag cursor-pointer border-0 bg-transparent p-0 text-[12.5px] hover:underline'

export default function ClientQuestionList({
  enquiryRef,
  clientName,
  sentLine,
  questions,
}: {
  enquiryRef: string
  clientName: string
  sentLine: string | null
  questions: QuestionRow[]
}) {
  return (
    <section
      aria-labelledby="client-questions-title"
      data-part="client-questions"
      className="rounded-io-card border-io-line bg-io-card border px-5 py-4"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="client-questions-title" className="io-eyebrow m-0">
          Questions to {clientName}
        </h2>
        {sentLine ? <span className="text-io-ink-3 text-[12.5px]">{sentLine}</span> : null}
      </header>
      <ul className="m-0 mt-2 list-none p-0">
        {questions.map((q) => (
          <Row key={q.id} q={q} enquiryRef={enquiryRef} />
        ))}
      </ul>
      <p className="text-io-ink-3 m-0 mt-3 text-[12.5px]">
        Replies to this email are matched to the enquiry and the questions.
      </p>
    </section>
  )
}

function Row({ q, enquiryRef }: { q: QuestionRow; enquiryRef: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<'view' | 'answer' | 'assume'>('view')
  const [text, setText] = useState('')
  const [pending, start] = useTransition()
  const open = q.status === 'sent'
  const run = (fn: () => Promise<{ success: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn()
      if (!r.success) {
        toast({ kind: 'error', title: r.error ?? 'That did not work' })
        return
      }
      toast({ kind: 'success', title: done })
      setMode('view')
      router.refresh()
    })
  return (
    <li
      data-question={q.lineNo ?? 'general'}
      className="border-io-line grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-x-3 border-t py-3 first:border-t-0"
    >
      <span className="text-io-ink-3 text-[13px] tabular-nums">
        {q.lineNo ? `#${q.lineNo}` : '—'}
      </span>
      <div className="min-w-0">
        {q.line ? (
          <p className="text-io-ink m-0 text-[13px] leading-[1.4] font-medium">{q.line}</p>
        ) : null}
        <p className="text-io-ink-2 m-0 mt-0.5 text-[12.5px] leading-[1.45]">
          {q.note ?? q.question}
        </p>
        {q.answer ? (
          <p className="text-io-ink m-0 mt-1 text-[12.5px] leading-[1.45]">Answer: “{q.answer}”</p>
        ) : null}
        {q.assumption && q.status !== 'proceeded_on_assumption' && mode === 'view' ? (
          <p className="text-io-ink-3 m-0 mt-1 text-[12px]">
            If no answer: {q.assumption} <span aria-hidden="true">·</span>{' '}
            <button
              type="button"
              className={LINK}
              onClick={() => (setText(q.assumption ?? ''), setMode('assume'))}
            >
              Change
            </button>
            {open ? (
              <>
                {' '}
                <span aria-hidden="true">·</span>{' '}
                <button
                  type="button"
                  className={LINK}
                  disabled={pending}
                  onClick={() =>
                    run(
                      () => proceedWithAssumptionAction({ questionId: q.id, ref: enquiryRef }),
                      'Quoted on the assumption · the line goes to suppliers'
                    )
                  }
                >
                  Proceed with assumption
                </button>
              </>
            ) : null}
          </p>
        ) : null}
        {mode !== 'view' ? (
          <div className="mt-2 flex flex-col gap-2">
            <label className="sr-only" htmlFor={`q-${q.id}`}>
              {mode === 'answer'
                ? `Answer for line ${q.lineNo ?? ''}`
                : `Assumption for line ${q.lineNo ?? ''}`}
            </label>
            <textarea
              id={`q-${q.id}`}
              rows={2}
              className={FIELD}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'answer' ? 'What the client said' : 'Supplied with …'}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pending || !text.trim()}
                onClick={() =>
                  mode === 'answer'
                    ? run(
                        () => answerQuestionAction({ questionId: q.id, ref: enquiryRef, text }),
                        'Answer recorded · the line is open for sourcing'
                      )
                    : run(
                        () => changeAssumptionAction({ questionId: q.id, ref: enquiryRef, text }),
                        'Assumption changed'
                      )
                }
              >
                {mode === 'answer' ? 'Save answer' : 'Save assumption'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setMode('view')}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Chip tone={TONE[q.chip]} label={q.chip} />
        {open && mode === 'view' ? (
          <button type="button" className={LINK} onClick={() => (setText(''), setMode('answer'))}>
            Answer manually
          </button>
        ) : null}
        {q.status === 'proceeded_on_assumption' && mode === 'view' ? (
          <button
            type="button"
            className={LINK}
            onClick={() => (setText(q.assumption ?? ''), setMode('assume'))}
          >
            Change
          </button>
        ) : null}
      </div>
    </li>
  )
}
