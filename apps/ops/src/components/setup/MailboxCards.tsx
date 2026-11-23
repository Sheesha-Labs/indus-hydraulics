import { Banner, Check, Chip } from '@indus/ops-ui/status'
import Link from 'next/link'
import type { ConnectContext, ConnectReturn, SetupMailboxCard } from '../../data/mailboxes'
import ConnectFlowHost from '../mailboxes/ConnectFlowHost'

/**
 * Board 80 · Setup 2: the Client mailbox (sales@) and Supplier mailbox (purchase@) cards. A connected card shows
 * who connected it, what the Assistant may do there, and the signature detected from Gmail; a card not yet
 * connected offers Connect with Google, which opens the board 86 flow at "Before Google asks" with the role
 * and address already chosen.
 */
const ALLOWED = [
  'Read mail and attachments',
  'Create drafts',
  'Send, only as your rules allow',
  'Add Indus/ labels',
]

export default function MailboxCards({
  cards,
  context,
  back,
}: {
  cards: SetupMailboxCard[]
  context: ConnectContext
  back: ConnectReturn | null
}) {
  const modal = {
    returnTo: 'setup' as const,
    domain: context.domain,
    dataLocation: context.dataLocation,
    ownerName: context.ownerName,
    allowedRoles: context.allowedRoles,
    basePath: '/setup/mailboxes' as const,
  }
  return (
    <div className="flex max-w-[880px] flex-col gap-4">
      <Banner tone="info">
        Clients hear from sales@, suppliers from purchase@ — the Assistant keeps them apart.
      </Banner>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => {
          const local = card.address.split('@')[0]
          const title =
            card.role === 'client' ? `Client mailbox · ${local}@` : `Supplier mailbox · ${local}@`
          const sub =
            card.role === 'client'
              ? 'Quotations, client replies and POs are sent from here.'
              : `Supplier RFQs, chasers and supplier POs, Cc ${cards[0]?.address.split('@')[0] ?? 'sales'}@.`
          return (
            <section
              key={card.role}
              data-mailbox-card={card.role}
              className="bg-io-card border-io-line rounded-io-card flex min-h-[472px] flex-col gap-4 border p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-io-card-title m-0">{title}</h2>
                {card.connected ? (
                  card.canSend ? (
                    <Chip tone="ok" label="Connected" />
                  ) : (
                    <Chip tone="warn" label="Drafts only · can’t send" />
                  )
                ) : (
                  <Chip tone="n" label="Not connected" />
                )}
              </div>
              <p className="text-io-ink-2 m-0 text-[13px]">{sub}</p>
              {card.connected ? (
                <>
                  <div className="bg-io-fill rounded-io-ctl flex items-center gap-3 px-3 py-2.5">
                    <span className="bg-io-navy rounded-io-pill flex size-8 flex-none items-center justify-center text-[11px] font-semibold text-white">
                      {card.ownerInitials ?? '—'}
                    </span>
                    <span className="flex min-w-0 flex-col text-[12.5px]">
                      <span className="text-io-ink truncate font-medium">{card.address}</span>
                      <span className="text-io-ink-3">
                        {card.ownerName ?? 'Owner'} · Google Workspace
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="io-eyebrow">Allowed</span>
                    {ALLOWED.map((a, i) => (
                      <Check key={a} mark={i === 2 && !card.canSend ? 'n' : 'ok'} label={a} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="io-eyebrow">Signature detected from Gmail</span>
                    {card.signatureLines.length ? (
                      <div className="border-io-line rounded-io-ctl text-io-ink border px-3 py-2.5 text-[12.5px] leading-[1.55]">
                        {card.signatureLines.map((line, i) => (
                          <div key={`${i}-${line}`}>{line}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-io-ink-3 m-0 text-[12.5px]">
                        No Gmail signature found yet.
                      </p>
                    )}
                    <Link
                      href="/settings/sending"
                      className="io-focus text-io-accent text-[12.5px]"
                    >
                      Edit signature
                    </Link>
                  </div>
                  {!card.canSend ? (
                    <ConnectFlowHost
                      {...modal}
                      trigger="Grant send permission"
                      preset={{ role: card.role, address: card.address, step: 2 }}
                    />
                  ) : null}
                </>
              ) : (
                <div className="mt-auto mb-auto flex flex-col items-stretch gap-3 pt-24">
                  <ConnectFlowHost
                    {...modal}
                    trigger="Connect with Google"
                    preset={{ role: card.role, address: card.address, step: 2 }}
                  />
                  <p className="text-io-ink-3 m-0 text-center text-[12px] leading-[1.5]">
                    Sign in as {local}@.
                    {card.role === 'supplier'
                      ? ' Your helper can do this later from their own account.'
                      : ''}
                  </p>
                </div>
              )}
            </section>
          )
        })}
      </div>
      <p className="text-io-ink-3 m-0 text-[12px]">
        Full mailbox settings, sending rules and connection health live in Settings › Mailboxes.
      </p>
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
