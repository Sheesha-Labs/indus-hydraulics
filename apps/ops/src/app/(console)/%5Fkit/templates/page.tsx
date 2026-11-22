import { redirect } from 'next/navigation'
import TemplatesIndex from '../../../../kit/sections/Templates'
import { AccessError, requireOpsUser } from '../../../../lib/access'

/** /_kit/templates: the list of template specimens. */
export default async function TemplatesPage() {
  try {
    await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) redirect('/sign-in?next=%2F_kit%2Ftemplates')
    throw error
  }
  return <TemplatesIndex />
}
