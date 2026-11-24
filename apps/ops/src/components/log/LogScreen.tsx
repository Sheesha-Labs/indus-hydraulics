import { ButtonLink, Choices } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { EmptyState } from '@indus/ops-ui/states'
import { T1Index } from '@indus/ops-ui/templates'
import type { Route } from 'next'
import Link from 'next/link'
import type { LogPageData } from '../../data/assistant-log'
import { LOG_OUTCOMES, logQuery, type LogOutcome, type LogSearch } from '../../lib/log-params'
import LogTable from './LogTable'

/**
 * Board 111 · Assistant log: the day's summary ("Today: 41 actions · 12 asked you · …"), filters (day, record,
 * action, outcome, actor), the append-only table. Export CSV is the Owner's; a Helper sees the same feed with
 * costs and margins hidden.
 */
const OUTCOME_LABEL: Record<LogOutcome, string> = {
  approved: 'Approved',
  edited: 'Edited',
  done: 'Done',
  rejected: 'Rejected',
  undone: 'Undone',
  failed: 'Failed',
  waiting: 'Waiting',
}

export default function LogScreen({
  data,
  search,
  isOwner,
}: {
  data: LogPageData
  search: LogSearch
  isOwner: boolean
}) {
  const keep = {
    day: search.day,
    record: search.record,
    action: search.action,
    outcome: search.outcome,
    actor: search.actor,
  }
  const href = (over: Partial<LogSearch>) =>
    `/assistant/log${logQuery(keep, { cursor: undefined, ...over })}`
  const h = data.header
  const parts = [
    `${h.asked} asked you`,
    `${h.approved} approved`,
    `${h.edited} edited`,
    `${h.rejected} rejected`,
    `${h.undone} undone`,
  ]
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Assistant"
          title="Assistant log"
          {...(isOwner
            ? {
                actions: (
                  <ButtonLink
                    href={`/api/assistant/log/export${logQuery(keep)}`}
                    variant="secondary"
                  >
                    Export CSV
                  </ButtonLink>
                ),
              }
            : {})}
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <Choices<'today' | 'yesterday' | 'week'>
                aria-label="Day"
                size="sm"
                value={
                  (['today', 'yesterday', 'week'] as const).includes(search.day as 'today')
                    ? (search.day as 'today')
                    : 'today'
                }
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'yesterday', label: 'Yesterday' },
                  { value: 'week', label: 'This week' },
                ]}
                hrefFor={(v) => href({ day: v })}
              />
              <Choices<'all' | LogOutcome>
                aria-label="Outcome"
                size="sm"
                value={search.outcome ?? 'all'}
                options={[
                  { value: 'all', label: 'All outcomes' },
                  ...LOG_OUTCOMES.map((o) => ({ value: o, label: OUTCOME_LABEL[o] })),
                ]}
                hrefFor={(v) => href({ outcome: v === 'all' ? undefined : v })}
              />
              <Choices<'everyone' | 'assistant'>
                aria-label="Actor"
                size="sm"
                value={search.actor === 'assistant' ? 'assistant' : 'everyone'}
                options={[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'assistant', label: 'Assistant' },
                ]}
                hrefFor={(v) => href({ actor: v === 'assistant' ? 'assistant' : undefined })}
              />
            </div>
          }
          summary={<span>Append-only · entries cannot be deleted</span>}
        />
      }
    >
      <div className="flex flex-col gap-4" data-built="assistant-log">
        <section
          aria-label="Summary"
          className="bg-io-card border-io-line rounded-io-card flex flex-wrap items-baseline gap-x-4 gap-y-1 border px-5 py-4"
        >
          <h2 className="io-display text-[28px] leading-[1.1]">
            {h.label.split(' · ')[0]}: {h.total} {h.total === 1 ? 'action' : 'actions'}
          </h2>
          <p className="text-io-ink-2 text-[13px]">
            {parts.join(' · ')}
            {h.failed ? (
              <>
                {' · '}
                <Link
                  href={href({ outcome: 'failed' }) as Route}
                  className="text-io-bad io-focus rounded-io-tag underline underline-offset-2"
                >
                  {h.failed} failed
                </Link>
              </>
            ) : null}
          </p>
          {h.costUsd !== null ? (
            <p className="text-io-ink-3 ml-auto text-[13px] tabular-nums">
              Cost {search.day === 'today' ? 'today' : ''} USD {h.costUsd}
            </p>
          ) : null}
        </section>
        {data.days.length === 0 ? (
          <EmptyState
            mark="LG"
            title="Nothing logged here"
            text="No action matches these filters."
            align="left"
          />
        ) : (
          <div className="bg-io-card border-io-line rounded-io-card overflow-hidden border">
            <LogTable days={data.days} initialOpen={search.open ?? null} />
          </div>
        )}
        <div className="flex items-center gap-3 text-[12.5px]">
          {data.nextCursor ? (
            <ButtonLink href={href({ cursor: data.nextCursor })} variant="secondary" size="sm">
              Older entries
            </ButtonLink>
          ) : null}
          <p className="text-io-ink-3">
            Export is Owner only. A Helper sees the same feed with margins and costs hidden.
          </p>
        </div>
      </div>
    </T1Index>
  )
}
