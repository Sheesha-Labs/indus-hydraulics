import { EmptyState } from '@indus/ops-ui/states'
import { T1Index } from '@indus/ops-ui/templates'
import IntakeDropArea from '../../../../components/intake/IntakeDropArea'
import IntakeHeader from '../../../../components/intake/IntakeHeader'
import IntakeLive from '../../../../components/intake/IntakeLive'
import QueueCard from '../../../../components/intake/QueueCard'
import WhatHappensNext from '../../../../components/intake/WhatHappensNext'
import { getQueue } from '../../../../data/intake'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { getSetting } from '../../../../server/settings/get'

/**
 * Board 14 · Intake (S08-T03): every open intake, newest first, each with its processing queue; mail intakes
 * the Assistant opened sit here beside uploads. A drop here starts a new upload.
 */
export default async function EnquiriesIntakePage() {
  await requireOpsUser().catch(signInFor('/enquiries/intake'))
  const [{ batches, intakeCount }, intake] = await Promise.all([getQueue({}), getSetting('intake')])
  return (
    <T1Index header={<IntakeHeader intakeCount={intakeCount} />}>
      <div
        data-built="intake-queue"
        className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <IntakeDropArea batchId={null} maxMb={intake.maxUploadMb} />
          {batches.length ? (
            batches.map((b) => <QueueCard key={b.id} batch={b} />)
          ) : (
            <EmptyState
              title="Nothing waiting"
              text="Files you drop here, and enquiries read from mail, queue here until a person confirms their lines."
            />
          )}
          {batches.length ? <IntakeLive batchIds={batches.map((b) => b.id)} /> : null}
        </div>
        <WhatHappensNext />
      </div>
    </T1Index>
  )
}
