import { redirect } from 'next/navigation'
import ToastsSpecimen from '../../../../../kit/surfaces/ToastsSpecimen'
import { AccessError, requireOpsUser } from '../../../../../lib/access'

/**
 * /_kit/surfaces/toasts: the S07b toast stack inside AppShell (S02-T09), for the shell-surfaces parity spec.
 * Gated like the template specimens (never in production, only with OPS_KIT=1).
 */
export default async function ToastsSpecimenPage() {
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) redirect('/sign-in?next=%2F_kit%2Fsurfaces%2Ftoasts')
    throw error
  }
  return <ToastsSpecimen />
}
