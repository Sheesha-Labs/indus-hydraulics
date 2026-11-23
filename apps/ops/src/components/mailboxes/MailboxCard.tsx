import { Chip, ProgressBar, Tag } from '@indus/ops-ui/status'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { MailboxCardView } from '../../data/mailboxes'
import MailboxCardActions from './MailboxCardActions'
import PermissionToggles from './PermissionToggles'
import RoleChoice from './RoleChoice'

/**
 * Board 85 · one mailbox (02-map entry 85): who it is and how it is doing, its role, four health figures, the
 * backfill, what the Assistant may do in it and the Indus/ labels it adds, then Pause reading · Reconnect ·
 * Disconnect. Server-rendered; the role, the toggles and the foot are small client islands.
 */
function Figure({ value, sub }: { value: string; sub: string }) {
  return (
    <div className="bg-io-paper rounded-io-ctl flex min-h-[100px] flex-col gap-1 px-2.5 py-2.5">
      <span className="text-io-ink text-[14px] font-medium tabular-nums">{value}</span>
      <span className="text-io-ink-3 text-[11.5px] leading-[1.35]">{sub}</span>
    </div>
  )
}

export default function MailboxCard({
  card,
  canManage,
  testAddresses,
  reconnect,
  disconnect,
}: {
  card: MailboxCardView
  canManage: boolean
  testAddresses: string[]
  reconnect: ReactNode
  disconnect: ReactNode
}) {
  const ownerFirst = card.ownerName?.split(' ')[0]
  return (
    <section
      data-mailbox={card.address}
      data-state={card.status}
      aria-labelledby={`mailbox-${card.id}`}
      className="bg-io-card border-io-line rounded-io-card flex min-w-0 flex-col border"
    >
      <header className="border-io-line flex items-start gap-3 border-b px-4.5 py-4">
        <span
          aria-hidden="true"
          className="bg-io-navy rounded-io-pill flex size-10 flex-none items-center justify-center text-[13px] font-semibold text-white"
        >
          {card.ownerInitials ?? '—'}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2
            id={`mailbox-${card.id}`}
            className="text-io-ink m-0 truncate text-[15px] font-medium"
          >
            {card.address}
          </h2>
          <span className="text-io-ink-3 text-[12.5px] leading-[1.4]">
            “{card.displayName}”{ownerFirst ? ` · ${ownerFirst}` : ''}
          </span>
        </div>
        <Chip
          family="mailbox"
          status={card.statusWord}
          label={card.statusText}
          dot
          className="max-w-[46%] whitespace-normal"
        />
      </header>

      <div className="flex flex-col gap-4 px-4.5 py-4">
        <RoleChoice
          mailboxId={card.id}
          address={card.address}
          value={card.role}
          disabled={!canManage}
        />

        <dl className="m-0 grid grid-cols-4 gap-2">
          <div className="contents">
            <dt className="sr-only">Connection</dt>
            <dd className="m-0">
              <Figure
                value={card.broken ? 'Off' : card.pushLive ? 'Live' : 'Polling'}
                sub={
                  card.broken
                    ? 'reconnect to read'
                    : card.pushLive
                      ? 'push from Google'
                      : 'every 10 minutes'
                }
              />
            </dd>
          </div>
          <div className="contents">
            <dt className="sr-only">Messages read today</dt>
            <dd className="m-0">
              <Figure
                value={card.messagesToday.toLocaleString('en-US')}
                sub="messages read today"
              />
            </dd>
          </div>
          <div className="contents">
            <dt className="sr-only">Since last message</dt>
            <dd className="m-0">
              <Figure value={card.sinceLastMessage ?? '—'} sub="since last message" />
            </dd>
          </div>
          <div className="contents">
            <dt className="sr-only">Google notifications</dt>
            <dd className="m-0">
              <Figure value="Daily" sub="Google notifications renew daily — automatic" />
            </dd>
          </div>
        </dl>

        {card.backfill ? (
          <ProgressBar
            value={card.backfill.value}
            total={card.backfill.total}
            tone={card.backfill.done ? 'navy' : 'acc'}
            label={card.backfill.label}
            valueText={card.backfill.text}
          />
        ) : null}

        <p className="text-io-ink-3 m-0 text-[12px] tabular-nums">
          Sent today {card.sentToday} of {card.dailySendCap} · the limit resets at 04:00 GST
        </p>

        <div className="grid grid-cols-2 gap-4">
          <PermissionToggles
            mailboxId={card.id}
            value={card.permissions}
            allowed={card.allowed}
            sendSub={card.sendSub}
            archiveSub={card.archiveSub}
            canManage={canManage}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <span className="io-eyebrow">Labels added in Gmail</span>
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map((l) => (
                <Tag key={l} kind="assistant">
                  {l}
                </Tag>
              ))}
            </div>
            {card.sample ? (
              <div className="border-io-line rounded-io-ctl mt-1 flex flex-col gap-1 border px-3 py-2.5 text-[12.5px]">
                <span className="flex flex-wrap items-center gap-1.5">
                  <Tag kind="assistant">{card.sample.label}</Tag>
                  <b className="font-medium">{card.sample.from}</b>
                </span>
                <span className="text-io-ink-2">{card.sample.subject}</span>
              </div>
            ) : (
              <p className="text-io-ink-3 m-0 text-[12px]">No labelled mail yet.</p>
            )}
            <p className="text-io-ink-3 m-0 text-[12px] leading-[1.5]">
              Labels only. Gmail keeps the mail; the Assistant never deletes it.
            </p>
            {card.signatureLines.length ? (
              <div className="mt-2 flex flex-col gap-1">
                <span className="io-eyebrow">Signature</span>
                <div className="text-io-ink-2 text-[12px] leading-[1.5]">
                  {card.signatureLines.slice(0, 4).map((line, i) => (
                    <div key={`${i}-${line}`}>{line}</div>
                  ))}
                </div>
                <Link
                  href="/settings/sending#signatures"
                  className="io-focus text-io-accent self-start text-[12px]"
                >
                  Edit
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <MailboxCardActions
          mailboxId={card.id}
          address={card.address}
          paused={card.paused}
          canManage={canManage}
          testAddresses={testAddresses}
          reconnect={reconnect}
          disconnect={disconnect}
        />
      </div>
    </section>
  )
}
