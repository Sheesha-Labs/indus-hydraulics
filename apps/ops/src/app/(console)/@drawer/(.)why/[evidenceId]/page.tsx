import WhyDrawer from '../../../../../components/why/WhyDrawer'
import { getWhy } from '../../../../../data/why'
import { AccessError, requireOpsUser } from '../../../../../lib/access'

/**
 * Why? over the page (05 §6.3, S06-T05): an evidence link followed inside the console is intercepted into
 * the `@drawer` slot, so the page underneath stays put and Back closes the drawer. A reload or a new tab
 * renders `why/[evidenceId]/page.tsx` instead. Signed out, the slot shows nothing (the page underneath
 * redirects to sign-in itself). A malformed or unknown id opens the drawer in its not-found state.
 * Gotcha: `../default.tsx` and `../[...catchAll]/page.tsx` must keep returning null (see their comments).
 */
export default async function WhyDrawerSlot({
  params,
}: {
  params: Promise<{ evidenceId: string }>
}) {
  let user
  try {
    user = await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) return null
    throw error
  }
  const { evidenceId } = await params
  const view = await getWhy(evidenceId, user)
  // Keyed by id: following a history row's link to other evidence opens fresh tabs and state.
  return <WhyDrawer key={evidenceId} view={view} />
}
