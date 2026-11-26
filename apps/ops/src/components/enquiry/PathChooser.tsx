'use client'

import { lineRange, type PathCard, type QualifyPath } from '@indus/ops-core'
import { OptionCard } from '@indus/ops-ui/assistant'
import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  choosePathAction,
  undoSpamAction,
} from '../../app/(console)/enquiries/[ref]/actions/choose-path'
import { useUndoToast } from '../shell/undo-toast'

/**
 * Board 167 · "Suggested path" (S09-T06) and 171b state 2 ("Is this a real buyer?"). Radio path cards with the
 * Suggested tag; a partial quote or questions name their lines (defaults from the read, changeable here); the
 * "On choose" note says what the Assistant drafts next. Chosen once: the drafts arrive in Review and nothing is
 * sent. Ignore (spam) files the email and raises a 5-minute Undo toast ("Undo · treat as enquiry").
 */
export interface PathChooserProps {
  enquiryId: string
  enquiryRef: string
  version: number
  cards: PathCard[]
  onChoose: Record<QualifyPath, string>
  suggested: QualifyPath | null
  lineNos: number[]
  defaults: { regret: number[]; ask: number[] }
  /** 171b state 2. */
  realBuyer: { text: string } | null
  /** The read could not run: the person chooses without a suggestion. */
  failed: boolean
  /** 171b state sheet: the content without the card frame (the sheet draws its own). */
  bare?: boolean
}

export default function PathChooser(p: PathChooserProps) {
  const router = useRouter()
  const { toast } = useToast()
  const undoToast = useUndoToast()
  const [path, setPath] = useState<QualifyPath>(p.suggested ?? p.cards[0]!.path)
  const [regret, setRegret] = useState<number[]>(p.defaults.regret)
  const [ask, setAsk] = useState<number[]>(p.defaults.ask)
  const [more, setMore] = useState(!p.realBuyer)
  // The lines a partial quote regrets (or questions hold) are the read's; the picker opens on "Change".
  const [picking, setPicking] = useState(false)
  const [pending, start] = useTransition()

  const shown = more ? p.cards : p.cards.slice(0, 2)
  const picks = path === 'quote_partial' ? regret : path === 'ask_client_first' ? ask : null
  const setPicks = path === 'quote_partial' ? setRegret : setAsk
  const invalid =
    path === 'quote_partial' && (regret.length === 0 || regret.length >= p.lineNos.length)

  const choose = () =>
    start(async () => {
      const r = await choosePathAction({
        enquiryId: p.enquiryId,
        path,
        version: p.version,
        ...(picks ? { lineNos: picks } : {}),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      if (r.data.undoUntil) {
        undoToast({
          title: `${p.enquiryRef} filed as Not business`,
          remainingMs: Math.max(0, new Date(r.data.undoUntil).getTime() - Date.now()),
          onUndo: async () => {
            const u = await undoSpamAction({ enquiryId: p.enquiryId })
            if (u.success) router.refresh()
            return u
          },
        })
      } else
        toast({ kind: 'success', title: `Path chosen · the drafts are on their way to Review` })
      router.refresh()
    })

  return (
    <section
      id="choose-path"
      aria-labelledby="choose-path-title"
      className={p.bare ? '' : 'rounded-io-card border-io-line bg-io-card border p-5'}
      data-built="path-chooser"
    >
      {p.realBuyer ? (
        <>
          <h2 id="choose-path-title" className={p.bare ? 'sr-only' : 'io-eyebrow m-0'}>
            Qualification · not enough to judge
          </h2>
          <p
            className={`m-0 ${p.bare ? '' : 'mt-3'} flex items-center gap-2 text-[13.5px] font-medium`}
          >
            <Chip tone="warn" label="Unsure" />
            Is this a real buyer?
          </p>
          <p className="text-io-ink-2 m-0 mt-2 text-[12.5px] leading-[1.5]">{p.realBuyer.text}</p>
        </>
      ) : (
        <>
          <h2 id="choose-path-title" className="io-eyebrow m-0">
            {p.failed ? 'Choose a path' : 'Suggested path'}
          </h2>
          <p className="text-io-ink-2 m-0 mt-2 text-[12.5px] leading-[1.5]">
            Chosen once. The Assistant then drafts the next step for Review.
          </p>
        </>
      )}
      <fieldset className="m-0 mt-4 flex min-w-0 flex-col gap-2.5 border-0 p-0">
        <legend className="sr-only">Path for {p.enquiryRef}</legend>
        {shown.map((c) => (
          <OptionCard
            key={c.path}
            name="path"
            value={c.path}
            title={c.title}
            sub={c.sub}
            {...(c.tag ? { tag: c.tag } : {})}
            checked={path === c.path}
            onChange={(v) => setPath(v as QualifyPath)}
          />
        ))}
      </fieldset>
      {!more ? (
        <button
          type="button"
          onClick={() => setMore(true)}
          className="text-io-accent io-focus rounded-io-tag mt-2.5 cursor-pointer border-0 bg-transparent p-0 text-[12.5px]"
        >
          Something else
        </button>
      ) : null}
      {picks && !picking && !invalid ? (
        <p className="text-io-ink-2 m-0 mt-3 text-[12.5px]">
          {path === 'quote_partial' ? 'Lines to regret' : 'Lines to ask about'}:{' '}
          <span className="text-io-ink font-medium">
            {picks.length ? lineRange(picks) : 'all lines'}
          </span>{' '}
          ·{' '}
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="text-io-accent io-focus rounded-io-tag cursor-pointer border-0 bg-transparent p-0 text-[12.5px]"
          >
            Change
          </button>
        </p>
      ) : null}
      {picks && (picking || invalid) ? (
        <fieldset className="m-0 mt-4 border-0 p-0">
          <legend className="io-eyebrow">
            {path === 'quote_partial' ? 'Lines to regret' : 'Lines to ask about'}
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.lineNos.map((n) => {
              const on = picks.includes(n)
              return (
                <label
                  key={n}
                  data-state={on ? 'on' : 'off'}
                  className="border-io-line rounded-io-tag bg-io-card data-[state=on]:border-io-accent data-[state=on]:bg-io-accent-faint data-[state=on]:text-io-accent inline-flex h-7 min-w-8 cursor-pointer items-center justify-center border px-2 text-[12px] has-[:focus-visible]:shadow-[0_0_0_2px_var(--io-card),0_0_0_4px_var(--io-accent)]"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    aria-label={`Line ${n}`}
                    onChange={() =>
                      setPicks(
                        on ? picks.filter((x) => x !== n) : [...picks, n].sort((a, b) => a - b)
                      )
                    }
                  />
                  {n}
                </label>
              )
            })}
          </div>
          {invalid ? (
            <p role="alert" className="text-io-bad m-0 mt-2 text-[12px]">
              {regret.length === 0
                ? 'Choose at least one line to regret.'
                : 'Every line is chosen: use “Regret politely” instead.'}
            </p>
          ) : null}
        </fieldset>
      ) : null}
      <p className="bg-io-accent-faint rounded-io-ctl text-io-ink m-0 mt-4 px-3 py-2.5 text-[12.5px] leading-[1.5]">
        <b className="font-medium">On choose</b> · {p.onChoose[path]}
      </p>
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={choose} disabled={pending || invalid} aria-busy={pending}>
          {pending ? 'Choosing…' : 'Choose this path'}
        </Button>
      </div>
    </section>
  )
}
