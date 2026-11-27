import { ButtonLink } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { TIER_TONE, TIER_WORD, type SupplierProfilePage } from '../../data/suppliers'
import { SectionCard } from './ClientProfileParts'

/**
 * Board 129 parts (S10-T03, `#s129`) and the board 133 states that render inside it: What they carry (bars),
 * Authorised for (✓ on the maker's locator, ! claimed only), Recent, the Reliability paragraph with its basis line
 * (only with 3 or more replies), and the rail: Tier, Contacts, Documents (expiry countdown), Bank (last 4 only).
 */
type Page = SupplierProfilePage

const MARK: Record<'ok' | 'warn' | 'bad' | 'n', { sign: string; cls: string; word: string }> = {
  ok: { sign: '✓', cls: 'bg-io-ok-tint text-io-ok', word: 'Done' },
  warn: { sign: '!', cls: 'bg-io-warn-tint text-io-warn', word: 'Attention' },
  bad: { sign: '×', cls: 'bg-io-bad-tint text-io-bad', word: 'Problem' },
  n: { sign: '–', cls: 'bg-io-fill text-io-ink-3', word: 'Note' },
}

export function Mark({ tone }: { tone: keyof typeof MARK }) {
  const m = MARK[tone]
  return (
    <span
      role="img"
      aria-label={m.word}
      className={`${m.cls} rounded-io-pill flex size-[18px] flex-none items-center justify-center text-[11px] font-semibold`}
    >
      {m.sign}
    </span>
  )
}

function Row({
  mark,
  title,
  sub,
  right,
}: {
  mark: keyof typeof MARK
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
}) {
  return (
    <li className="border-io-line flex items-start gap-3 border-t py-3 first:border-t-0">
      <Mark tone={mark} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px]">{title}</span>
        {sub ? <span className="text-io-ink-3 text-[12px]">{sub}</span> : null}
      </span>
      {right ? <span className="flex-none text-[12px]">{right}</span> : null}
    </li>
  )
}

const ext = (href: string, label: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="io-focus rounded-io-tag text-io-accent"
  >
    {label}
  </a>
)

