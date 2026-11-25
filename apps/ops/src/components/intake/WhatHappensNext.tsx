import { Card, Note } from '@indus/ops-ui/card'

/** Board 14's side card (S08-T03): the three steps and the promise that nothing is written until a person confirms. */
export default function WhatHappensNext() {
  const steps = [
    'Each page is read. Tables, part numbers, quantities and units are pulled out.',
    'You review the extracted lines next to the original page.',
    'Match to a client and an enquiry. Its lines are filled from the confirmed lines.',
  ]
  return (
    <Card eyebrow="What happens next">
      <ol className="m-0 flex list-none flex-col gap-3 p-0 text-[13px] leading-[1.45]">
        {steps.map((s, i) => (
          <li key={s} className="grid grid-cols-[32px_minmax(0,1fr)]">
            <span className="text-io-ink-3">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <Note tone="plain">Nothing is written until a person confirms the lines.</Note>
    </Card>
  )
}
