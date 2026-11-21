import type { Metadata } from 'next'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'AI suggestions log — Indus Admin' }

/**
 * Recent AiSuggestion rows. Read-only audit view — every Suggest call
 * lands here regardless of accept/reject, so admins can spot e.g. a
 * model regression where every suggestion is being rejected.
 */
export default async function AiRunsPage() {
  const rows = await db.aiSuggestion.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const actorIds = Array.from(
    new Set(rows.map((r) => r.createdById).filter((id): id is string => !!id))
  )
  const actors = actorIds.length
    ? await db.staffUser.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      })
    : []
  const actorById = new Map(actors.map((a) => [a.id, a.name]))

  if (rows.length === 0) {
    return (
      <div className="border-ih-border max-w-[800px] rounded-lg border py-16 text-center">
        <p className="text-ih-muted text-[13px]">
          No AI suggestions yet. Click &ldquo;Suggest&rdquo; in any SEO drawer to generate one.
        </p>
      </div>
    )
  }

  return (
    <div className="border-ih-border max-w-full overflow-hidden rounded-lg border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-ih-border bg-ih-surface-2 border-b">
            <Th>When</Th>
            <Th>Actor</Th>
            <Th>Entity</Th>
            <Th>Field</Th>
            <Th>Output</Th>
            <Th>Status</Th>
            <Th>Cost</Th>
            <Th>Cache</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const actorName = row.createdById ? (actorById.get(row.createdById) ?? null) : null
            return (
              <tr
                key={row.id}
                className="border-ih-border hover:bg-ih-surface-2 border-b align-top last:border-0"
              >
                <td className="text-ih-muted px-3 py-3 text-[11px] whitespace-nowrap tabular-nums">
                  {row.createdAt.toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="text-ih-ink-2 px-3 py-3 text-[12px]">
                  {actorName ?? <span className="text-ih-muted">system</span>}
                </td>
                <td className="px-3 py-3 text-[11px] tabular-nums">
                  <div>{row.entityType}</div>
                  <div className="text-ih-muted max-w-[160px] truncate text-[11px]">
                    {row.entityId}
                  </div>
                </td>
                <td className="text-ih-ink-2 px-3 py-3 text-[11px] tabular-nums">{row.field}</td>
                <td className="max-w-[360px] px-3 py-3 text-[12px] break-words whitespace-pre-wrap">
                  {row.output}
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="text-ih-muted px-3 py-3 text-[11px] whitespace-nowrap tabular-nums">
                  ${(row.costUsdMicros / 1_000_000).toFixed(4)}
                </td>
                <td className="text-ih-muted px-3 py-3 text-[11px] tabular-nums">
                  {row.cacheHitRatio !== null ? `${(row.cacheHitRatio * 100).toFixed(0)}%` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'accepted'
      ? 'text-ih-success-ink bg-ih-success-soft'
      : status === 'rejected'
        ? 'text-ih-danger-ink bg-ih-danger-soft'
        : status === 'superseded'
          ? 'text-ih-muted bg-ih-surface-2'
          : 'text-ih-warning-ink bg-ih-warning-soft'
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10.5px] tracking-wider uppercase tabular-nums ${tone}`}
    >
      {status}
    </span>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-ih-muted px-3 py-2.5 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
      {children}
    </th>
  )
}
