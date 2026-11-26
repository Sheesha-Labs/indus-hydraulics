'use client'

import { OptionCard } from '@indus/ops-ui/assistant'
import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { applyFallbackAction } from '../../../app/(console)/enquiries/[ref]/questions/actions/questions'

/**
 * Board 171 · "If no answer by <date>" (S09-T07): the three fallbacks for the open questions. The Assistant proposes
 * the same choice in Review on the day; a person may apply it now. Applying settles that card.
 */
type Choice = 'assume' | 'leave_out' | 'wait'

export default function FallbackChooser({
  enquiryId,
  enquiryRef,
  dateLabel,
  open,
  linesOther,
  missingAssumption,
}: {
  enquiryId: string
  enquiryRef: string
  dateLabel: string
  open: number
  linesOther: number
  missingAssumption: number[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [choice, setChoice] = useState<Choice>(missingAssumption.length ? 'wait' : 'assume')
  const [pending, start] = useTransition()
  const items: Array<{ value: Choice; title: string; sub: string }> = [
    {
      value: 'assume',
      title: 'Quote on stated assumptions',
      sub: missingAssumption.length
        ? `Line ${missingAssumption.join(', ')} has no assumption yet: write one with Change first`
        : 'Send the held lines to suppliers on the stated assumptions; they print on the quotation',
    },
    {
      value: 'leave_out',
      title: 'Leave the lines out',
      sub: `Quote ${linesOther} line${linesOther === 1 ? '' : 's'}; the ${open} held line${open === 1 ? '' : 's'} show as not quoted, awaiting the client`,
    },
    {
      value: 'wait',
      title: 'Keep waiting',
      sub: 'The quotation waits for the answer; the response-time clock stays paused',
    },
  ]
  return (
    <section
      aria-labelledby="fallback-title"
      data-part="fallback-chooser"
      className="rounded-io-card border-io-line bg-io-card border px-5 py-4"
    >
      <fieldset className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0">
        <legend id="fallback-title" className="io-eyebrow float-left mb-3 w-full">
          If no answer by {dateLabel}
        </legend>
        {items.map((it) => (
          <OptionCard
            key={it.value}
            name="fallback"
            value={it.value}
            title={it.title}
            sub={it.sub}
            checked={choice === it.value}
            onChange={(v) => setChoice(v as Choice)}
          />
        ))}
      </fieldset>
      <p className="text-io-ink-3 m-0 mt-3 text-[12px] leading-[1.45]">
        The Assistant asks on {dateLabel} if nothing has come back. The response-time clock is
        paused while the client has the questions.
      </p>
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          disabled={pending || (choice === 'assume' && missingAssumption.length > 0)}
          onClick={() =>
            start(async () => {
              const r = await applyFallbackAction({ enquiryId, ref: enquiryRef, choice })
              if (!r.success) toast({ kind: 'error', title: r.error })
              else
                toast({
                  kind: 'success',
                  title:
                    choice === 'assume'
                      ? 'Quoted on the stated assumptions'
                      : choice === 'leave_out'
                        ? 'The held lines are left out'
                        : 'Keeping waiting for the client',
                })
              router.refresh()
            })
          }
        >
          Apply now
        </Button>
      </div>
    </section>
  )
}
