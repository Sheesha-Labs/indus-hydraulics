import { PageHeader } from '@indus/ops-ui/shell'
import { notFound } from 'next/navigation'
import ReviewWorkspace from '../../../../../components/intake/review/ReviewWorkspace'
import { getReview } from '../../../../../data/intake-review'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'

/**
 * Board 15 · Review extracted lines (S08-T04), with board 17's exceptions inside it. The original beside the lines;
 * every decision is the person's; "Continue to match" creates the enquiry from the confirmed lines.
 */
export default async function EnquiriesIntakeBatchIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { batchId } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/intake/${batchId}`))
  routeParam(recordId, batchId)
  const file = (await searchParams).file
  const model = await getReview(batchId, typeof file === 'string' ? file : null)
  if (!model) notFound()
  const l = model.legend
  return (
    <div data-template="T9" className="flex h-screen min-h-0 min-w-0 flex-col overflow-hidden">
      <PageHeader
        crumb={`Intake / ${model.active?.name ?? 'Intake'}`}
        title="Review extracted lines"
        meta={
          <span className="flex items-center gap-4 text-[12.5px]" aria-label="Confidence legend">
            <Dot className="fill-io-ok-solid" label={`${l.high} high`} />
            <Dot className="fill-io-warn-solid" label={`${l.check} check`} />
            <Dot className="fill-io-bad-solid" label={`${l.low} low`} />
            <Dot className="fill-io-info" label={`${l.duplicate} duplicate`} />
          </span>
        }
      />
      <ReviewWorkspace model={model} />
    </div>
  )
}

function Dot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg aria-hidden="true" viewBox="0 0 8 8" className="h-2 w-2">
        <circle cx="4" cy="4" r="4" className={className} />
      </svg>
      {label}
    </span>
  )
}
