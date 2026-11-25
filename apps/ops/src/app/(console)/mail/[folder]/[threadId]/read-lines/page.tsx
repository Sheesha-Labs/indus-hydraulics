import { PageHeader } from '@indus/ops-ui/shell'
import { notFound } from 'next/navigation'
import EmailLinesWorkspace from '../../../../../../components/intake/email/EmailLinesWorkspace'
import { getEmailLines } from '../../../../../../data/email-lines'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../../lib/route-params'

/**
 * Board 36 · Read lines from email (S08-T05), step 3 of Source · Map · Review · Match. The message with its
 * sources marked beside the facts and lines read from it; arriving here opens the message's intake once.
 */
export default async function MailReadLinesPage({
  params,
}: {
  params: Promise<{ folder: string; threadId: string }>
}) {
  const { folder, threadId } = await params
  await requireOpsUser().catch(signInFor(`/mail/${folder}/${threadId}/read-lines`))
  routeParam(recordId, threadId)
  if (!/^[a-z_-]{1,40}$/.test(folder)) notFound()
  const model = await getEmailLines(folder, threadId)
  if (!model) notFound()
  return (
    <div className="flex h-screen min-h-0 min-w-0 flex-col overflow-hidden">
      <PageHeader
        crumb={`Inbox / ${model.message.subject}`}
        title="Read lines from email"
        steps={[
          { label: '1 Source', state: 'done' },
          { label: '2 Map', state: 'done' },
          { label: '3 Review', state: 'current' },
          { label: '4 Match', state: 'todo' },
        ]}
      />
      <EmailLinesWorkspace model={model} />
    </div>
  )
}