export function CarryCard({ page }: { page: Page }) {
  const max = Math.max(1, ...page.carry.map((c) => c.value))
  return (
    <section
      aria-label="What they carry"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-3">What they carry · {page.carryNote}</h2>
      {page.carry.length ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {page.carry.map((c) => (
            <li
              key={c.key}
              className="grid grid-cols-[200px_minmax(0,1fr)_28px] items-center gap-4 text-[12.5px]"
            >
              <span className="truncate">{c.label}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="h-1.5 w-full"
              >
                <rect x="0" y="0" width="100" height="6" rx="1" className="fill-io-fill" />
                <rect
                  x="0"
                  y="0"
                  width={Math.max(2, (c.value / max) * 100)}
                  height="6"
                  rx="1"
                  className="fill-io-accent"
                />
              </svg>
              <span className="text-right">{c.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          No categories yet: set the line card, or let quotes teach it.
        </p>
      )}
    </section>
  )
}

export function AuthorisedCard({ page }: { page: Page }) {
  return (
    <section
      aria-label="Authorised for"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-1">Authorised for</h2>
      {page.authorised.length ? (
        <ul className="m-0 list-none p-0">
          {page.authorised.map((a) => (
            <Row
              key={a.id}
              mark={a.mark}
              title={a.title}
              sub={a.sub}
              right={a.href ? ext(a.href, a.hrefLabel) : null}
            />
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 mt-2 text-[12.5px]">No brand authorisation on record.</p>
      )}
    </section>
  )
}

export function RecentCard({
  items,
}: {
  items: Array<{
    key: string
    mark: 'ok' | 'warn' | 'n'
    title: string
    sub: string
    href: string | null
    hrefLabel: string
  }>
}) {
  return (
    <section
      aria-label="Recent"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-1">Recent</h2>
      {items.length ? (
        <ul className="m-0 list-none p-0">
          {items.map((r) => (
            <Row
              key={r.key}
              mark={r.mark}
              title={r.title}
              sub={r.sub}
              right={
                r.href ? (
                  <Link href={r.href as Route} className="io-focus rounded-io-tag text-io-accent">
                    {r.hrefLabel}
                  </Link>
                ) : null
              }
            />
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 mt-2 text-[12.5px]">
          No RFQs, quotes or orders with this supplier yet.
        </p>
      )}
    </section>
  )
}

export function ReliabilityCard({ page }: { page: Page }) {
  return (
    <section
      aria-label="Reliability"
      className="border-io-accent-line bg-io-accent-faint rounded-io-card border px-5 py-4"
      data-part="reliability"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="io-eyebrow m-0">Reliability</h2>
        <Chip tone="navy" size="sm" label="Assistant" />
      </div>
      {page.reliability ? (
        <>
          <p className="m-0 text-[14px] leading-[1.6]">{page.reliability.text}</p>
          <p className="text-io-ink-3 m-0 mt-2 text-[12px]">{page.reliability.basis}</p>
        </>
      ) : (
        <p className="text-io-ink-2 m-0 text-[13px] leading-[1.55]" data-state="no-history">
          {page.reliabilityThin
            ? 'Not enough history to judge yet: the summary appears after 3 replies. Treat as untested; compare with a second supplier.'
            : 'The summary is written tonight from the latest figures.'}
        </p>
      )}
    </section>
  )
}

export function TierCard({ page, isOwner }: { page: Page; isOwner: boolean }) {
  const h = page.header
  const facts = [
    h.tierSince ? `Since ${h.tierSince}` : null,
    page.stats.pos ? `${page.stats.pos} POs` : null,
    page.screenedAt ? `sanctions clear ${page.screenedAt}` : 'not screened yet',
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <section
      aria-label="Tier"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-3">Tier</h2>
      <Chip tone={TIER_TONE[h.tier]} label={TIER_WORD[h.tier]} className="w-full" />
      <p className="text-io-ink-3 m-0 mt-2 text-[12px]">{facts}</p>
      {h.trial ? (
        <p className="m-0 mt-2 text-[12px]" data-state="trial-limit">
          {h.trial.used >= h.trial.limit
            ? `${h.trial.used} of ${h.trial.limit} trial POs used; the next PO waits for Approved or a one-off approval by Krishan.`
            : `Trial · ${h.trial.used} of ${h.trial.limit} POs, each up to ${h.trial.maxUsd}`}
        </p>
      ) : null}
      {h.blocked ? (
        <p className="text-io-bad m-0 mt-2 text-[12px]" data-state="blocked">
          Blocked{h.blocked.at ? ` ${h.blocked.at}` : ''} · {h.blocked.reason}. Never suggested; RFQ
          drafts adding them are stopped.
        </p>
      ) : null}
      {h.tier !== 'blocked' ? (
        <div className="mt-3 flex gap-2">
          {h.tier !== 'principal' ? (
            <ButtonLink size="sm" href={`/suppliers/${h.id}/promote` as Route}>
              {h.tier === 'approved'
                ? 'Promote to Principal'
                : h.tier === 'trial'
                  ? 'Promote to Approved'
                  : 'Promote to Trial'}
            </ButtonLink>
          ) : null}
          <ButtonLink size="sm" variant="danger" href={`/suppliers/${h.id}/block` as Route}>
            Block
          </ButtonLink>
        </div>
      ) : isOwner ? (
        <div className="mt-3">
          <ButtonLink size="sm" href={`/suppliers/${h.id}/block?unblock=1` as Route}>
            Unblock
          </ButtonLink>
        </div>
      ) : null}
    </section>
  )
}

export function ContactsRail({ page }: { page: Page }) {
  return (
    <section
      aria-label="Contacts"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-1">Contacts</h2>
      {page.contacts.length ? (
        <ul className="m-0 list-none p-0">
          {page.contacts.map((c) => {
            const bouncing = c.status === 'bouncing'
            return (
              <Row
                key={c.id}
                mark={bouncing || !c.sendable ? 'bad' : c.outOfOfficeUntil ? 'warn' : 'ok'}
                title={[c.name, c.role, c.preferred ? 'preferred' : null]
                  .filter(Boolean)
                  .join(' · ')}
                sub={
                  bouncing
                    ? 'Bouncing · removed from RFQs'
                    : !c.sendable
                      ? 'Directory listing only · not used for mail'
                      : c.outOfOfficeUntil
                        ? `Out of office until ${c.outOfOfficeUntil} · chasers pause`
                        : [c.email, c.phone].filter(Boolean).join(' · ')
                }
                right={c.sourceUrl ? ext(c.sourceUrl, 'Page') : null}
              />
            )
          })}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 mt-2 text-[12.5px]">No contacts yet.</p>
      )}
    </section>
  )
}

export function DocumentsRail({ page }: { page: Page }) {
  return (
    <section
      aria-label="Documents"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-1">Documents</h2>
      {page.documents.length ? (
        <ul className="m-0 list-none p-0">
          {page.documents.map((d) => (
            <Row
              key={d.id}
              mark={d.tone}
              title={d.title}
              sub={
                d.expires
                  ? d.daysLeft !== null && d.daysLeft < 0
                    ? `Expired ${d.expires}`
                    : `Expires ${d.expires}${d.daysLeft !== null && d.daysLeft <= 30 ? ` · ${d.daysLeft} days` : ''}`
                  : d.status === 'requested'
                    ? 'Requested'
                    : 'No expiry recorded'
              }
            />
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 mt-2 text-[12.5px]">No documents on file.</p>
      )}
    </section>
  )
}

export function BankRail({ page, isOwner }: { page: Page; isOwner: boolean }) {
  const b = page.bank
  return (
    <section
      aria-label="Bank"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-2">Bank</h2>
      {b ? (
        <div className="flex flex-col gap-1 text-[12.5px]">
          {isOwner && b.name ? (
            <span>
              {b.name} <span className="text-io-ink-3">{b.masked}</span>
            </span>
          ) : null}
          <span className={b.status === 'Bank change pending' ? 'text-io-bad' : 'text-io-ink-2'}>
            {b.status}
          </span>
          {page.header.bankChangeAccountId ? (
            <Link
              href={
                `/suppliers/${page.header.id}/bank-change/${page.header.bankChangeAccountId}` as Route
              }
              className="io-focus rounded-io-tag text-io-accent"
            >
              Open the bank-change alert
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">No bank details on file.</p>
      )}
      {page.timezone ? (
        <p className="text-io-ink-3 m-0 mt-2 text-[12px]">Time zone {page.timezone}</p>
      ) : null}
    </section>
  )
}

/** Board 133 state 2: "Also known as … · combined <date>". */
export function MergedNote({ page }: { page: Page }) {
  if (!page.header.mergedFrom.length && !page.header.aliases.length) return null
  const combined = page.header.mergedFrom.map((m) => `${m.name} · combined ${m.at}`)
  return (
    <p className="text-io-ink-3 m-0 text-[12px]" data-state="merged">
      Also known as {[...page.header.aliases, ...combined].join('; ')}
    </p>
  )
}

export { SectionCard }
