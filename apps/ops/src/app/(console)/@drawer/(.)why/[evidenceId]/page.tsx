import WhyDrawer from '../../../../../components/shell/WhyDrawer'
import { evidenceIdSchema, getEvidence } from '../../../../../data/evidence'
import { AccessError, requireOpsUser } from '../../../../../lib/access'

/**
 * S04 · Why? over the page (05 §6.3): an evidence link followed inside the console is intercepted into the
 * `@drawer` slot, so the page underneath stays put and Back closes the drawer. A reload or a new tab
 * renders `why/[evidenceId]/page.tsx` instead. Signed out, the slot shows nothing (the page underneath
 * redirects to sign-in itself). A malformed or unknown id opens the drawer in its not-found state.
 */
export default async function WhyDrawerSlot({
  params,
}: {
  params: Promise<{ evidenceId: string }>
}) {
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) return null
    throw error
  }
  const { evidenceId } = await params
  const valid = evidenceIdSchema.safeParse(evidenceId)
  const evidence = valid.success ? await getEvidence(valid.data) : null
  // Keyed by id: following a reason's link to other evidence opens fresh tabs and state.
  return <WhyDrawer key={evidenceId} evidence={evidence} />
}
