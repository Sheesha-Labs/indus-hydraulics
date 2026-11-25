import { T1Index } from '@indus/ops-ui/templates'
import { z } from 'zod'
import IntakeDropArea from '../../../../components/intake/IntakeDropArea'
import IntakeHeader from '../../../../components/intake/IntakeHeader'
import IntakeLive from '../../../../components/intake/IntakeLive'
import ManualEnquiry from '../../../../components/intake/ManualEnquiry'
import QueueCard from '../../../../components/intake/QueueCard'
import WhatHappensNext from '../../../../components/intake/WhatHappensNext'
import { getManualEnquiry, getQueue, intakeCount as countIntake } from '../../../../data/intake'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { getSetting } from '../../../../server/settings/get'

/**
 * Board 14 · Upload enquiry documents (S08-T03, T1): the drop area, the processing queue of this upload (?batch=)
 * and what happens next. The first drop creates the batch; the queue follows it live. Below, board 92's
 * "New enquiry without an email": paste, upload or type lines, with the client, reference and deadline.
 */
export default async function EnquiriesNewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireOpsUser().catch(signInFor('/enquiries/new'))
  const parsed = z.uuid().safeParse((await searchParams).batch)
  const batchId = parsed.success ? parsed.data : null
  const [{ batches, intakeCount }, intake, manual] = await Promise.all([
    batchId
      ? getQueue({ batchId })
      : countIntake().then((n) => ({
          batches: [] as Awaited<ReturnType<typeof getQueue>>['batches'],
          intakeCount: n,
        })),
    getSetting('intake'),
    getManualEnquiry(batchId),
  ])
  const batch = batches[0] ?? null
  return (
    <T1Index header={<IntakeHeader intakeCount={intakeCount} />}>
      <div
        data-built="intake-upload"
        className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <IntakeDropArea batchId={batch?.id ?? null} maxMb={intake.maxUploadMb} />
          {batch && batch.rows.length ? <QueueCard batch={batch} /> : null}
          {batch ? <IntakeLive batchIds={[batch.id]} /> : null}
          <ManualEnquiry
            batchId={batchId}
            hasFiles={manual.hasFiles}
            clients={manual.clients}
            facts={manual.facts}
          />
        </div>
        <WhatHappensNext />
      </div>
    </T1Index>
  )
}
