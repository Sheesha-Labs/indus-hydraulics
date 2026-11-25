import { enquiryRefOf } from '@indus/ops-core'
import EnquirySeedCard from '../../../../components/settings/EnquirySeedCard'
import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { currentEnquiryYear, proposeEnquirySeed } from '../../../../server/numbering/enquiry-seed'

/**
 * Settings › numbering (T7 body; the layout draws the header and sub-nav). S08-T06 adds the Owner's ENQ seed
 * card (C5); S11 builds board 214 around it.
 */
export default async function SettingsNumberingPage() {
  const user = await requireOpsUser().catch(signInFor(`/settings/numbering`))
  const year = currentEnquiryYear()
  const p = await proposeEnquirySeed(year)
  return (
    <div className="flex flex-col gap-4">
      <EnquirySeedCard
        v={{
          year,
          legacyMaxRef: p.legacyMax ? enquiryRefOf(year, p.legacyMax) : null,
          opsNextRef: p.opsNext ? enquiryRefOf(year, p.opsNext) : null,
          proposedNext: p.proposedNext,
          proposedRef: p.proposedRef,
          outOfStep: p.outOfStep,
          isOwner: user.role === 'owner',
        }}
      />
      <Arrives sprint="S11" what="Board 214: the number format of every document series." />
    </div>
  )
}
