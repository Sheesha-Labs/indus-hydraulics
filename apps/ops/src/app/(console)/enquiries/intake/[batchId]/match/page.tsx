import { notFound, redirect } from 'next/navigation'
import type { Route } from 'next'
import MatchWorkspace from '../../../../../../components/intake/match/MatchWorkspace'
import { getMatchStep } from '../../../../../../data/intake-match'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../../lib/route-params'

/**
 * Board 16 · Match to client and lead (T9, S09-T04): Step 3 of 3 after Source and Review. A centred card over
 * the dimmed intake: where the reviewed lines go. An intake already applied opens where it went.
 */
export default async function EnquiriesIntakeMatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/intake/${batchId}/match`))
  routeParam(recordId, batchId)
  const step = await getMatchStep(batchId)
  if (!step) notFound()
  if (step.done) redirect(step.done.href as Route)
  return (
    <div data-template="T9" className="relative flex h-screen min-h-0 min-w-0 flex-col">
      <div aria-hidden="true" className="flex flex-1 flex-col gap-3 p-7">
        <div className="bg-io-fill rounded-io-8 h-10" />
        <div className="bg-io-fill rounded-io-8 flex-1" />
      </div>
      <div className="bg-io-scrim fixed inset-0 z-10 flex items-center justify-center">
        <section
          aria-labelledby="match-title"
          className="bg-io-card shadow-io-e3 rounded-io-dialog flex w-[680px] max-w-[calc(100vw-32px)] flex-col"
        >
          <header className="border-io-line flex flex-col gap-1 border-b px-[26px] pt-[22px] pb-4">
            <span className="io-eyebrow text-[10.5px] tracking-[0.13em]">Step 3 of 3 · Match</span>
            <h1 id="match-title" className="io-display m-0 text-[28px] leading-[1.1]">
              Where should these {step.summary.lines} line{step.summary.lines === 1 ? '' : 's'} go?
            </h1>
          </header>
          <MatchWorkspace step={step} />
        </section>
      </div>
    </div>
  )
}
