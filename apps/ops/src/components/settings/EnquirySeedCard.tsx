'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { seedEnquiryAction } from '../../app/(console)/settings/numbering/actions/numbering'

/**
 * Settings › Numbering, Owner only (S08-T06, C5): "Enquiry numbers · ENQ-{yyyy}-{nnnn}" with the evidence for the
 * seed — the website admin's highest number this year and the 1,000 gap — and one button. Board 214 (S11)
 * replaces this card with the full numbering page.
 */
export interface EnquirySeedView {
  year: number
  legacyMaxRef: string | null
  opsNextRef: string | null
  proposedNext: number
  proposedRef: string
  outOfStep: boolean
  isOwner: boolean
}

export default function EnquirySeedCard({ v }: { v: EnquirySeedView }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  async function seed() {
    setBusy(true)
    const r = await seedEnquiryAction({ year: v.year, next: v.proposedNext })
    setBusy(false)
    if (!r.success) toast({ kind: 'error', title: r.error })
    else toast({ kind: 'success', title: `Enquiry numbers start at ${r.data.ref}` })
    router.refresh()
  }
  return (
    <section
      aria-labelledby="enquiry-seed"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border p-5"
    >
      <h2 id="enquiry-seed" className="m-0 text-[15px] font-medium">
        Enquiry numbers · ENQ-{'{yyyy}'}-{'{nnnn}'}
      </h2>
      <dl className="m-0 grid grid-cols-[220px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
        <dt className="text-io-ink-2">Website admin, highest in {v.year}</dt>
        <dd className="m-0">{v.legacyMaxRef ?? 'none yet'}</dd>
        <dt className="text-io-ink-2">Operations, next number</dt>
        <dd className="m-0">{v.opsNextRef ?? 'not seeded for this year'}</dd>
        <dt className="text-io-ink-2">Seed (admin highest + 1,000)</dt>
        <dd className="m-0">{v.proposedRef}</dd>
      </dl>
      {v.outOfStep ? (
        <p className="text-io-bad m-0 text-[12.5px]">
          The website admin has reached the Operations block. Seed again above it.
        </p>
      ) : null}
      <p className="text-io-ink-2 m-0 text-[12.5px]">
        Both systems issue ENQ numbers until the cutover; Operations starts 1,000 above the admin
        and skips any number the admin has used. A new year seeds itself the same way on its first
        enquiry.
      </p>
      {v.isOwner ? (
        <div>
          <Button variant="primary" busy={busy} onClick={() => void seed()}>
            Seed at {v.proposedRef}
          </Button>
        </div>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12px]">Only the Owner seeds numbers.</p>
      )}
    </section>
  )
}
