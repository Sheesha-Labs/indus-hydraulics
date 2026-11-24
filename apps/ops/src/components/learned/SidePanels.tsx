'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  addPhraseAction,
  pickToneSamplesAction,
  removePreferenceAction,
} from '../../app/(console)/assistant/learned/actions/learned'
import type { LearnedPageData, PhraseRow } from '../../data/preferences'

/**
 * Board 115's right column (S07-T05): the three tone samples chosen from sales@ sent mail (Pick from sent mail),
 * and the phrase list, Use and Avoid, with + Add phrase and × per phrase. The Owner edits everything; the Helper
 * adds and removes phrases for purchase@ only (D19).
 */
export default function SidePanels({ page }: { page: LearnedPageData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [picking, setPicking] = useState(false)
  const [chosen, setChosen] = useState<string[]>(page.tone.map((t) => t.messageId))
  const [adding, setAdding] = useState<'phrase_use' | 'phrase_avoid' | null>(null)
  const [phrase, setPhrase] = useState('')

  async function run(p: Promise<{ success: boolean; error?: string }>, ok: string) {
    const res = await p
    if (!res.success) toast({ kind: 'error', title: res.error ?? 'Could not save' })
    else toast({ kind: 'success', title: ok })
    router.refresh()
    return res.success
  }
  const canRemove = (p: PhraseRow) =>
    page.isOwner ||
    (!!page.helperMailboxId && p.mailbox !== null && p.mailbox.startsWith('purchase'))

  return (
    <div className="flex flex-col gap-[18px]">
      <section
        aria-labelledby="tone-title"
        className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5"
      >
        <h2 id="tone-title" className="io-eyebrow m-0 font-normal">
          Tone samples · {page.tone.length} chosen from sent mail
        </h2>
        <p className="m-0 text-[12.5px] leading-[1.5]">
          The Assistant matches these when drafting from sales@.
        </p>
        {page.tone.map((t) => (
          <div
            key={t.id}
            className="rounded-io-card border-io-accent bg-io-accent-faint flex flex-col gap-1 border px-3.5 py-3"
          >
            <span className="text-[13px] font-medium">{t.subject}</span>
            <span className="text-io-ink-3 text-[12px]">
              To {t.to} · {t.date}
            </span>
          </div>
        ))}
        {page.isOwner ? (
          <Button variant="link" className="w-fit" onClick={() => setPicking(true)}>
            Pick from sent mail
          </Button>
        ) : null}
      </section>

      <section
        aria-labelledby="phrase-title"
        className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2.5 border px-[18px] py-5"
      >
        <h2 id="phrase-title" className="io-eyebrow m-0 font-normal">
          Phrase list
        </h2>
        {(['use', 'avoid'] as const).map((which) => {
          const list = which === 'use' ? page.use : page.avoid
          return (
            <div key={which} className="flex flex-col gap-2">
              <span className={which === 'use' ? 'text-[12.5px]' : 'text-io-bad text-[12.5px]'}>
                {which === 'use' ? 'Use' : 'Avoid'}
              </span>
              {list.length === 0 ? (
                <span className="text-io-ink-3 text-[12px]">None yet.</span>
              ) : null}
              {list.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-io-ctl flex items-start gap-2 px-3 py-2.5 text-[12.5px] ${which === 'use' ? 'bg-io-ok-tint' : 'bg-io-bad-tint'}`}
                >
                  <span className="flex-1">“{p.phrase}”</span>
                  {canRemove(p) ? (
                    <button
                      type="button"
                      aria-label={`Remove “${p.phrase}”`}
                      onClick={() =>
                        void run(removePreferenceAction({ id: p.id }), 'Phrase removed')
                      }
                      className="io-focus rounded-io-tag text-io-ink-3 hover:text-io-ink"
                    >
                      <X aria-hidden="true" size={12} strokeWidth={1.75} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )
        })}
        <div className="flex gap-3">
          <Button variant="link" onClick={() => setAdding('phrase_use')}>
            + Add phrase
          </Button>
          <Button variant="link" onClick={() => setAdding('phrase_avoid')}>
            + Add a phrase to avoid
          </Button>
        </div>
        {!page.isOwner ? (
          <p className="text-io-ink-3 m-0 text-[12px]">Your phrases apply to purchase@ only.</p>
        ) : null}
      </section>

      {picking ? (
        <Modal
          open
          onOpenChange={setPicking}
          title="Pick tone samples from sent mail"
          width={560}
          actions={
            <>
              <Button variant="secondary" onClick={() => setPicking(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={chosen.length === 0 || chosen.length > 3}
                onClick={async () => {
                  if (
                    await run(pickToneSamplesAction({ messageIds: chosen }), 'Tone samples saved')
                  )
                    setPicking(false)
                }}
              >
                Use these {chosen.length}
              </Button>
            </>
          }
        >
          <p className="text-io-ink-3 m-0 mb-2 text-[12.5px]">
            Choose up to three messages sent from sales@.
          </p>
          {page.sent.length === 0 ? (
            <p className="text-io-ink-3 m-0 text-[13px]">No sent mail yet.</p>
          ) : (
            <ul className="m-0 flex max-h-[360px] list-none flex-col overflow-y-auto p-0">
              {page.sent.map((m) => (
                <li key={m.id} className="border-io-line border-b py-2 last:border-b-0">
                  <label className="flex items-start gap-2.5 text-[13px]">
                    <input
                      type="checkbox"
                      className="io-focus mt-1"
                      checked={chosen.includes(m.id)}
                      onChange={(e) =>
                        setChosen((c) =>
                          e.target.checked ? [...c, m.id] : c.filter((x) => x !== m.id)
                        )
                      }
                    />
                    <span className="flex flex-col">
                      {m.subject}
                      <span className="text-io-ink-3 text-[12px]">
                        To {m.to} · {m.date}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      ) : null}

      {adding ? (
        <Modal
          open
          onOpenChange={(o) => {
            if (!o) setAdding(null)
          }}
          title={adding === 'phrase_use' ? 'Add a phrase to use' : 'Add a phrase to avoid'}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAdding(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (await run(addPhraseAction({ phrase, kind: adding }), 'Phrase added')) {
                    setAdding(null)
                    setPhrase('')
                  }
                }}
              >
                Add
              </Button>
            </>
          }
        >
          <label className="flex flex-col gap-1.5 text-[13px]">
            Phrase
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              className="io-focus-field rounded-io-ctl border-io-stroke h-9 border px-2.5"
            />
          </label>
        </Modal>
      ) : null}
    </div>
  )
}
