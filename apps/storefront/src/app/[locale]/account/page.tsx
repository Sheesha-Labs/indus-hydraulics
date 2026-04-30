import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { auth } from '../../../lib/auth'
import { db } from '@indus/db'
import Link from 'next/link'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('dashboard.title') }
}

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params
  const session = await auth()
  const t = await getTranslations({ locale, namespace: 'account' })

  const contact = session?.user?.id
    ? await db.accountContact.findUnique({
        where: { id: session.user.id },
        include: { account: true },
      })
    : null

  const openRfqs = await db.rfq.findMany({
    where: {
      accountId: contact?.accountId ?? '',
      status: { in: ['draft', 'submitted', 'engineer_review', 'engineer_questions_pending', 'quote_sent'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { lines: true },
  })

  const savedLists = await db.savedList.findMany({
    where: { accountId: contact?.accountId ?? '' },
    orderBy: { updatedAt: 'desc' },
    take: 4,
    include: { _count: { select: { items: true } } },
  })

  const now = new Date()
  const dayOfWeek = now.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'long' })
  const dateStr = now.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const firstName = contact?.firstName ?? session?.user?.name?.split(' ')[0] ?? 'there'

  const statusColors: Record<string, string> = {
    draft: 'text-[var(--color-muted)] bg-[var(--color-deep)] border border-[var(--color-border)]',
    submitted: 'text-[oklch(0.45_0.15_270)] bg-[oklch(0.96_0.04_270)]',
    engineer_review: 'text-[var(--color-accent)] bg-[oklch(0.97_0.04_60)]',
    engineer_questions_pending: 'text-[var(--color-warn)] bg-[oklch(0.97_0.04_80)]',
    quote_sent: 'text-[oklch(0.4_0.15_270)] bg-[oklch(0.96_0.04_270)]',
  }

  const statusLabel: Record<string, string> = {
    draft: 'DRAFT',
    submitted: 'SUBMITTED',
    engineer_review: 'ENGINEER',
    engineer_questions_pending: 'QUESTIONS',
    quote_sent: 'APPROVE',
  }

  return (
    <section>
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
          {t('dashboard.greeting')} · {dayOfWeek.toUpperCase()} {dateStr.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-semibold tracking-tight mt-1.5">
          {t('dashboard.welcomeBack', { name: firstName })}
        </h1>
        {openRfqs.some((r) => r.status === 'quote_sent') && (
          <p className="text-[var(--color-muted)] mt-1.5 text-sm">
            {t('dashboard.quotesNeedApproval', {
              count: openRfqs.filter((r) => r.status === 'quote_sent').length,
            })}
          </p>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label={t('dashboard.kpiOpenRfqs')}
          value={String(openRfqs.filter((r) => r.status !== 'draft').length)}
          note={
            openRfqs.some((r) => r.urgency === 'plant_down') ? (
              <span className="text-[var(--color-danger)] font-mono text-[11px]">● {t('dashboard.plantDown')}</span>
            ) : null
          }
        />
        <KpiCard
          label={t('dashboard.kpiAwaitingApproval')}
          value={String(openRfqs.filter((r) => r.status === 'quote_sent').length)}
          note={<span className="text-[var(--color-accent)] font-mono text-[11px]">{t('dashboard.replyByDeadline')}</span>}
        />
        <KpiCard
          label={t('dashboard.kpiTier')}
          value={contact?.account?.tier ? capitalise(String(contact.account.tier)) : '—'}
          note={<span className="text-[var(--color-muted)] font-mono text-[11px]">{t('dashboard.tierNote')}</span>}
        />
        <KpiCard
          label={t('dashboard.kpiSavedLists')}
          value={String(savedLists.length)}
          note={null}
        />
      </div>

      {/* Active quotes table */}
      <h2 className="text-[18px] font-semibold mb-3">{t('dashboard.activeQuotes')}</h2>
      <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden mb-8">
        <div className="grid grid-cols-[140px_1fr_80px_100px_120px] gap-3.5 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
          <span>{t('dashboard.rfqNum')}</span>
          <span>{t('dashboard.linesEngineer')}</span>
          <span className="text-right">{t('dashboard.lines')}</span>
          <span className="text-right">{t('dashboard.estimate')}</span>
          <span className="text-right">{t('dashboard.status')}</span>
        </div>

        {openRfqs.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
            {t('dashboard.noOpenRfqs')}
          </div>
        ) : (
          openRfqs.map((rfq) => (
            <Link
              key={rfq.id}
              href={`/${locale}/quote/${rfq.code}`}
              className="grid grid-cols-[140px_1fr_80px_100px_120px] gap-3.5 px-4 py-3.5 border-b border-[var(--color-border-2)] items-center text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
            >
              <span className="font-mono text-[13px]">{rfq.code}</span>
              <div>
                <div className="font-medium text-sm">{rfq.subject ?? t('dashboard.noDescription')}</div>
                <div className="font-mono text-[11px] text-[var(--color-muted)]">
                  {rfq.urgency === 'plant_down' ? t('dashboard.plantDown') : capitalise(rfq.urgency ?? 'routine')}
                </div>
              </div>
              <span className="font-mono text-right text-sm">{rfq.lines.length}</span>
              <span className="font-mono text-right text-sm">—</span>
              <span className="text-right">
                <span className={`font-mono text-[11px] px-2 py-0.5 ${statusColors[rfq.status] ?? ''}`}>
                  ● {statusLabel[rfq.status] ?? rfq.status.toUpperCase()}
                </span>
              </span>
            </Link>
          ))
        )}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Saved lists */}
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <h3 className="text-[15px] font-semibold mb-3">{t('nav.savedLists')}</h3>
          {savedLists.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">{t('dashboard.noSavedLists')}</p>
          ) : (
            <div className="flex flex-col gap-2 text-[13px]">
              {savedLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/${locale}/account/lists/${list.id}`}
                  className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-2)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <span>📋 {list.name}</span>
                  <span className="font-mono text-[var(--color-muted)] text-[11px]">
                    {list._count.items} SKUs
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Get a quote CTA */}
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-semibold mb-2">{t('dashboard.startNewRfq')}</h3>
            <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
              {t('dashboard.startNewRfqBody')}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Link
              href={`/${locale}/quote`}
              className="flex-1 h-10 flex items-center justify-center bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('dashboard.buildQuote')} →
            </Link>
            <Link
              href={`/${locale}/c`}
              className="flex-1 h-10 flex items-center justify-center border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-deep)] transition-colors"
            >
              {t('dashboard.browseCatalogue')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function KpiCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: React.ReactNode
}) {
  return (
    <div className="p-4 border border-[var(--color-border)] bg-[var(--color-elevated)]">
      <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">{label}</p>
      <p className="font-mono text-[28px] font-semibold mt-1.5">{value}</p>
      {note && <div className="mt-1">{note}</div>}
    </div>
  )
}

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}
