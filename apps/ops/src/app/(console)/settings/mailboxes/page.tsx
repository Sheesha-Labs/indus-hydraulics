import ConnectFlowHost from '../../../../components/mailboxes/ConnectFlowHost'
import { getConnectContext, readConnectReturn } from '../../../../data/mailboxes'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/**
 * Settings › Mailboxes (T7 body; the layout draws the header and sub-nav). S04-T02 hosts the board 86 connect
 * flow here, including Google's return to step 4; S04-T07 draws the board 85 mailbox cards around it.
 */
export default async function SettingsMailboxesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/settings/mailboxes'))
  const [context, back] = await Promise.all([
    getConnectContext(user),
    searchParams.then(readConnectReturn),
  ])
  const modal = {
    returnTo: 'settings' as const,
    domain: context.domain,
    dataLocation: context.dataLocation,
    ownerName: context.ownerName,
    allowedRoles: context.allowedRoles,
    basePath: '/settings/mailboxes' as const,
  }
  return (
    <div data-built="mailboxes" className="flex flex-col gap-4">
      {context.allowedRoles.length ? (
        <ConnectFlowHost {...modal} trigger="+ Connect another mailbox" />
      ) : null}
      {back ? (
        <ConnectFlowHost
          {...modal}
          openOnLoad
          initial={{
            step: 4,
            outcome: back.outcome,
            mailbox: back.mailbox,
            ...(back.role ? { role: back.role } : {}),
          }}
        />
      ) : null}
    </div>
  )
}
