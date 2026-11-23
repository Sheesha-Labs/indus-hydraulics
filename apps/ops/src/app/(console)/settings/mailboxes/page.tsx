import { Button } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import ConnectFlowHost from '../../../../components/mailboxes/ConnectFlowHost'
import MailboxCard from '../../../../components/mailboxes/MailboxCard'
import { getConnectContext, getMailboxesPage, readConnectReturn } from '../../../../data/mailboxes'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/**
 * Board 85 · Settings › Mailboxes (T7 body; the layout draws the header, its "Sending rules" action and the
 * sub-nav). Every mailbox as a card, then "+ Connect another mailbox". The board 86 connect flow is hosted here,
 * including Google's return to step 4.
 */
export default async function SettingsMailboxesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/settings/mailboxes'))
  const [page, context, back] = await Promise.all([
    getMailboxesPage(user),
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
  const signers = [
    ...new Set(page.cards.map((c) => c.ownerName?.split(' ')[0]).filter((n): n is string => !!n)),
  ]
  const blocks = signers.length
    ? `${signers.map((n) => `${n}’s`).join(' or ')} block`
    : 'each sender’s block'
  const ownerFirst = context.ownerName.split(' ')[0] ?? 'the Owner'
  return (
    <div data-built="mailboxes" className="flex flex-col gap-4">
      <Banner tone="info" title="No more “Please address” forwards.">
        Client threads no longer need forwarding from sales@ to purchase@: the Assistant reads both
        mailboxes and links supplier work to the enquiry. Gmail signatures are not added to mail
        sent by the console, so the console inserts {blocks} itself (Settings › Sending).
      </Banner>

      {page.cards.length ? (
        <div className="grid grid-cols-2 gap-4">
          {page.cards.map((card) => (
            <MailboxCard
              key={card.id}
              card={card}
              canManage={page.canManage}
              testAddresses={page.testAddresses}
              reconnect={
                context.allowedRoles.includes(card.role) ? (
                  <ConnectFlowHost
                    {...modal}
                    trigger="Reconnect"
                    preset={{ role: card.role, address: card.address, step: 2 }}
                  />
                ) : null
              }
              disconnect={
                page.canManage ? (
                  <Button variant="danger" disabled title="Disconnect arrives with board 90">
                    Disconnect
                  </Button>
                ) : null
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-io-ink-3 m-0 text-[13px]">No mailbox is connected yet.</p>
      )}

      {context.allowedRoles.length ? (
        <div className="border-io-stroke rounded-io-card flex items-center gap-3 border border-dashed px-4.5 py-3.5">
          <ConnectFlowHost {...modal} trigger="+ Connect another mailbox" triggerVariant="link" />
          <span className="text-io-ink-3 text-[12.5px]">
            e.g. accounts@ as Read-only, or {ownerFirst}’s own address as Personal
          </span>
        </div>
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
